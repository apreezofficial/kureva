"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import Navbar from "@/components/navigation/Navbar";
import MobileNav from "@/components/navigation/MobileNav";
import { 
  Plus, 
  X, 
  Share2, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Globe, 
  EyeOff, 
  Link2, 
  AlertCircle, 
  Copy, 
  Check,
  Upload,
  Pencil,
  Loader2
} from "lucide-react";

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
  const [coverUploading, setCoverUploading] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Edit Item Modal State
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemPrice, setEditItemPrice] = useState("");
  const [editItemCurrency, setEditItemCurrency] = useState("USD");
  const [editItemStore, setEditItemStore] = useState("");
  const [editItemImage, setEditItemImage] = useState("");
  const [editItemUrl, setEditItemUrl] = useState("");
  const [editItemNotes, setEditItemNotes] = useState("");
  const [editItemPriority, setEditItemPriority] = useState("nice_to_have");
  const [editItemQuantity, setEditItemQuantity] = useState("1");
  const [savingItem, setSavingItem] = useState(false);
  const [editItemImageUploading, setEditItemImageUploading] = useState(false);
  const editItemFileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("image", file);

    setCoverUploading(true);
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
        setEditCoverImage(data.data.url);
      }
    } catch (err) {
      alert("Failed to upload image");
    } finally {
      setCoverUploading(false);
    }
  };

  const handleEditItemImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("image", file);

    setEditItemImageUploading(true);
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
        setEditItemImage(data.data.url);
      }
    } catch (err) {
      alert("Failed to upload image");
    } finally {
      setEditItemImageUploading(false);
    }
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

  const openEditItemModal = (item: any) => {
    setEditingItem(item);
    setEditItemName(item.name || "");
    setEditItemPrice(item.price !== null ? String(item.price) : "");
    setEditItemCurrency(item.currency || "USD");
    setEditItemStore(item.store || "");
    setEditItemImage(item.image_url || "");
    setEditItemUrl(item.product_url || "");
    setEditItemNotes(item.notes || "");
    setEditItemPriority(item.priority || "nice_to_have");
    setEditItemQuantity(String(item.quantity || 1));
  };

  const handleSaveEditedItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editItemName.trim()) {
      alert("Product name is required.");
      return;
    }

    setSavingItem(true);
    try {
      await apiRequest(`/api/wishlists/${uuid}/items/${editingItem.id}`, {
        method: "PATCH",
        data: {
          name: editItemName,
          price: editItemPrice !== "" ? parseFloat(editItemPrice) : null,
          currency: editItemCurrency,
          store: editItemStore,
          image_url: editItemImage,
          product_url: editItemUrl,
          notes: editItemNotes,
          priority: editItemPriority,
          quantity: parseInt(editItemQuantity) || 1,
        }
      });
      setEditingItem(null);
      fetchWishlist();
    } catch (err: any) {
      alert(err.message || "Failed to update item.");
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Remove this item from your collection?")) return;
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
    <div className="min-h-screen bg-[#fafaf9] pb-24 md:pb-12 flex flex-col justify-between">
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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-6 mb-8">
            <div>
              <div className="flex items-center space-x-2 text-xs text-secondary mb-2 font-medium tracking-wide uppercase">
                <span>{wishlist.visibility} (Shared)</span>
                <span>•</span>
                <span>Owner view</span>
              </div>
              <h1 className="text-3xl font-normal text-primary tracking-tight font-editorial">
                {wishlist.name}
              </h1>
              <p className="text-sm text-secondary mt-1.5 max-w-2xl leading-relaxed font-light">
                {wishlist.description || "Add an understated description."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-1.5 px-3.5 py-2 border border-border rounded-lg text-sm text-secondary hover:text-primary hover:bg-white transition-all duration-200 bg-white/60 shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-accent" /> : <Share2 className="w-4 h-4" />}
                <span className="text-xs font-medium">{copied ? "Copied" : "Copy Link"}</span>
              </button>
              <button
                onClick={() => setIsEditSettingsOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 border border-border rounded-lg text-sm text-secondary hover:text-primary hover:bg-white transition-all duration-200 bg-white/60 shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
                <span className="text-xs font-medium">Settings</span>
              </button>
              <Link
                href={`/dashboard/wishes/new?wishlist=${wishlist.uuid}`}
                className="flex items-center space-x-1.5 px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent-dark transition-all duration-200 font-medium shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Wish</span>
              </Link>
            </div>
          </div>

          {/* Items Listing */}
          {wishlist.items.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-xl bg-white max-w-md mx-auto shadow-sm">
              <Plus className="w-8 h-8 text-secondary/40 mx-auto mb-3" />
              <h3 className="font-medium text-primary text-base mb-1">List is empty</h3>
              <p className="text-xs text-secondary mb-6 leading-relaxed font-light px-6">
                Maybe there is something you&apos;ve been quietly wanting. Add details manually or import via URL.
              </p>
              <Link
                href={`/dashboard/wishes/new?wishlist=${wishlist.uuid}`}
                className="px-5 py-2.5 bg-accent text-white rounded-lg text-sm hover:bg-accent-dark transition-colors font-medium inline-block shadow-sm"
              >
                Add your first item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {wishlist.items.map((item: any) => (
                <div
                  key={item.id}
                  className="border border-border rounded-xl overflow-hidden flex flex-col justify-between bg-white group hover:border-accent hover:shadow-md transition-all duration-200"
                >
                  <div className="relative">
                    {item.image_url ? (
                      <div className="h-48 bg-white overflow-hidden relative border-b border-border/40 p-2 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-44 bg-soft flex items-center justify-center border-b border-border/40 text-secondary/40 text-xs">
                        No image
                      </div>
                    )}
                    
                    {/* Priority Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] tracking-wide font-semibold px-2.5 py-0.5 rounded-full shadow-sm border ${
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
                        <span className={`text-[10px] tracking-wide font-semibold px-2.5 py-0.5 rounded-full shadow-sm border ${
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
                      <h3 className="font-medium text-primary text-sm leading-snug line-clamp-2">
                        {item.name}
                      </h3>
                      {item.product_url && (
                        <a
                          href={item.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary hover:text-accent p-0.5 transition-colors shrink-0"
                          title="Visit store product link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    
                    <div className="mt-2.5 flex items-baseline space-x-1.5 text-primary">
                      {item.price !== null && item.price !== "" ? (
                        <>
                          <span className="text-base font-bold text-accent">
                            {item.currency === "NGN" ? "₦" : item.currency === "USD" ? "$" : item.currency === "EUR" ? "€" : item.currency === "GBP" ? "£" : `${item.currency} `}
                            {parseFloat(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-secondary/70 font-light italic">Price not specified</span>
                      )}
                    </div>

                    {item.store && (
                      <span className="inline-block mt-2 text-[10px] text-secondary font-medium uppercase tracking-wider bg-soft px-2 py-0.5 rounded border border-border/50">
                        {item.store}
                      </span>
                    )}

                    {item.notes && (
                      <p className="text-xs text-secondary mt-3 line-clamp-2 font-light leading-relaxed border-t border-border/30 pt-2.5">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Card Actions: Edit & Delete */}
                  <div className="px-5 pb-3.5 pt-2.5 flex items-center justify-between border-t border-border/40 bg-soft/40">
                    <span className="text-[11px] text-secondary font-light">Qty: {item.quantity}</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditItemModal(item)}
                        className="text-secondary hover:text-primary transition-colors p-1.5 rounded hover:bg-white"
                        title="Edit Wish"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded hover:bg-red-50"
                        title="Remove from list"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Edit Wish Item Modal */}
          {editingItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/25 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white rounded-xl border border-border max-w-lg w-full p-6 relative my-8 shadow-xl">
                <button
                  onClick={() => setEditingItem(null)}
                  className="absolute top-4 right-4 text-secondary hover:text-primary p-1 rounded-full hover:bg-soft"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <h3 className="text-xl font-normal text-primary font-editorial mb-1">
                  Edit Wish
                </h3>
                <p className="text-xs text-secondary mb-5 font-light">
                  Update the price, photo, link, or notes for this item.
                </p>

                <form onSubmit={handleSaveEditedItem} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                      value={editItemName}
                      onChange={(e) => setEditItemName(e.target.value)}
                    />
                  </div>

                  {/* Image Uploader & Preview */}
                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Product Image
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="h-16 w-16 border border-border rounded-lg overflow-hidden relative bg-soft shrink-0 flex items-center justify-center">
                        {editItemImage ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={editItemImage} alt="" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setEditItemImage("")}
                              className="absolute top-0.5 right-0.5 p-0.5 bg-primary/80 rounded-full text-white hover:bg-red-600"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </>
                        ) : (
                          <Upload className="w-4 h-4 text-secondary/40" />
                        )}
                      </div>

                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          ref={editItemFileInputRef}
                          className="hidden"
                          onChange={handleEditItemImageUpload}
                        />
                        <button
                          type="button"
                          disabled={editItemImageUploading}
                          onClick={() => editItemFileInputRef.current?.click()}
                          className="px-3.5 py-1.5 border border-border hover:border-accent rounded-md text-xs font-semibold text-secondary hover:text-primary transition-all bg-white flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{editItemImageUploading ? "Uploading..." : "Upload New Photo"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Price & Currency */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                        Price (Optional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                        value={editItemPrice}
                        onChange={(e) => setEditItemPrice(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                        Currency
                      </label>
                      <select
                        className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-white"
                        value={editItemCurrency}
                        onChange={(e) => setEditItemCurrency(e.target.value)}
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
                      <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                        Store
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Jumia, Amazon"
                        className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                        value={editItemStore}
                        onChange={(e) => setEditItemStore(e.target.value)}
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
                        value={editItemQuantity}
                        onChange={(e) => setEditItemQuantity(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Product URL */}
                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Product URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                      value={editItemUrl}
                      onChange={(e) => setEditItemUrl(e.target.value)}
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Notes / Size / Color
                    </label>
                    <textarea
                      placeholder="Add details, size, preferred color..."
                      className="w-full px-3.5 py-2 border border-border rounded-lg text-sm h-16 focus:outline-none focus:border-accent resize-none font-light"
                      value={editItemNotes}
                      onChange={(e) => setEditItemNotes(e.target.value)}
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Priority
                    </label>
                    <select
                      className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-white"
                      value={editItemPriority}
                      onChange={(e) => setEditItemPriority(e.target.value)}
                    >
                      <option value="nice_to_have">Nice to have</option>
                      <option value="really_want">Really want</option>
                      <option value="must_have">Must have! 🔥</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="w-1/3 py-2.5 border border-border rounded-lg text-xs font-semibold text-secondary hover:text-primary hover:bg-soft"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingItem}
                      className="w-2/3 py-2.5 bg-accent text-white rounded-lg text-xs font-semibold hover:bg-accent-dark transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {savingItem ? (
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
              </div>
            </div>
          )}

          {/* Edit Wishlist Settings Modal */}
          {isEditSettingsOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm">
              <div className="bg-white rounded-xl border border-border max-w-md w-full p-6 relative shadow-xl">
                <button
                  onClick={() => setIsEditSettingsOpen(false)}
                  className="absolute top-4 right-4 text-secondary hover:text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-normal text-primary font-editorial mb-4">
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
                      className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full px-3.5 py-2 border border-border rounded-lg text-sm h-24 focus:outline-none focus:border-accent resize-none font-light"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>

                  {/* Cover image uploader */}
                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Cover Image
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="h-14 w-14 border border-border rounded-lg overflow-hidden relative bg-soft shrink-0 flex items-center justify-center">
                        {editCoverImage ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={editCoverImage} alt="" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setEditCoverImage("")}
                              className="absolute top-0.5 right-0.5 p-0.5 bg-primary/80 rounded-full text-white hover:bg-red-600"
                            >
                              <X className="w-2 h-2" />
                            </button>
                          </>
                        ) : (
                          <Upload className="w-4 h-4 text-secondary/40" />
                        )}
                      </div>

                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          ref={coverFileInputRef}
                          className="hidden"
                          onChange={handleCoverUpload}
                        />
                        <button
                          type="button"
                          disabled={coverUploading}
                          onClick={() => coverFileInputRef.current?.click()}
                          className="px-3 py-1.5 border border-border rounded-md text-xs font-semibold text-secondary hover:text-primary transition-all bg-white shadow-sm disabled:opacity-50"
                        >
                          {coverUploading ? "Uploading..." : "Upload Cover"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                      Visibility
                    </label>
                    <select
                      className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-white"
                      value={editVisibility}
                      onChange={(e) => setEditVisibility(e.target.value)}
                    >
                      <option value="private">Private</option>
                      <option value="unlisted">Unlisted (Shareable link)</option>
                      <option value="public">Public</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={handleDeleteWishlist}
                      className="flex-grow py-2.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 text-xs font-semibold transition-colors"
                    >
                      Delete Wishlist
                    </button>
                    <button
                      type="submit"
                      className="flex-grow py-2.5 bg-accent text-white rounded-lg hover:bg-accent-dark text-xs font-semibold transition-colors shadow-sm"
                    >
                      Save Changes
                    </button>
                  </div>
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
