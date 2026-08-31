"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import Navbar from "@/components/navigation/Navbar";
import MobileNav from "@/components/navigation/MobileNav";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NewWishPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

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

  const [importing, setImporting] = useState(false);
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
        setSuccess("Successfully retrieved product details!");
      }
    } catch (err: any) {
      setError(err.message || "Could not retrieve details automatically. Please enter details manually.");
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishlistUuid) {
      setError("Please select a wishlist to add this item to.");
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
      setError(err.message || "Failed to add wish.");
      setSubmitting(false);
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
              href="/dashboard"
              className="flex items-center space-x-1 text-xs text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          <h1 className="text-2xl font-normal text-primary tracking-tight font-editorial mb-2">
            Add Wish
          </h1>
          <p className="text-xs text-secondary mb-8 tracking-wide">
            Add an item manually or auto-fill details from an external URL.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded mb-6 text-center border border-red-100 font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-700 text-xs p-3 rounded mb-6 text-center border border-green-100 font-medium animate-fade-in">
              {success}
            </div>
          )}

          <div className="bg-soft border border-border rounded-lg p-5 mb-8">
            <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-2">
              Import from URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Paste product link (Jumia, Amazon, Shopify, etc.)"
                className="flex-1 px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent bg-white"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={importing || !url}
                className="px-4 py-2 bg-primary text-white font-medium rounded hover:bg-primary-dark transition-colors text-xs disabled:opacity-40"
              >
                {importing ? "Fetching..." : "Auto Fill"}
              </button>
            </div>
            <span className="text-[10px] text-secondary mt-2 block font-light leading-relaxed">
              We will automatically parse the image, price, store name, and description.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                Add to Wishlist *
              </label>
              {loadingLists ? (
                <div className="h-9 bg-gray-50 border border-border rounded animate-pulse"></div>
              ) : wishlists.length === 0 ? (
                <div className="text-xs text-red-600 font-medium py-1">
                  You need to create a wishlist first!{" "}
                  <Link href="/dashboard/wishlists/new" className="underline font-bold ml-1">
                    Create wishlist
                  </Link>
                </div>
              ) : (
                <select
                  required
                  className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent bg-white"
                  value={wishlistUuid}
                  onChange={(e) => setWishlistUuid(e.target.value)}
                >
                  {wishlists.map((w) => (
                    <option key={w.uuid} value={w.uuid}>
                      {w.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                placeholder="What is this item called?"
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                  Currency
                </label>
                <select
                  className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent bg-white"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jumia, Amazon"
                  className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                Image URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              {imageUrl && (
                <div className="mt-2.5 h-20 w-20 border border-border rounded overflow-hidden relative bg-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-contain" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                Notes / Size / Color
              </label>
              <textarea
                placeholder="Add details like size, color preference, or special instructions..."
                className="w-full px-3 py-2 border border-border rounded text-sm h-24 focus:outline-none focus:border-accent resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent bg-white"
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
              disabled={submitting || wishlists.length === 0}
              className="w-full py-2.5 bg-accent text-white font-medium rounded hover:bg-accent-dark transition-colors text-sm disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add to collection"}
            </button>
          </form>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
