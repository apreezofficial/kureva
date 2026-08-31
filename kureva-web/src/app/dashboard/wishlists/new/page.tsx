"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import Navbar from "@/components/navigation/Navbar";
import MobileNav from "@/components/navigation/MobileNav";
import { ArrowLeft, Upload, X } from "lucide-react";

export default function NewWishlistPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [coverImage, setCoverImage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("image", file);

    setImageUploading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        }
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        setCoverImage(data.data.url);
        setSuccess("Cover image uploaded successfully!");
      } else {
        setError(data.error?.message || "Failed to upload image.");
      }
    } catch (err) {
      setError("An error occurred during file upload.");
    } finally {
      setImageUploading(false);
    }
  };

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
    <div className="min-h-screen bg-[#fafaf9] pb-20 md:pb-8 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-xl px-6 py-10">
          <div className="mb-6">
            <Link
              href="/dashboard/wishlists"
              className="flex items-center space-x-1 text-xs text-secondary hover:text-primary transition-colors font-medium tracking-wide uppercase"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Wishlists</span>
            </Link>
          </div>

          <h1 className="text-3xl font-normal text-primary tracking-tight font-editorial mb-2">
            New Wishlist
          </h1>
          <p className="text-xs text-secondary mb-8 tracking-wide font-light">
            Create a custom collection for your wishes.
          </p>

          {error && (
            <div className="bg-red-50/70 text-red-600 text-xs p-3.5 rounded-lg mb-6 text-center border border-red-100 font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50/70 text-green-700 text-xs p-3.5 rounded-lg mb-6 text-center border border-green-100 font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleCreate} className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-5">
            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Wishlist Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Birthday wishes, Christmas registry"
                className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-soft/10 focus:bg-white transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                placeholder="A short note about what this collection is..."
                className="w-full px-3.5 py-2 border border-border rounded-lg text-sm h-28 focus:outline-none focus:border-accent bg-soft/10 focus:bg-white transition-all resize-none font-light"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Custom Cover Image Uploader */}
            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Cover Image (optional)
              </label>
              <div className="flex items-center space-x-4 bg-soft/20 border border-border/60 rounded-lg p-3">
                <div className="h-16 w-16 border border-border rounded-lg overflow-hidden relative bg-white shrink-0 flex items-center justify-center shadow-inner">
                  {coverImage ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverImage} alt="Cover Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCoverImage("")}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-primary/80 rounded-full text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </>
                  ) : (
                    <Upload className="w-5 h-5 text-secondary/40 animate-pulse" />
                  )}
                </div>

                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <button
                    type="button"
                    disabled={imageUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-border hover:border-accent rounded-lg text-xs font-semibold text-secondary hover:text-primary transition-all bg-white flex items-center space-x-2 shadow-sm disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{imageUploading ? "Uploading file..." : "Upload Cover Image"}</span>
                  </button>
                  <p className="text-[10px] text-secondary mt-1.5 font-light">
                    Select a JPEG, PNG or WebP image. Max size 2MB.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Visibility
              </label>
              <select
                className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-white"
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
              className="w-full py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors text-sm disabled:opacity-50 shadow-sm"
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
