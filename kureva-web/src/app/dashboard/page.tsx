"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import Navbar from "@/components/navigation/Navbar";
import MobileNav from "@/components/navigation/MobileNav";
import { Plus, List, Calendar, Sparkles, AlertCircle, X, Globe, Link2, EyeOff } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // New Wishlist Modal States
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [wishlistName, setWishlistName] = useState("");
  const [wishlistDescription, setWishlistDescription] = useState("");
  const [wishlistVisibility, setWishlistVisibility] = useState("private");
  const [wishlistCoverImage, setWishlistCoverImage] = useState("");
  const [submittingWishlist, setSubmittingWishlist] = useState(false);
  const [wishlistError, setWishlistError] = useState("");

  // Quick Add States
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddWishlistUuid, setQuickAddWishlistUuid] = useState("");
  const [quickAddUrl, setQuickAddUrl] = useState("");
  const [quickAddName, setQuickAddName] = useState("");
  const [quickAddImage, setQuickAddImage] = useState("");
  const [quickAddStore, setQuickAddStore] = useState("");
  const [quickAddPrice, setQuickAddPrice] = useState("");
  const [quickAddCurrency, setQuickAddCurrency] = useState("USD");
  const [quickAddNotes, setQuickAddNotes] = useState("");
  const [quickAddPriority, setQuickAddPriority] = useState("nice_to_have");
  const [quickAddQuantity, setQuickAddQuantity] = useState("1");
  const [quickAddImporting, setQuickAddImporting] = useState(false);
  const [quickAddSubmitting, setQuickAddSubmitting] = useState(false);
  const [quickAddError, setQuickAddError] = useState("");

  const handleQuickAddUrlPreview = async () => {
    if (!quickAddUrl) return;
    setQuickAddImporting(true);
    setQuickAddError("");
    try {
      const res = await apiRequest("/api/products/preview", {
        method: "POST",
        data: { url: quickAddUrl },
      });
      if (res.success && res.data) {
        const preview = res.data;
        setQuickAddName(preview.name || "");
        setQuickAddImage(preview.image_url || "");
        setQuickAddStore(preview.store || "");
        setQuickAddPrice(preview.price ? String(preview.price) : "");
        setQuickAddCurrency(preview.currency || "USD");
        setQuickAddNotes(preview.description || "");
      }
    } catch (err: any) {
      setQuickAddError(err.message || "Could not retrieve details. Entering manually.");
    } finally {
      setQuickAddImporting(false);
    }
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddWishlistUuid) {
      setQuickAddError("Please select a wishlist to add this item to.");
      return;
    }
    if (!quickAddName) return;
    setQuickAddSubmitting(true);

    try {
      await apiRequest(`/api/wishlists/${quickAddWishlistUuid}/items`, {
        method: "POST",
        data: {
          name: quickAddName,
          image_url: quickAddImage,
          product_url: quickAddUrl,
          store: quickAddStore,
          price: quickAddPrice ? parseFloat(quickAddPrice) : null,
          currency: quickAddCurrency,
          notes: quickAddNotes,
          priority: quickAddPriority,
          quantity: parseInt(quickAddQuantity) || 1,
        },
      });
      setIsQuickAddOpen(false);
      // Reset form
      setQuickAddWishlistUuid("");
      setQuickAddUrl("");
      setQuickAddName("");
      setQuickAddImage("");
      setQuickAddStore("");
      setQuickAddPrice("");
      setQuickAddCurrency("USD");
      setQuickAddNotes("");
      setQuickAddPriority("nice_to_have");
      setQuickAddQuantity("1");
      fetchData();
    } catch (err: any) {
      setQuickAddError(err.message || "Failed to add item.");
    } finally {
      setQuickAddSubmitting(false);
    }
  };

  const fetchData = async () => {
    try {
      const resW = await apiRequest("/api/wishlists");
      if (resW.success) setWishlists(resW.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    fetchData();
  }, [user, authLoading, router]);

  const handleCreateWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setWishlistError("");
    setSubmittingWishlist(true);

    try {
      const res = await apiRequest("/api/wishlists", {
        method: "POST",
        data: {
          name: wishlistName,
          description: wishlistDescription,
          visibility: wishlistVisibility,
          cover_image: wishlistCoverImage,
        },
      });
      if (res.success) {
        setIsWishlistModalOpen(false);
        setWishlistName("");
        setWishlistDescription("");
        setWishlistVisibility("private");
        setWishlistCoverImage("");
        fetchData();
      }
    } catch (err: any) {
      setWishlistError(err.message || "Failed to create wishlist.");
    } finally {
      setSubmittingWishlist(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-white pb-20 md:pb-8 flex flex-col justify-between">
        <div>
          {/* Header Shimmer */}
          <header className="border-b border-border bg-white/80 py-4">
            <div className="mx-auto max-w-5xl px-6 flex justify-between items-center">
              <div className="h-6 w-20 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </header>

          <main className="mx-auto max-w-5xl px-6 py-10">
            {/* Greeting Shimmer */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-pulse">
              <div className="space-y-2">
                <div className="h-8 bg-gray-100 rounded w-48"></div>
                <div className="h-4 bg-gray-100 rounded w-72"></div>
              </div>
              <div className="flex space-x-3">
                <div className="h-9 bg-gray-100 rounded w-28"></div>
                <div className="h-9 bg-gray-100 rounded w-28"></div>
              </div>
            </div>

            {/* Grid Shimmer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
              <div className="md:col-span-2 space-y-10">
                <div className="space-y-4">
                  <div className="h-5 bg-gray-100 rounded w-32"></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="h-32 bg-gray-50 rounded-lg border border-border"></div>
                    <div className="h-32 bg-gray-50 rounded-lg border border-border"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-40 bg-gray-50 rounded-lg border border-border"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Determine greeting based on current local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const DataShimmer = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
      <div className="md:col-span-2 space-y-10">
        <div>
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div className="h-4 bg-gray-100 rounded w-36"></div>
            <div className="h-4 bg-gray-100 rounded w-16"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-32 bg-gray-50 rounded-lg border border-border"></div>
            <div className="h-32 bg-gray-50 rounded-lg border border-border"></div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div className="h-4 bg-gray-100 rounded w-36"></div>
            <div className="h-4 bg-gray-100 rounded w-16"></div>
          </div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-50 rounded-lg border border-border"></div>
            <div className="h-16 bg-gray-50 rounded-lg border border-border"></div>
          </div>
        </div>
      </div>
      <div className="space-y-8">
        <div className="h-44 bg-gray-50 rounded-lg border border-border"></div>
        <div className="h-32 bg-gray-50 rounded-lg border border-border"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-8 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-5xl px-6 py-10">
          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-normal text-primary tracking-tight font-editorial">
                {getGreeting()}, {user.name}.
              </h1>
              <p className="text-sm text-secondary mt-1 tracking-wide">
                Here is a look at your wishes and upcoming celebrations.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 border border-border rounded text-sm text-secondary hover:text-primary hover:bg-soft transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add Wish</span>
              </button>
              <Link
                href="/dashboard/wishlists/new"
                className="flex items-center space-x-1.5 px-4 py-2 border border-border rounded text-sm text-primary hover:bg-soft transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>New Wishlist</span>
              </Link>
            </div>
          </div>

          {loadingData ? (
            <DataShimmer />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left & Center: Wishlists and Occasions */}
              <div className="md:col-span-2 space-y-10">
                {/* Wishlists Section */}
                <div>
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h2 className="text-sm font-semibold tracking-wider text-secondary uppercase flex items-center space-x-2">
                      <List className="w-4 h-4 text-accent" />
                      <span>Active Wishlists</span>
                    </h2>
                    <Link
                      href="/dashboard/wishlists"
                      className="text-xs text-accent hover:underline font-medium"
                    >
                      View all ({wishlists.length})
                    </Link>
                  </div>

                  {wishlists.length === 0 ? (
                    <div className="border border-dashed border-border rounded-lg p-8 text-center bg-soft">
                      <p className="text-sm text-secondary font-light">No wishlists created yet.</p>
                      <Link
                        href="/dashboard/wishlists"
                        className="text-xs text-accent hover:underline mt-2 inline-block font-medium"
                      >
                        Create your first list
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {wishlists.slice(0, 4).map((w) => (
                        <Link
                          key={w.uuid}
                          href={`/dashboard/wishlists/${w.uuid}`}
                          className="group border border-border rounded-lg p-5 hover:border-accent hover:shadow-sm transition-all duration-200"
                        >
                          <h3 className="font-medium text-primary text-base group-hover:text-accent transition-colors">
                            {w.name}
                          </h3>
                          <p className="text-xs text-secondary mt-1 line-clamp-1 font-light">
                            {w.description || "No description."}
                          </p>
                          <div className="flex items-center justify-between mt-4 text-[11px] text-secondary">
                            <span className="capitalize px-2 py-0.5 rounded bg-soft font-medium border border-border/50">
                              {w.visibility}
                            </span>
                            <span className="font-medium">{w.items_count || 0} wishes</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Stats and Tips */}
              <div className="space-y-8">
                {/* Stats Card */}
                <div className="border border-border rounded-lg p-6 bg-soft">
                  <h3 className="text-xs font-semibold tracking-wider text-secondary uppercase mb-4 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span>Your Collection</span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-3xl font-light text-primary font-editorial">
                        {wishlists.length}
                      </span>
                      <span className="text-xs text-secondary block font-light">Total Wishlists</span>
                    </div>
                  </div>
                </div>

                {/* Helpful Tip */}
                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-accent" />
                    <span>Did you know?</span>
                  </h3>
                  <p className="text-xs text-secondary leading-relaxed font-light">
                    You can share a wishlist with a secret link by setting visibility to{" "}
                    <strong>Unlisted</strong>. Only people with the URL can view it, keeping it out of public search results.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>



        {/* Quick Add Wish Modal */}
        {isQuickAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-lg border border-border max-w-lg w-full p-6 relative my-8">
              <button
                onClick={() => setIsQuickAddOpen(false)}
                className="absolute top-4 right-4 text-secondary hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-normal text-primary font-editorial mb-4">
                Quick Add Wish
              </h3>

              {/* Import URL field */}
              <div className="mb-6 p-4 bg-soft rounded-lg border border-border/50">
                <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                  Paste product link (Jumia, Amazon, Shopify, etc.)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://www.jumia.com/..."
                    className="flex-grow px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                    value={quickAddUrl}
                    onChange={(e) => setQuickAddUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    disabled={quickAddImporting}
                    onClick={handleQuickAddUrlPreview}
                    className="px-4 py-2 border border-accent text-accent font-medium rounded text-xs hover:bg-accent/5 transition-colors disabled:opacity-50"
                  >
                    {quickAddImporting ? "Parsing..." : "Auto Fill"}
                  </button>
                </div>
              </div>

              <form onSubmit={handleQuickAddSubmit} className="space-y-4">
                {quickAddError && (
                  <div className="bg-red-50 text-red-600 text-xs p-2.5 rounded mb-4 text-center border border-red-100">
                    {quickAddError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Add to Wishlist *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent bg-white"
                      value={quickAddWishlistUuid}
                      onChange={(e) => setQuickAddWishlistUuid(e.target.value)}
                    >
                      <option value="">-- Choose a collection --</option>
                      {wishlists.map((w) => (
                        <option key={w.uuid} value={w.uuid}>
                          {w.name} ({w.visibility})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Sony WH-1000XM4 Headphones"
                      className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                      value={quickAddName}
                      onChange={(e) => setQuickAddName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="249.99"
                      className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                      value={quickAddPrice}
                      onChange={(e) => setQuickAddPrice(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Currency
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent bg-white"
                      value={quickAddCurrency}
                      onChange={(e) => setQuickAddCurrency(e.target.value)}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="NGN">NGN (₦)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Store Name
                    </label>
                    <input
                      type="text"
                      placeholder="Jumia, Amazon"
                      className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                      value={quickAddStore}
                      onChange={(e) => setQuickAddStore(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                      value={quickAddQuantity}
                      onChange={(e) => setQuickAddQuantity(e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                      value={quickAddImage}
                      onChange={(e) => setQuickAddImage(e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Notes
                    </label>
                    <textarea
                      placeholder="Add sizing, color preferences, or other notes..."
                      className="w-full px-3 py-2 border border-border rounded text-sm h-16 focus:outline-none focus:border-accent resize-none"
                      value={quickAddNotes}
                      onChange={(e) => setQuickAddNotes(e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Priority
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent bg-white"
                      value={quickAddPriority}
                      onChange={(e) => setQuickAddPriority(e.target.value)}
                    >
                      <option value="nice_to_have">Nice to have</option>
                      <option value="really_want">Really want</option>
                      <option value="must_have">Must have! 🔥</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={quickAddSubmitting}
                  className="w-full py-2.5 bg-accent text-white font-medium rounded hover:bg-accent-dark transition-colors text-sm disabled:opacity-50"
                >
                  {quickAddSubmitting ? "Saving..." : "Add to collection"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
