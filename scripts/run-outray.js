const fs = require("fs");
const path = require("path");

const outrayDir = path.join(process.env.APPDATA || "", "npm/node_modules/outray/dist");
const { OutRayClient } = require(path.join(outrayDir, "client.js"));
const { ConfigManager } = require(path.join(outrayDir, "config.js"));
const { AuthManager } = require(path.join(outrayDir, "auth.js"));

const webUrl = "https://outray.dev";
const serverUrl = "wss://api.outray.dev/";
const localPort = 8000;

async function start() {
  const configManager = new ConfigManager();
  let config = configManager.load();
  if (!config) {
    console.error("Not logged into OutRay");
    process.exit(1);
  }

  let apiKey = config.orgToken || config.userToken || config.apiKey;
  if (!apiKey && config.userToken) {
    const authManager = new AuthManager(webUrl, config.userToken);
    const orgs = await authManager.fetchOrganizations();
    if (orgs.length > 0) {
      const activeOrg = orgs[0];
      const { orgToken } = await authManager.exchangeToken(activeOrg.id);
      apiKey = orgToken;
    }
  }

  console.log("Starting OutRay client with API Key for port " + localPort);
  const client = new OutRayClient(
    localPort,
    serverUrl,
    apiKey,
    undefined, // subdomain
    undefined, // customDomain
    false,     // noLogs
    false,     // enableLocal
    undefined, // password
    false      // showQr
  );

  // Intercept WebSocket message to extract assigned URL
  const originalHandleMessage = client.handleMessage.bind(client);
  client.handleMessage = function (data) {
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.type === "open_tunnel_ack" && parsed.assignedUrl) {
        const liveUrl = `https://${parsed.assignedUrl}`;
        console.log(`\n========================================`);
        console.log(`✨ OUTRAY TUNNEL LIVE: ${liveUrl}`);
        console.log(`========================================\n`);

        const rootDir = path.resolve(__dirname, "..");
        const endpointFile = path.join(rootDir, "outray_endpoint.txt");
        const envLocal = path.join(rootDir, "kureva-web", ".env.local");
        const envProd = path.join(rootDir, "kureva-web", ".env.production");

        fs.writeFileSync(endpointFile, liveUrl, "utf8");
        fs.writeFileSync(envLocal, `NEXT_PUBLIC_API_URL=${liveUrl}\n`, "utf8");
        fs.writeFileSync(envProd, `NEXT_PUBLIC_API_URL=${liveUrl}\n`, "utf8");
      }
    } catch (e) {
      // ignore
    }
    return originalHandleMessage(data);
  };

  client.start();

  process.on("SIGINT", () => {
    client.stop();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    client.stop();
    process.exit(0);
  });
}

start().catch((err) => {
  console.error("Tunnel error:", err);
  process.exit(1);
});
