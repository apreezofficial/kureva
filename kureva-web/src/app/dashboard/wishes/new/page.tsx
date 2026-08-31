"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import Navbar from "@/components/navigation/Navbar";
import MobileNav from "@/components/navigation/MobileNav";
import { 
  ArrowLeft, 
  Sparkles, 
  Upload, 
  Link2, 
  X, 
  AlertCircle, 
  ShoppingBag, 
  FolderHeart,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";

function NewWishForm() {
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
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  const [showManualDetails, setShowManualDetails] = useState(false);

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

  // Automated link preview extraction
  const fetchUrlPreview = useCallback(async (linkToFetch: string) => {
    const trimmed = linkToFetch.trim();
    if (!trimmed || !trimmed.startsWith("http")) return;

    setImporting(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiRequest("/api/products/preview", {
        method: "POST",
        data: { url: trimmed },
      });

      if (res.success && res.data) {
        const preview = res.data;
        if (preview.name) setName(preview.name);
        if (preview.image_url) setImageUrl(preview.image_url);
        if (preview.store) setStore(preview.store);
        if (preview.price) setPrice(String(preview.price));
        if (preview.currency) setCurrency(preview.currency);
        if (preview.description) setNotes(preview.description);
        
        setHasAutoFilled(true);
        setSuccess(`Fetched details from ${preview.store || "store"}`);
      }
    } catch (err: any) {
      // If auto-fetch fails, keep URL but allow manual edits
      console.log("Preview error:", err);
    } finally {
      setImporting(false);
    }
  }, []);

  // Handle URL change with auto-debounce
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (newUrl.startsWith("http://") || newUrl.startsWith("https://")) {
      const timeout = setTimeout(() => {
        fetchUrlPreview(newUrl);
      }, 700);
      return () => clearTimeout(timeout);
    }
  };

  // Handle direct paste event for instant extraction
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted && (pasted.startsWith("http://") || pasted.startsWith("https://"))) {
      setUrl(pasted);
      fetchUrlPreview(pasted);
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
      setError("Please select a wishlist to add this item to.");
      return;
    }
    
    // If no name is typed and no URL given, error
    if (!name.trim() && !url.trim()) {
      setError("Please paste a product link or enter an item name.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await apiRequest(`/api/wishlists/${wishlistUuid}/items`, {
        method: "POST",
        data: {
          name: name.trim() || undefined, // Backend will auto-resolve if undefined
          image_url: imageUrl || undefined,
          product_url: url || undefined,
          store: store || undefined,
          price: price ? parseFloat(price) : null,
          currency,
          notes: notes || undefined,
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
    <div className="min-h-screen bg-[#fafaf9] pb-24 md:pb-12 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-xl px-6 py-10">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="flex items-center space-x-1.5 text-xs text-secondary hover:text-primary transition-colors font-medium tracking-wide uppercase"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Collection</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-normal text-primary tracking-tight font-editorial mb-2">
              Add a Wish
            </h1>
            <p className="text-xs text-secondary leading-relaxed font-light">
              Paste any store link and we&apos;ll do the rest, or enter details manually.
            </p>
          </div>

          {error && (
            <div className="bg-red-50/70 text-red-700 text-xs p-3.5 rounded-lg mb-6 text-center border border-red-100 flex items-center justify-center space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50/70 text-green-700 text-xs p-3.5 rounded-lg mb-6 text-center border border-green-100 flex items-center justify-center space-x-2 font-medium animate-fade-in">
              <Sparkles className="w-4 h-4 shrink-0 text-green-500" />
              <span>{success}</span>
            </div>
          )}

          {/* Empty State for Wishlists */}
          {!loadingLists && wishlists.length === 0 ? (
            <div className="bg-white border border-border rounded-xl p-8 text-center max-w-md mx-auto shadow-sm my-8">
              <FolderHeart className="w-12 h-12 text-secondary/30 mx-auto mb-4" />
              <h3 className="text-lg font-normal text-primary font-editorial mb-2">Create a wishlist first</h3>
              <p className="text-xs text-secondary leading-relaxed mb-6 font-light">
                You need at least one wishlist to host your wishes. Create one in seconds!
              </p>
              <Link
                href="/dashboard/wishlists/new"
                className="inline-block px-6 py-2.5 bg-accent text-white rounded text-xs font-semibold hover:bg-accent-dark transition-all duration-200"
              >
                Create your first wishlist
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Target Wishlist Select */}
              <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
                <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-2">
                  Destination Wishlist
                </label>
                {loadingLists ? (
                  <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
                ) : (
                  <select
                    required
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-white font-medium text-primary"
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

              {/* PRIMARY: Product Link (Auto-detect) */}
              <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center space-x-1.5">
                    <Link2 className="w-3.5 h-3.5 text-accent" />
                    <span>Product Link</span>
                  </label>
                  {importing && (
                    <span className="text-[11px] text-accent flex items-center space-x-1 font-medium animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Fetching details...</span>
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="url"
                    placeholder="Paste link from Jumia, Amazon, Zara, ASOS..."
                    className="w-full pl-3.5 pr-24 py-3 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-soft/30 focus:bg-white transition-all placeholder:text-secondary/50"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onPaste={handlePaste}
                  />
                  <button
                    type="button"
                    onClick={() => fetchUrlPreview(url)}
                    disabled={importing || !url}
                    className="absolute right-2 top-2 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-md hover:bg-primary-dark transition-colors disabled:opacity-40"
                  >
                    {importing ? "..." : "Auto Fill"}
                  </button>
                </div>
                <p className="text-[11px] text-secondary mt-2 font-light">
                  Just paste a link — title, image, price, and store will be extracted automatically!
                </p>

                {/* Auto-Fetched Preview Badge */}
                {hasAutoFilled && (
                  <div className="mt-4 p-4 border border-green-200/80 bg-green-50/60 rounded-xl flex items-center space-x-4 animate-fade-in">
                    {imageUrl ? (
                      <div className="h-16 w-16 bg-white border border-border/80 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt="" className="h-full w-full object-contain" />
                      </div>
                    ) : (
                      <div className="h-16 w-16 bg-white border border-border/80 rounded-lg shrink-0 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-accent/60" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-primary line-clamp-2 leading-snug">
                        {name || "Item from link"}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-secondary">
                        {price ? (
                          <span className="font-semibold text-accent">{currency} {parseFloat(price).toLocaleString()}</span>
                        ) : (
                          <span className="text-[10px] text-secondary font-light italic">Price not listed (Optional)</span>
                        )}
                        {store && (
                          <span className="px-2 py-0.5 bg-white border border-border rounded-full text-[10px] font-medium text-primary">
                            {store}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Toggle manual details accordion */}
              <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4">
                <button
                  type="button"
                  onClick={() => setShowManualDetails(!showManualDetails)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-primary uppercase tracking-wider text-left"
                >
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="w-4 h-4 text-accent" />
                    <span>{hasAutoFilled ? "Edit Extracted Details" : "Or Enter Details Manually"}</span>
                  </div>
                  {showManualDetails ? (
                    <ChevronUp className="w-4 h-4 text-secondary" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-secondary" />
                  )}
                </button>

                {(showManualDetails || !url) && (
                  <div className="space-y-4 pt-2 border-t border-border/60">
                    {/* Item Name */}
                    <div>
                      <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                        Product Name {!url && "*"}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sony WH-1000XM4 Noise Cancelling Headset"
                        className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={!url}
                      />
                    </div>

                    {/* Image Upload Area */}
                    <div>
                      <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                        Product Image
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 border border-border rounded-lg overflow-hidden relative bg-soft shrink-0 flex items-center justify-center">
                          {imageUrl ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={imageUrl} alt="Item" className="h-full w-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setImageUrl("")}
                                className="absolute top-0.5 right-0.5 p-0.5 bg-primary/80 rounded-full text-white hover:bg-red-600 transition-colors"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </>
                          ) : (
                            <Upload className="w-5 h-5 text-secondary/40" />
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
                            className="px-3.5 py-1.5 border border-border hover:border-accent rounded-md text-xs font-semibold text-secondary hover:text-primary transition-all bg-white flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{imageUploading ? "Uploading..." : "Upload Image"}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Price and Currency */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
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
                        <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                          Currency
                        </label>
                        <select
                          className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-white"
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                        >
                          <option value="USD">USD ($)</option>
                          <option value="NGN">NGN (₦)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="JPY">JPY (¥)</option>
                        </select>
                      </div>
                    </div>

                    {/* Store and Quantity */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                          Store Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Jumia, Amazon, Zara"
                          className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
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
                          className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                        Notes / Size / Color
                      </label>
                      <textarea
                        placeholder="Add sizing, color, or special guidelines..."
                        className="w-full px-3.5 py-2 border border-border rounded-lg text-sm h-20 focus:outline-none focus:border-accent resize-none font-light"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
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
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || (wishlists.length === 0)}
                className="w-full py-3.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent-dark transition-all duration-200 text-sm disabled:opacity-50 shadow-sm flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding to Collection...</span>
                  </>
                ) : (
                  <span>Add to collection</span>
                )}
              </button>
            </form>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

export default function NewWishPage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <NewWishForm />
    </Suspense>
  );
}

