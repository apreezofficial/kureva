"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiRequest, uploadFile } from "@/lib/api";
import Navbar from "@/components/navigation/Navbar";
import MobileNav from "@/components/navigation/MobileNav";
import { ArrowLeft, Upload, X, AlertCircle, Sparkles, Trash2, Loader2 } from "lucide-react";

export default function EditWishItemPage({ 
  params 
}: { 
  params: Promise<{ uuid: string; itemId: string }> 
}) {
  const resolvedParams = use(params);
  const { uuid, itemId } = resolvedParams;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [store, setStore] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("nice_to_have");

  const [imageUploading, setImageUploading] = useState(false);
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

    const fetchItem = async () => {
      try {
        const res = await apiRequest(`/api/wishlists/${uuid}`);
        if (res.success && res.data) {
          const items = res.data.items || [];
          const found = items.find((it: any) => String(it.id) === String(itemId));
          if (found) {
            setName(found.name || "");
            setPrice(found.price !== null && found.price !== undefined ? String(found.price) : "");
            setCurrency(found.currency || "USD");
            setStore(found.store || "");
            setImageUrl(found.image_url || "");
            setProductUrl(found.product_url || "");
            setQuantity(String(found.quantity || 1));
            setNotes(found.notes || "");
            setPriority(found.priority || "nice_to_have");
          } else {
            router.push(`/dashboard/wishlists/${uuid}`);
          }
        }
      } catch (err: any) {
        setError("Failed to load item details.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [user, authLoading, router, uuid, itemId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("image", file);

    setImageUploading(true);
    setError("");

    try {
      const uploadedUrl = await uploadFile(file);
      setImageUrl(uploadedUrl);
      setSuccess("Image uploaded successfully!");
    } catch (err: any) {
      setError(err?.message || "An error occurred during file upload.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await apiRequest(`/api/wishlists/${uuid}/items/${itemId}`, {
        method: "PATCH",
        data: {
          name: name.trim(),
          price: price !== "" ? parseFloat(price) : null,
          currency,
          store: store.trim() || undefined,
          image_url: imageUrl || undefined,
          product_url: productUrl.trim() || undefined,
          notes: notes.trim() || undefined,
          priority,
          quantity: parseInt(quantity) || 1,
        }
      });

      if (res.success) {
        router.push(`/dashboard/wishlists/${uuid}`);
      } else {
        setError(res.error?.message || "Failed to update item.");
        setSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save changes.");
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this item from your collection?")) return;
    setDeleting(true);
    try {
      await apiRequest(`/api/wishlists/${uuid}/items/${itemId}`, { method: "DELETE" });
      router.push(`/dashboard/wishlists/${uuid}`);
    } catch (err: any) {
      alert("Failed to delete item.");
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
                Edit Wish
              </h1>
              <p className="text-xs text-secondary leading-relaxed font-light">
                Update price, photo, sizing, notes, or store details.
              </p>
            </div>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleting ? "Deleting..." : "Delete"}</span>
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
            {/* Product Name */}
            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                required
                placeholder="Product name"
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Product Image */}
            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Product Photo
              </label>
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 border border-border rounded-xl overflow-hidden relative bg-soft shrink-0 flex items-center justify-center">
                  {imageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="" className="h-full w-full object-contain p-1" />
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
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
                    onChange={handleImageUpload}
                  />
                  <button
                    type="button"
                    disabled={imageUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-border hover:border-accent rounded-lg text-xs font-semibold text-secondary hover:text-primary transition-all bg-white flex items-center space-x-2 shadow-sm disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{imageUploading ? "Uploading..." : "Upload New Photo"}</span>
                  </button>
                  <p className="text-[10px] text-secondary/60 mt-1 font-light">
                    PNG, JPG, or WebP up to 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Price & Currency */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Price (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Currency
                </label>
                <select
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-white font-medium"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="NGN">NGN (₦)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </div>

            {/* Store & Quantity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Store Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jumia, Amazon, Zara"
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
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
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </div>

            {/* Product Link URL */}
            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Product Link URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent font-light"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
              />
            </div>

            {/* Notes / Sizing */}
            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Notes / Size / Color Preferences
              </label>
              <textarea
                placeholder="Add sizing, preferred color, or special guidelines..."
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm h-20 focus:outline-none focus:border-accent resize-none font-light"
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
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-white font-medium"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="nice_to_have">Nice to have</option>
                <option value="really_want">Really want</option>
                <option value="must_have">Must have! 🔥</option>
              </select>
            </div>

            {/* Form Actions */}
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
                  <span>Save Changes</span>
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
