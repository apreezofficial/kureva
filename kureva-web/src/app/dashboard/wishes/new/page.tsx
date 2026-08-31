"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import Navbar from "@/components/navigation/Navbar";
import MobileNav from "@/components/navigation/MobileNav";
import { ArrowLeft, Sparkles, Upload, Link2, X, AlertCircle, ShoppingBag, FolderHeart } from "lucide-react";

export default function NewWishPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected Wishlist UUID from query params if coming from a specific list
  const defaultWishlistUuid = searchParams.get("wishlist") || "";

  const [wishlists, setWishlists] = useState<any[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  const [wishlistUuid, setWishlistUuid] = useState(defaultWishlistUuid);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [store, setStore] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [imageUrl, setImageUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("nice_to_have");

  // UX & uploading states
  const [importing, setImporting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
          const lists = res.data || [];
          setWishlists(lists);
          // Auto-select first list if none specified
          if (!wishlistUuid && lists.length > 0) {
            setWishlistUuid(lists[0].uuid);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingLists(false);
      }
    };
    fetchWishlists();
  }, [user, authLoading, router, wishlistUuid]);

  const handleAutoFill = async () => {
    if (!url) {
      setError("Please paste a product URL to auto-fill.");
      return;
    }
    setImporting(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiRequest("/api/products/preview", {
        method: "POST",
        data: { url },
      });

      if (res.success && res.data) {
        const preview = res.data;
        setName(preview.name || "");
        setImageUrl(preview.image_url || "");
        setStore(preview.store || "");
        setPrice(preview.price ? String(preview.price) : "");
        setCurrency(preview.currency || "USD");
        setNotes(preview.description || "");
        setSuccess("Magic completed! We filled what we could find.");
      }
    } catch (err: any) {
      setError("Could not auto-fill details. No worries, you can type them manually below.");
    } finally {
      setImporting(false);
    }
  };

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
      // Direct raw fetch since Form Data needs customized headers
      const res = await fetch("http://127.0.0.1:8000/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          // Token if authorized, retrieve from localStorage
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        }
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        setImageUrl(data.data.url);
        setSuccess("Image uploaded successfully!");
      } else {
        setError(data.error?.message || "Failed to upload image.");
      }
    } catch (err) {
      setError("An error occurred during file upload.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishlistUuid) {
      setError("Choose a wishlist to save this item.");
      return;
    }
    if (!name) {
      setError("Product name is required.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await apiRequest(`/api/wishlists/${wishlistUuid}/items`, {
        method: "POST",
        data: {
          name,
          image_url: imageUrl,
          product_url: url,
          store,
          price: price ? parseFloat(price) : null,
          currency,
          notes,
          priority,
          quantity: parseInt(quantity) || 1,
        },
      });

      if (res.success) {
        router.push(`/dashboard/wishlists/${wishlistUuid}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save wish.");
      setSubmitting(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-24 md:pb-12 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-xl px-6 py-10">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="flex items-center space-x-1.5 text-xs text-secondary hover:text-primary transition-colors font-medium tracking-wide uppercase"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Collection</span>
            </Link>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-normal text-primary tracking-tight font-editorial mb-2.5">
              Add a Wish
            </h1>
            <p className="text-xs text-secondary leading-relaxed max-w-md font-light">
              Pave the way for the items you want. Import details instantly using a link, or define your item manually.
            </p>
          </div>

          {error && (
            <div className="bg-red-50/70 text-red-700 text-xs p-3.5 rounded-lg mb-8 text-center border border-red-100 flex items-center justify-center space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50/70 text-green-700 text-xs p-3.5 rounded-lg mb-8 text-center border border-green-100 flex items-center justify-center space-x-2 font-medium">
              <Sparkles className="w-4 h-4 shrink-0 text-green-500" />
              <span>{success}</span>
            </div>
          )}

          {/* CHECKPOINT: Empty State for Wishlists */}
          {!loadingLists && wishlists.length === 0 ? (
            <div className="bg-white border border-border rounded-xl p-8 text-center max-w-md mx-auto shadow-sm my-10">
              <FolderHeart className="w-12 h-12 text-secondary/30 mx-auto mb-4" />
              <h3 className="text-lg font-normal text-primary font-editorial mb-2">Create a wishlist first</h3>
              <p className="text-xs text-secondary leading-relaxed mb-6 font-light">
                You need at least one wishlist to collect your desires. Create one in seconds to host your wishes.
              </p>
              <Link
                href="/dashboard/wishlists/new"
                className="inline-block px-6 py-2.5 bg-accent text-white rounded text-xs font-semibold hover:bg-accent-dark transition-all duration-200"
              >
                Create your first wishlist
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Option 1: Auto Import Card */}
              <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center space-x-2.5 mb-4">
                  <div className="p-1.5 bg-accent/5 rounded-lg">
                    <Link2 className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Option 1: Import via Link
                    </h3>
                    <p className="text-[10px] text-secondary font-light">
                      Jumia, Amazon, ASOS, Zara or any shop
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/product/..."
                    className="flex-1 px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-soft/50 focus:bg-white transition-colors"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    disabled={importing || !url}
                    className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors text-xs disabled:opacity-40 shadow-sm shrink-0"
                  >
                    {importing ? "Parsing..." : "Auto Fill"}
                  </button>
                </div>
              </div>

              {/* Option 2: Main Details Form */}
              <form onSubmit={handleSubmit} className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-5">
                <div className="border-b border-border/60 pb-3 mb-2">
                  <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center space-x-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-accent" />
                    <span>Option 2: Item Details</span>
                  </h3>
                </div>

                {/* Target Wishlist Select */}
                <div>
                  <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    Add to Wishlist *
                  </label>
                  <select
                    required
                    className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-white"
                    value={wishlistUuid}
                    onChange={(e) => setWishlistUuid(e.target.value)}
                  >
                    {wishlists.map((w) => (
                      <option key={w.uuid} value={w.uuid}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Item Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sony WH-1000XM4 Noise Cancelling Headset"
                    className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Image Upload Area */}
                <div>
                  <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    Product Image
                  </label>
                  <div className="flex items-center space-x-4">
                    {/* Thumbnail preview */}
                    <div className="h-16 w-16 border border-border rounded-lg overflow-hidden relative bg-soft shrink-0 flex items-center justify-center">
                      {imageUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imageUrl} alt="Uploaded item" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setImageUrl("")}
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
                        <span>{imageUploading ? "Uploading file..." : "Upload Image"}</span>
                      </button>
                      <p className="text-[10px] text-secondary mt-1.5 font-light">
                        Select a JPEG, PNG or WebP image. Max size 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price and Currency */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                      Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                      Currency
                    </label>
                    <select
                      className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-white"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="NGN">NGN (₦)</option>
                    </select>
                  </div>
                </div>

                {/* Store and Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                      Store Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jumia, Zara"
                      className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                      value={store}
                      onChange={(e) => setStore(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    Notes / Size / Color
                  </label>
                  <textarea
                    placeholder="Add details like size M, color black, or special shipping guidelines..."
                    className="w-full px-3.5 py-2 border border-border rounded-lg text-sm h-24 focus:outline-none focus:border-accent resize-none font-light"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <select
                    className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-white"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="nice_to_have">Nice to have</option>
                    <option value="really_want">Really want</option>
                    <option value="must_have">Must have! 🔥</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors text-sm disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "Adding to Collection..." : "Add to collection"}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
