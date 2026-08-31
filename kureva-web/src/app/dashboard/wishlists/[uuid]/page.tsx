"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import Navbar from "@/components/navigation/Navbar";
import MobileNav from "@/components/navigation/MobileNav";
import { Plus, X, Share2, Edit2, Trash2, ExternalLink, Globe, EyeOff, Link2, AlertCircle, Copy, Check } from "lucide-react";

export default function WishlistDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
  const resolvedParams = use(params);
  const uuid = resolvedParams.uuid;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [wishlist, setWishlist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Edit Wishlist Settings Modal
  const [isEditSettingsOpen, setIsEditSettingsOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCoverImage, setEditCoverImage] = useState("");
  const [editVisibility, setEditVisibility] = useState("");
  
  // Add Item Modal & Form
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importingUrl, setImportingUrl] = useState(false);
  const [importError, setImportError] = useState("");
  
  // New Item details form
  const [itemName, setItemName] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [itemUrl, setItemUrl] = useState("");
  const [itemStore, setItemStore] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCurrency, setItemCurrency] = useState("USD");
  const [itemNotes, setItemNotes] = useState("");
  const [itemPriority, setItemPriority] = useState("nice_to_have");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [addingItem, setAddingItem] = useState(false);

  const fetchWishlist = async () => {
    try {
      const res = await apiRequest(`/api/wishlists/${uuid}`);
      if (res.success && res.data) {
        setWishlist(res.data);
        setEditName(res.data.name);
        setEditDescription(res.data.description || "");
        setEditCoverImage(res.data.cover_image || "");
        setEditVisibility(res.data.visibility);
      }
    } catch (e) {
      console.error(e);
      router.push("/dashboard/wishlists");
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
    fetchWishlist();
  }, [user, authLoading, router]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/w/${uuid}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest(`/api/wishlists/${uuid}`, {
        method: "PATCH",
        data: {
          name: editName,
          description: editDescription,
          cover_image: editCoverImage,
          visibility: editVisibility,
        },
      });
      setIsEditSettingsOpen(false);
      fetchWishlist();
    } catch (err) {
      alert("Failed to update settings");
    }
  };

  const handleDeleteWishlist = async () => {
    if (!confirm("Are you sure you want to delete this wishlist? All items will be permanently removed.")) return;
    try {
      await apiRequest(`/api/wishlists/${uuid}`, { method: "DELETE" });
      router.push("/dashboard/wishlists");
    } catch (err) {
      alert("Failed to delete wishlist");
    }
  };

  const handleUrlPreview = async () => {
    if (!importUrl) return;
    setImportingUrl(true);
    setImportError("");
    try {
      const res = await apiRequest("/api/products/preview", {
        method: "POST",
        data: { url: importUrl },
      });
      if (res.success && res.data) {
        const preview = res.data;
        setItemName(preview.name || "");
        setItemImage(preview.image_url || "");
        setItemUrl(preview.product_url || importUrl);
        setItemStore(preview.store || "");
        setItemPrice(preview.price ? String(preview.price) : "");
        setItemCurrency(preview.currency || "USD");
        setItemNotes(preview.description || "");
      }
    } catch (err: any) {
      setImportError(err.message || "Could not retrieve details. Entering manually.");
      setItemUrl(importUrl);
    } finally {
      setImportingUrl(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName) return;
    setAddingItem(true);
    try {
      await apiRequest(`/api/wishlists/${uuid}/items`, {
        method: "POST",
        data: {
          name: itemName,
          image_url: itemImage,
          product_url: itemUrl,
          store: itemStore,
          price: itemPrice ? parseFloat(itemPrice) : null,
          currency: itemCurrency,
          notes: itemNotes,
          priority: itemPriority,
          quantity: parseInt(itemQuantity) || 1,
        },
      });
      setIsAddItemOpen(false);
      // reset form
      setItemName("");
      setItemImage("");
      setItemUrl("");
      setItemStore("");
      setItemPrice("");
      setItemCurrency("USD");
      setItemNotes("");
      setItemPriority("nice_to_have");
      setItemQuantity("1");
      setImportUrl("");
      fetchWishlist();
    } catch (err) {
      alert("Failed to add wishlist item.");
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Remove this item?")) return;
    try {
      await apiRequest(`/api/wishlists/${uuid}/items/${itemId}`, { method: "DELETE" });
      fetchWishlist();
    } catch (err) {
      alert("Failed to delete item.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <div>
          <Navbar />
          <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
            <div className="h-6 w-32 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-10 w-64 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-24 w-full bg-gray-50 rounded animate-pulse border border-border/40"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-48 bg-gray-50 rounded-lg animate-pulse border border-border/40"></div>
              <div className="h-48 bg-gray-50 rounded-lg animate-pulse border border-border/40"></div>
              <div className="h-48 bg-gray-50 rounded-lg animate-pulse border border-border/40"></div>
            </div>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  if (!wishlist) return null;

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-8 flex flex-col justify-between">
      <div>
        <Navbar />
        
        {/* Cover Section */}
        {wishlist.cover_image && (
          <div className="w-full h-48 md:h-64 bg-gray-100 overflow-hidden relative border-b border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={wishlist.cover_image} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <main className="mx-auto max-w-5xl px-6 py-8">
          {/* Action Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border mb-8">
            <div>
              <div className="flex items-center space-x-2.5 mb-2">
                <span className="text-[11px] tracking-wide text-secondary uppercase font-semibold flex items-center space-x-1.5">
                  {wishlist.visibility === "public" ? (
                    <>
                      <Globe className="w-3.5 h-3.5 text-accent" />
                      <span>Public</span>
                    </>
                  ) : wishlist.visibility === "unlisted" ? (
                    <>
                      <Link2 className="w-3.5 h-3.5 text-blue-500" />
                      <span>Unlisted (Shared)</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                      <span>Private</span>
                    </>
                  )}
                </span>
                <span className="text-[11px] text-secondary">•</span>
                <span className="text-[11px] text-secondary font-medium">Owner view</span>
              </div>
              <h1 className="text-3xl font-normal text-primary tracking-tight font-editorial leading-tight">
                {wishlist.name}
              </h1>
              <p className="text-sm text-secondary mt-1.5 max-w-2xl leading-relaxed font-light">
                {wishlist.description || "Add an understated description."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-1.5 px-3 py-2 border border-border rounded text-sm text-secondary hover:text-primary hover:bg-soft transition-all duration-200"
              >
                {copied ? <Check className="w-4 h-4 text-accent" /> : <Share2 className="w-4 h-4" />}
                <span className="text-xs font-medium">{copied ? "Copied" : "Copy Link"}</span>
              </button>
              <button
                onClick={() => setIsEditSettingsOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-2 border border-border rounded text-sm text-secondary hover:text-primary hover:bg-soft transition-all duration-200"
              >
                <Edit2 className="w-4 h-4" />
                <span className="text-xs font-medium">Settings</span>
              </button>
              <button
                onClick={() => setIsAddItemOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-accent text-white rounded text-sm hover:bg-accent-dark transition-all duration-200 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add Wish</span>
              </button>
            </div>
          </div>

          {/* Items Listing */}
          {wishlist.items.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-lg bg-soft max-w-md mx-auto">
              <Plus className="w-8 h-8 text-secondary/40 mx-auto mb-3" />
              <h3 className="font-medium text-primary text-base mb-1">List is empty</h3>
              <p className="text-xs text-secondary mb-6 leading-relaxed font-light px-6">
                Maybe there is something you&apos;ve been quietly wanting. Add details manually or import via URL.
              </p>
              <button
                onClick={() => setIsAddItemOpen(true)}
                className="px-5 py-2 bg-accent text-white rounded text-sm hover:bg-accent-dark transition-colors font-medium"
              >
                Add your first item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {wishlist.items.map((item: any) => (
                <div
                  key={item.id}
                  className="border border-border rounded-lg overflow-hidden flex flex-col justify-between bg-white group hover:border-accent hover:shadow-sm transition-all duration-200"
                >
                  <div className="relative">
                    {item.image_url ? (
                      <div className="h-44 bg-gray-50 overflow-hidden relative border-b border-border/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-44 bg-soft flex items-center justify-center border-b border-border/40 text-secondary/30">
                        No image
                      </div>
                    )}
                    
                    {/* Priority Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] tracking-wide font-semibold px-2 py-0.5 rounded shadow-sm border ${
                        item.priority === "must_have" 
                          ? "bg-red-50 text-red-600 border-red-100"
                          : item.priority === "really_want"
                            ? "bg-amber-50 text-amber-600 border-amber-100"
                            : "bg-gray-50 text-gray-600 border-gray-100"
                      }`}>
                        {item.priority === "must_have" ? "Must Have" : item.priority === "really_want" ? "Really Want" : "Nice To Have"}
                      </span>
                    </div>

                    {/* Reservation Badge */}
                    {item.reservation_status && (
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] tracking-wide font-semibold px-2 py-0.5 rounded shadow-sm border ${
                          item.reservation_status === "purchased"
                            ? "bg-accent/10 text-accent border-accent/20"
                            : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}>
                          {item.reservation_status === "purchased" ? "Purchased" : "Reserved"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-grow">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-primary text-base leading-snug line-clamp-2">
                        {item.name}
                      </h3>
                      {item.product_url && (
                        <a
                          href={item.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary hover:text-accent p-0.5 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    
                    <div className="mt-2 flex items-baseline space-x-1.5 text-primary">
                      {item.price !== null ? (
                        <>
                          <span className="text-lg font-semibold">{parseFloat(item.price).toFixed(2)}</span>
                          <span className="text-xs text-secondary font-medium uppercase">{item.currency}</span>
                        </>
                      ) : (
                        <span className="text-xs text-secondary font-light">Price not specified</span>
                      )}
                    </div>

                    {item.store && (
                      <span className="inline-block mt-1 text-[11px] text-secondary font-medium uppercase tracking-wider bg-soft px-2 py-0.5 rounded border border-border/50">
                        {item.store}
                      </span>
                    )}

                    {item.notes && (
                      <p className="text-xs text-secondary mt-3 line-clamp-3 font-light leading-relaxed border-t border-border/30 pt-2.5">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="px-5 pb-4 pt-2 flex items-center justify-between border-t border-border/40 bg-soft/30">
                    <span className="text-[10px] text-secondary font-light">Qty: {item.quantity}</span>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                      title="Remove from list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Edit settings modal */}
          {isEditSettingsOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm">
              <div className="bg-white rounded-lg border border-border max-w-md w-full p-6 relative">
                <button
                  onClick={() => setIsEditSettingsOpen(false)}
                  className="absolute top-4 right-4 text-secondary hover:text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-normal text-primary font-editorial mb-4">
                  Wishlist Settings
                </h3>

                <form onSubmit={handleUpdateSettings} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Wishlist Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-border rounded text-sm h-24 focus:outline-none focus:border-accent resize-none"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Cover Image URL
                    </label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                      value={editCoverImage}
                      onChange={(e) => setEditCoverImage(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Visibility
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent bg-white"
                      value={editVisibility}
                      onChange={(e) => setEditVisibility(e.target.value)}
                    >
                      <option value="private">Private</option>
                      <option value="unlisted">Unlisted (Shareable link)</option>
                      <option value="public">Public</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleDeleteWishlist}
                      className="flex-grow py-2 border border-red-200 text-red-500 rounded hover:bg-red-50 text-sm font-medium transition-colors"
                    >
                      Delete Wishlist
                    </button>
                    <button
                      type="submit"
                      className="flex-grow py-2 bg-accent text-white rounded hover:bg-accent-dark text-sm font-medium transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Item Modal */}
          {isAddItemOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white rounded-lg border border-border max-w-lg w-full p-6 relative my-8">
                <button
                  onClick={() => setIsAddItemOpen(false)}
                  className="absolute top-4 right-4 text-secondary hover:text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-normal text-primary font-editorial mb-4">
                  Add something you love
                </h3>

                {/* Import section */}
                <div className="mb-6 p-4 bg-soft rounded-lg border border-border/50">
                  <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                    Paste product link (Jumia, Amazon, Shopify, etc.)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://www.jumia.com/..."
                      className="flex-grow px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={importingUrl}
                      onClick={handleUrlPreview}
                      className="px-4 py-2 border border-accent text-accent font-medium rounded text-xs hover:bg-accent/5 transition-colors disabled:opacity-50"
                    >
                      {importingUrl ? "Parsing..." : "Auto Fill"}
                    </button>
                  </div>
                  {importError && (
                    <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1 font-light">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{importError}</span>
                    </p>
                  )}
                </div>

                <form onSubmit={handleAddItem} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Sony WH-1000XM4 Headphones"
                        className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
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
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                        Currency
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent bg-white"
                        value={itemCurrency}
                        onChange={(e) => setItemCurrency(e.target.value)}
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
                        value={itemStore}
                        onChange={(e) => setItemStore(e.target.value)}
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
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(e.target.value)}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                        Product URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                        value={itemUrl}
                        onChange={(e) => setItemUrl(e.target.value)}
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
                        value={itemImage}
                        onChange={(e) => setItemImage(e.target.value)}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                        Notes / Why you want it
                      </label>
                      <textarea
                        placeholder="Add sizing, color preferences, or other notes..."
                        className="w-full px-3 py-2 border border-border rounded text-sm h-20 focus:outline-none focus:border-accent resize-none"
                        value={itemNotes}
                        onChange={(e) => setItemNotes(e.target.value)}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                        Priority
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent bg-white"
                        value={itemPriority}
                        onChange={(e) => setItemPriority(e.target.value)}
                      >
                        <option value="nice_to_have">Nice to have</option>
                        <option value="really_want">Really want</option>
                        <option value="must_have">Must have! 🔥</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={addingItem}
                    className="w-full py-2.5 mt-2 bg-accent text-white font-medium rounded hover:bg-accent-dark transition-colors text-sm disabled:opacity-50"
                  >
                    {addingItem ? "Saving..." : "Add to collection"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
