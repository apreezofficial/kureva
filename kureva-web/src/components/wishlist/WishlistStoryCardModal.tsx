"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  X, 
  Download, 
  Sparkles, 
  Check, 
  Share2, 
  Copy, 
  Palette, 
  Smartphone,
  Square,
  QrCode
} from "lucide-react";

interface StoryCardModalProps {
  wishlist: any;
  shareUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

type ThemeType = "emerald" | "champagne" | "sunset" | "midnight";
type AspectType = "story" | "square";

export default function WishlistStoryCardModal({
  wishlist,
  shareUrl,
  isOpen,
  onClose
}: StoryCardModalProps) {
  const [theme, setTheme] = useState<ThemeType>("emerald");
  const [aspectRatio, setAspectRatio] = useState<AspectType>("story");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const items = wishlist?.items || [];
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}&margin=10`;

  const getCurrencySymbol = (currency: string) => {
    switch (currency?.toUpperCase()) {
      case "NGN": return "₦";
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "JPY": return "¥";
      default: return currency ? `${currency} ` : "$";
    }
  };

  const drawCard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !wishlist) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isStory = aspectRatio === "story";
    const width = 1080;
    const height = isStory ? 1920 : 1080;

    canvas.width = width;
    canvas.height = height;

    // Theme definitions
    let bgGradient: CanvasGradient;
    let textColor = "#FFFFFF";
    let subTextColor = "rgba(255, 255, 255, 0.75)";
    let cardBg = "rgba(255, 255, 255, 0.12)";
    let cardBorder = "rgba(255, 255, 255, 0.2)";
    let accentPill = "#10B981";
    let accentPillText = "#FFFFFF";

    if (theme === "emerald") {
      bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, "#022c22");
      bgGradient.addColorStop(0.5, "#064e3b");
      bgGradient.addColorStop(1, "#047857");
      accentPill = "#34d399";
      accentPillText = "#022c22";
    } else if (theme === "champagne") {
      bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, "#fef3c7");
      bgGradient.addColorStop(0.5, "#fffbeb");
      bgGradient.addColorStop(1, "#fde68a");
      textColor = "#1c1917";
      subTextColor = "#57534e";
      cardBg = "rgba(255, 255, 255, 0.85)";
      cardBorder = "rgba(217, 119, 6, 0.25)";
      accentPill = "#d97706";
      accentPillText = "#FFFFFF";
    } else if (theme === "sunset") {
      bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, "#831843");
      bgGradient.addColorStop(0.5, "#be185d");
      bgGradient.addColorStop(1, "#f43f5e");
      accentPill = "#fbcfe8";
      accentPillText = "#831843";
    } else {
      // Midnight
      bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, "#09090b");
      bgGradient.addColorStop(0.5, "#18181b");
      bgGradient.addColorStop(1, "#27272a");
      accentPill = "#10b981";
      accentPillText = "#ffffff";
    }

    // Draw background
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative subtle rings
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.15, 300, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(width * 0.1, height * 0.9, 450, 0, Math.PI * 2);
    ctx.stroke();

    // 1. Header Brand Badge
    const headerY = isStory ? 140 : 100;
    ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = accentPill;
    ctx.textAlign = "center";
    ctx.fillText("✦  K U R E V A   W I S H L I S T", width / 2, headerY);

    // 2. Curator Subtitle
    const curatorY = headerY + 60;
    ctx.font = "normal 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = subTextColor;
    ctx.fillText(`Curated by @${wishlist.username || "creator"}`, width / 2, curatorY);

    // 3. Wishlist Name
    const titleY = curatorY + 90;
    ctx.font = "bold 68px 'Playfair Display', Georgia, serif";
    ctx.fillStyle = textColor;
    
    // Wrap long title
    const maxTitleWidth = width - 180;
    const words = (wishlist.name || "My Wishlist").split(" ");
    let line = "";
    let lines = [];
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTitleWidth && n > 0) {
        lines.push(line);
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    let currentTitleY = titleY;
    lines.slice(0, 2).forEach((l) => {
      ctx.fillText(l.trim(), width / 2, currentTitleY);
      currentTitleY += 80;
    });

    // 4. Featured Items Showcase
    const displayItems = items.slice(0, isStory ? 3 : 2);
    let itemStartY = currentTitleY + 30;

    displayItems.forEach((item: any, idx: number) => {
      const cardHeight = isStory ? 180 : 150;
      const cardWidth = width - 160;
      const cardX = 80;
      const cardY = itemStartY + (idx * (cardHeight + 25));

      // Draw item rounded rectangle
      ctx.fillStyle = cardBg;
      ctx.strokeStyle = cardBorder;
      ctx.lineWidth = 2;
      roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 28, true, true);

      // Item Index / Bullet
      ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = accentPill;
      ctx.textAlign = "left";
      ctx.fillText(`0${idx + 1}`, cardX + 35, cardY + 60);

      // Item Name
      ctx.font = "600 36px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = textColor;
      const itemName = item.name.length > 34 ? item.name.substring(0, 32) + "..." : item.name;
      ctx.fillText(itemName, cardX + 95, cardY + 62);

      // Item Price & Store
      const priceText = item.price 
        ? `${getCurrencySymbol(item.currency)}${parseFloat(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "Price on site";
      
      ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = accentPill;
      ctx.fillText(priceText, cardX + 95, cardY + 125);

      if (item.store) {
        ctx.font = "500 26px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = subTextColor;
        ctx.fillText(`•  ${item.store}`, cardX + 95 + ctx.measureText(priceText).width + 20, cardY + 125);
      }
    });

