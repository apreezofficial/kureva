"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import Navbar from "@/components/navigation/Navbar";
import MobileNav from "@/components/navigation/MobileNav";
import { Plus, X, Globe, EyeOff, Link2, Sparkles, List } from "lucide-react";

export default function WishlistsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [coverImage, setCoverImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchWishlists = async () => {
    try {
      const res = await apiRequest("/api/wishlists");
      if (res.success) {
        setWishlists(res.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetchWishlists();
  }, [user, authLoading, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await apiRequest("/api/wishlists", {
        method: "POST",
        data: { name, description, visibility, cover_image: coverImage },
      });

      if (res.success) {
        setIsModalOpen(false);
        setName("");
        setDescription("");
        setVisibility("private");
        setCoverImage("");
        fetchWishlists();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create wishlist.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-8 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-normal text-primary tracking-tight font-editorial">
                Your Wishlists
              </h1>
              <p className="text-xs text-secondary mt-1 tracking-wide">
                Create collections for life&apos;s events or little items you&apos;re eyeing.
              </p>
            </div>
            <Link
              href="/dashboard/wishlists/new"
              className="flex items-center space-x-1.5 px-4 py-2 bg-accent text-white rounded text-sm hover:bg-accent-dark transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Create Wishlist</span>
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-secondary">Loading collections...</p>
          ) : wishlists.length === 0 ? (
            <div className="border border-dashed border-border rounded-lg p-12 text-center bg-soft max-w-md mx-auto mt-12">
              <List className="w-8 h-8 text-secondary/40 mx-auto mb-4" />
              <h3 className="font-medium text-primary text-base mb-1">Nothing here yet</h3>
              <p className="text-xs text-secondary mb-6 leading-relaxed font-light">
                Maybe there is something you&apos;ve been quietly wanting. Create a wishlist to start collecting.
              </p>
              <Link
                href="/dashboard/wishlists/new"
                className="px-6 py-2 bg-accent text-white rounded text-sm hover:bg-accent-dark transition-colors font-medium inline-block"
              >
                Create your first wishlist
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {wishlists.map((w) => (
                <div
                  key={w.uuid}
                  className="group relative border border-border rounded-lg overflow-hidden hover:border-accent hover:shadow-sm transition-all duration-200 flex flex-col justify-between bg-white"
                >
                  {w.cover_image && (
                    <div className="h-32 bg-gray-100 overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={w.cover_image}
                        alt={w.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5 flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] tracking-wide text-secondary uppercase font-semibold flex items-center space-x-1">
                        {w.visibility === "public" ? (
                          <>
                            <Globe className="w-3.5 h-3.5 text-accent" />
                            <span>Public</span>
                          </>
                        ) : w.visibility === "unlisted" ? (
                          <>
                            <Link2 className="w-3.5 h-3.5 text-blue-500" />
                            <span>Unlisted</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                            <span>Private</span>
                          </>
                        )}
                      </span>
                      <span className="text-[11px] text-secondary font-medium">
                        {w.items_count || 0} items
                      </span>
                    </div>
                    <h3 className="font-medium text-primary text-lg mb-1 leading-snug">
                      {w.name}
                    </h3>
                    <p className="text-xs text-secondary line-clamp-2 font-light leading-relaxed">
                      {w.description || "No description provided."}
                    </p>
                  </div>
                  <div className="px-5 pb-5 pt-2 border-t border-border/40 bg-soft/50 flex items-center justify-between">
                    <span className="text-[10px] text-secondary font-light">
                      Updated {new Date(w.updated_at || w.created_at).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/dashboard/wishlists/${w.uuid}`}
                      className="text-xs font-semibold text-accent hover:underline"
                    >
                      Manage Collection
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}


        </main>
      </div>

      <MobileNav />
    </div>
  );
}
