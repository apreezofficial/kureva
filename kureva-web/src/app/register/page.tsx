"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username must be at least 3 alphanumeric characters/underscores.");
      setLoading(false);
      return;
    }

    try {
      await register(username, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Try a different username/email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-soft flex flex-col justify-center items-center px-4">
      <div className="bg-white px-8 py-10 rounded-md border border-border shadow-sm w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-normal tracking-widest text-primary lowercase font-editorial">
            kureva
          </Link>
          <p className="text-xs text-secondary mt-2 tracking-wide">Konnichiwa! Join our little circle.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded mb-4 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
              Username
            </label>
            <input
              type="text"
              required
              placeholder="e.g. sarah"
              className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
              Display Name
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah Ade"
              className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 bg-accent text-white font-medium rounded hover:bg-accent-dark transition-colors text-sm disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-border text-xs text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