    // 5. QR Code & Footer Call to Action
    const qrImage = new Image();
    qrImage.crossOrigin = "anonymous";
    qrImage.src = qrUrl;

    qrImage.onload = () => {
      const qrBoxSize = isStory ? 260 : 200;
      const qrBoxY = isStory ? height - 440 : height - 290;
      const qrBoxX = (width - qrBoxSize) / 2;

      // QR white frame
      ctx.fillStyle = "#FFFFFF";
      roundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28, true, false);

      // Draw QR Code
      const pad = 20;
      ctx.drawImage(qrImage, qrBoxX + pad, qrBoxY + pad, qrBoxSize - (pad * 2), qrBoxSize - (pad * 2));

      // Scan instruction
      ctx.font = "bold 30px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.fillText("Scan with Camera to Claim a Gift", width / 2, qrBoxY + qrBoxSize + 50);

      ctx.font = "normal 24px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = subTextColor;
      ctx.fillText("kureva.com • tap secret link in bio", width / 2, qrBoxY + qrBoxSize + 90);

      setPreviewUrl(canvas.toDataURL("image/png"));
    };

    if (qrImage.complete) {
      setPreviewUrl(canvas.toDataURL("image/png"));
    }
  }, [wishlist, shareUrl, theme, aspectRatio, qrUrl, items]);

  useEffect(() => {
    if (isOpen) {
      drawCard();
    }
  }, [isOpen, drawCard]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    const link = document.createElement("a");
    link.download = `${wishlist?.name || "wishlist"}-story-card.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    setTimeout(() => {
      setDownloading(false);
    }, 1000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-border/80 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-secondary hover:text-primary rounded-full hover:bg-soft transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Story Graphic Generator
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-normal text-primary font-editorial tracking-tight mb-2">
          Share Your Wishlist Story
        </h2>
        <p className="text-xs text-secondary mb-6 font-light">
          Export a high-resolution story card with your scannable QR code for Instagram, WhatsApp, or Twitter.
        </p>

        {/* Hidden Canvas used for high-res generation */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Live Preview Column */}
          <div className="md:col-span-6 flex justify-center">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-gray-100 max-h-[460px] w-full flex items-center justify-center">
              {previewUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewUrl}
                  alt="Wishlist Story Preview"
                  className="w-full h-auto object-contain max-h-[440px]"
                />
              ) : (
                <div className="py-20 text-center text-xs text-secondary animate-pulse">
                  Generating story graphic...
                </div>
              )}
            </div>
          </div>

          {/* Controls Column */}
          <div className="md:col-span-6 space-y-5">
            
            {/* Aspect Ratio Switcher */}
            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-2">
                Card Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio("story")}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                    aspectRatio === "story"
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-white text-secondary border-border hover:border-accent"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Story (9:16)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio("square")}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                    aspectRatio === "square"
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-white text-secondary border-border hover:border-accent"
                  }`}
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Square (1:1)</span>
                </button>
              </div>
            </div>

            {/* Theme Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-2">
                Aesthetic Color Palette
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme("emerald")}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center space-x-2 transition-all ${
                    theme === "emerald" 
                      ? "border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/50" 
                      : "border-border hover:border-border/80"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-700 shadow-xs"></span>
                  <span className="text-gray-800 font-semibold text-[11px]">Emerald Silk</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("champagne")}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center space-x-2 transition-all ${
                    theme === "champagne" 
                      ? "border-amber-600 ring-2 ring-amber-600/20 bg-amber-50/50" 
                      : "border-border hover:border-border/80"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-amber-200 border border-amber-400 shadow-xs"></span>
                  <span className="text-gray-800 font-semibold text-[11px]">Champagne Gold</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("sunset")}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center space-x-2 transition-all ${
                    theme === "sunset" 
                      ? "border-pink-600 ring-2 ring-pink-600/20 bg-pink-50/50" 
                      : "border-border hover:border-border/80"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-rose-500 shadow-xs"></span>
                  <span className="text-gray-800 font-semibold text-[11px]">Sunset Rose</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("midnight")}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center space-x-2 transition-all ${
                    theme === "midnight" 
                      ? "border-zinc-900 ring-2 ring-zinc-900/20 bg-zinc-100" 
                      : "border-border hover:border-border/80"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-zinc-900 shadow-xs"></span>
                  <span className="text-gray-800 font-semibold text-[11px]">Midnight Noir</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 space-y-2.5">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading || !previewUrl}
                className="w-full py-3.5 bg-[#1b7a43] hover:bg-[#145d33] text-white font-semibold rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 transition-all active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? "Preparing Image..." : "Download Story Graphic (.PNG)"}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2.5 border border-border hover:border-primary text-secondary hover:text-primary rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors bg-white"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Link Copied to Clipboard!" : "Copy Wishlist Link"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Canvas rounded rectangle helper
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: boolean,
  stroke: boolean
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}
