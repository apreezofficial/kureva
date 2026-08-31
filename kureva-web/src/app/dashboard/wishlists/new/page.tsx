"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import Navbar from "@/components/navigation/Navbar";
import MobileNav from "@/components/navigation/MobileNav";
import { ArrowLeft } from "lucide-react";

export default function NewWishlistPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [coverImage, setCoverImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await apiRequest("/api/wishlists", {
        method: "POST",
        data: { name, description, visibility, cover_image: coverImage },
      });

      if (res.success && res.data?.uuid) {
        router.push(`/dashboard/wishlists/${res.data.uuid}`);
      } else {
        router.push("/dashboard/wishlists");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create wishlist.");
      setSubmitting(false);
    }
  };

  if (authLoading) return null;
  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-8 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-xl px-6 py-10">
          <div className="mb-6">
            <Link
              href="/dashboard/wishlists"
              className="flex items-center space-x-1 text-xs text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Wishlists</span>
            </Link>
          </div>

          <h1 className="text-2xl font-normal text-primary tracking-tight font-editorial mb-2">
            New Wishlist
          </h1>
          <p className="text-xs text-secondary mb-8 tracking-wide">
            Create a custom collection for your wishes.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded mb-6 text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                Wishlist Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Birthday wishes, Christmas registry"
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                placeholder="A short note about what this collection is..."
                className="w-full px-3 py-2 border border-border rounded text-sm h-28 focus:outline-none focus:border-accent resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                Cover Image URL (optional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                Visibility
              </label>
              <select
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent bg-white"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="private">Private (Only you can see)</option>
                <option value="unlisted">Unlisted (Anyone with secret link can see)</option>
                <option value="public">Public (Discoverable on your profile)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-accent text-white font-medium rounded hover:bg-accent-dark transition-colors text-sm disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Collection"}
            </button>
          </form>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
