"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import Navbar from "@/components/navigation/Navbar";
import MobileNav from "@/components/navigation/MobileNav";
import { ArrowLeft } from "lucide-react";

export default function NewOccasionPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [name, setName] = useState("");
  const [type, setType] = useState("birthday");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [selectedWishlists, setSelectedWishlists] = useState<string[]>([]);
  
  const [loadingLists, setLoadingLists] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchWishlists = async () => {
      try {
        const res = await apiRequest("/api/wishlists");
        if (res.success) {
          setWishlists(res.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingLists(false);
      }
    };
    fetchWishlists();
  }, [user, authLoading, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await apiRequest("/api/occasions", {
        method: "POST",
        data: {
          name,
          type,
          date,
          description,
          location,
          cover_image: coverImage,
          visibility,
          wishlist_ids: selectedWishlists,
        },
      });

      if (res.success && res.data?.uuid) {
        router.push(`/dashboard/occasions/${res.data.uuid}`);
      } else {
        router.push("/dashboard/occasions");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create occasion.");
      setSubmitting(false);
    }
  };

  const toggleWishlistSelection = (uuid: string) => {
    if (selectedWishlists.includes(uuid)) {
      setSelectedWishlists(selectedWishlists.filter((id) => id !== uuid));
    } else {
      setSelectedWishlists([...selectedWishlists, uuid]);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-8 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-xl px-6 py-10">
          <div className="mb-6">
            <Link
              href="/dashboard/occasions"
              className="flex items-center space-x-1 text-xs text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Occasions</span>
            </Link>
          </div>

          <h1 className="text-2xl font-normal text-primary tracking-tight font-editorial mb-2">
            New Occasion
          </h1>
          <p className="text-xs text-secondary mb-8 tracking-wide">
            Plan a birthday, wedding, registry, or celebration.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded mb-6 text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                Occasion Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sarah's 27th Birthday, Our Wedding"
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                  Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent bg-white"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="birthday">Birthday</option>
                  <option value="wedding">Wedding</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="baby_shower">Baby Shower</option>
                  <option value="housewarming">Housewarming</option>
                  <option value="christmas">Christmas</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                Description / Invitation note
              </label>
              <textarea
                placeholder="A short note to share with guests..."
                className="w-full px-3 py-2 border border-border rounded text-sm h-24 focus:outline-none focus:border-accent resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                Location / Venue
              </label>
              <input
                type="text"
                placeholder="e.g. Lagos, Nigeria / Zoom link"
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                Cover Image URL
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
                <option value="private">Private</option>
                <option value="unlisted">Unlisted (Shareable link)</option>
                <option value="public">Public (Shown on profile)</option>
              </select>
            </div>

            {/* Attached Wishlists Checklist */}
            {!loadingLists && wishlists.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Attach Wishlists
                </label>
                <div className="max-h-32 overflow-y-auto border border-border rounded p-2.5 space-y-1.5 bg-soft/50">
                  {wishlists.map((w) => (
                    <label key={w.uuid} className="flex items-center space-x-2.5 text-xs text-primary font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded text-accent focus:ring-accent"
                        checked={selectedWishlists.includes(w.uuid)}
                        onChange={() => toggleWishlistSelection(w.uuid)}
                      />
                      <span>{w.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-accent text-white font-medium rounded hover:bg-accent-dark transition-colors text-sm disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Occasion"}
            </button>
          </form>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
