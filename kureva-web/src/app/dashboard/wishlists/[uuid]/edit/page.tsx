"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiRequest, uploadFile } from "@/lib/api";
import Navbar from "@/components/navigation/Navbar";
import MobileNav from "@/components/navigation/MobileNav";
import { ArrowLeft, Upload, X, AlertCircle, Sparkles, Trash2, Loader2 } from "lucide-react";

export default function EditWishlistSettingsPage({ 
  params 
}: { 
  params: Promise<{ uuid: string }> 
}) {
  const resolvedParams = use(params);
  const uuid = resolvedParams.uuid;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [visibility, setVisibility] = useState("private");

  const [coverUploading, setCoverUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchWishlist = async () => {
      try {
        const res = await apiRequest(`/api/wishlists/${uuid}`);
        if (res.success && res.data) {
          setName(res.data.name || "");
          setDescription(res.data.description || "");
          setCoverImage(res.data.cover_image || "");
          setVisibility(res.data.visibility || "private");
        } else {
          router.push("/dashboard/wishlists");
        }
      } catch (err: any) {
        setError("Failed to load wishlist settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user, authLoading, router, uuid]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("image", file);

    setCoverUploading(true);
    setError("");

    try {
      const uploadedUrl = await uploadFile(file);
      setCoverImage(uploadedUrl);
      setSuccess("Cover image uploaded!");
    } catch (err: any) {
      setError(err?.message || "An error occurred during file upload.");
    } finally {
      setCoverUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Wishlist name is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await apiRequest(`/api/wishlists/${uuid}`, {
        method: "PATCH",
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
          cover_image: coverImage || undefined,
          visibility,
        }
      });

      if (res.success) {
        router.push(`/dashboard/wishlists/${uuid}`);
      } else {
        setError(res.error?.message || "Failed to save settings.");
        setSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save wishlist.");
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this wishlist and all its items permanently?")) return;
    setDeleting(true);
    try {
      await apiRequest(`/api/wishlists/${uuid}`, { method: "DELETE" });
      router.push("/dashboard/wishlists");
    } catch (err: any) {
      alert("Failed to delete wishlist.");
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex flex-col justify-between">
        <div>
          <Navbar />
          <div className="max-w-xl mx-auto px-6 py-10 space-y-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-64 w-full bg-white border border-border rounded-xl animate-pulse"></div>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-24 md:pb-12 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-xl px-6 py-10">
          <div className="mb-6">
            <Link
              href={`/dashboard/wishlists/${uuid}`}
              className="flex items-center space-x-1.5 text-xs text-secondary hover:text-primary transition-colors font-medium tracking-wide uppercase"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Wishlist</span>
            </Link>
          </div>

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-normal text-primary tracking-tight font-editorial mb-1">
                Wishlist Settings
              </h1>
              <p className="text-xs text-secondary leading-relaxed font-light">
                Configure collection privacy, title, description, and cover photo.
              </p>
            </div>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleting ? "Deleting..." : "Delete List"}</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50/70 text-red-700 text-xs p-3.5 rounded-lg mb-6 text-center border border-red-100 flex items-center justify-center space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50/70 text-green-700 text-xs p-3.5 rounded-lg mb-6 text-center border border-green-100 flex items-center justify-center space-x-2 font-medium">
              <Sparkles className="w-4 h-4 shrink-0 text-green-500" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-5">
            {/* Wishlist Name */}
            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Wishlist Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Birthday Gifts, Tech Upgrades"
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                placeholder="A few words about this wishlist..."
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm h-24 focus:outline-none focus:border-accent resize-none font-light"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Cover Photo
              </label>
              <div className="flex items-center space-x-4">
                <div className="h-20 w-28 border border-border rounded-xl overflow-hidden relative bg-soft shrink-0 flex items-center justify-center">
                  {coverImage ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverImage} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCoverImage("")}
                        className="absolute top-1 right-1 p-1 bg-primary/80 rounded-full text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <Upload className="w-6 h-6 text-secondary/40" />
                  )}
                </div>

                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                  <button
                    type="button"
                    disabled={coverUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-border hover:border-accent rounded-lg text-xs font-semibold text-secondary hover:text-primary transition-all bg-white flex items-center space-x-2 shadow-sm disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{coverUploading ? "Uploading..." : "Upload Cover Photo"}</span>
                  </button>
                  <p className="text-[10px] text-secondary/60 mt-1 font-light">
                    Recommended 1200x400. PNG, JPG, or WebP.
                  </p>
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Privacy & Visibility
              </label>
              <select
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-white font-medium"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="private">Private (Only you can see this list)</option>
                <option value="unlisted">Unlisted (Anyone with secret link can see)</option>
                <option value="public">Public (Visible on your public profile)</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-border/60">
              <Link
                href={`/dashboard/wishlists/${uuid}`}
                className="w-1/3 py-3 border border-border rounded-xl text-xs font-semibold text-secondary hover:text-primary hover:bg-soft text-center transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-dark transition-all duration-200 text-xs shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Wishlist</span>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
