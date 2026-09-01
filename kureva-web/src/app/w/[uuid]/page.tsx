"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { 
  ExternalLink, 
  Gift, 
  Heart, 
  HelpCircle, 
  Check, 
  ArrowLeft, 
  X,
  Share2,
  Sparkles,
  ShoppingBag,
  Store,
  User,
  ShieldCheck,
  Loader2
} from "lucide-react";

export default function PublicWishlistPage({ params }: { params: Promise<{ uuid: string }> }) {
  const resolvedParams = use(params);
  const uuid = resolvedParams.uuid;
  
  const [wishlist, setWishlist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Reservation Modal states
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [actionType, setActionType] = useState<"reserve" | "purchase">("reserve");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchWishlist = async () => {
    try {
      const res = await apiRequest(`/api/wishlists/${uuid}`);
      if (res.success && res.data) {
        setWishlist(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load wishlist. It may be private or deleted.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [uuid]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenModal = (item: any, type: "reserve" | "purchase") => {
    setSelectedItem(item);
    setActionType(type);
    setGuestName("");
    setGuestEmail("");
    setSuccessMsg("");
    setError("");
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSubmitting(true);
    setError("");

    try {
      const endpoint = `/api/items/${selectedItem.id}/${actionType}`;
      const res = await apiRequest(endpoint, {
        method: "POST",
        data: { name: guestName, email: guestEmail },
      });

      if (res.success) {
        setSuccessMsg(res.message || "Thank you! The gift status has been updated.");
        setTimeout(() => {
          setSelectedItem(null);
          fetchWishlist();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency?.toUpperCase()) {
      case "NGN": return "₦";
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "JPY": return "¥";
      default: return currency ? `${currency} ` : "$";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex flex-col justify-between">
        <div>
          <div className="h-16 border-b border-border bg-white animate-pulse"></div>
          <div className="h-56 md:h-72 bg-gray-200 animate-pulse w-full"></div>
          <div className="mx-auto max-w-5xl px-6 py-12 space-y-8">
            <div className="h-12 w-2/3 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-5 w-1/3 bg-gray-100 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4">
              <div className="h-80 bg-white border border-border/80 rounded-2xl animate-pulse"></div>
              <div className="h-80 bg-white border border-border/80 rounded-2xl animate-pulse"></div>
              <div className="h-80 bg-white border border-border/80 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !wishlist) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#fafaf9] px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
          <Gift className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-normal text-primary font-editorial mb-2">Wishlist Unavailable</h2>
        <p className="text-sm text-secondary max-w-sm mb-6 font-light">{error}</p>
        <Link 
          href="/" 
          className="text-xs px-5 py-2.5 bg-accent text-white rounded-xl font-semibold hover:bg-accent-dark transition-all shadow-sm"
        >
          Back to Kureva
        </Link>
      </div>
    );
  }

  const items = wishlist.items || [];
  const reservedCount = items.filter((it: any) => !!it.reservation_status).length;

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-24 flex flex-col justify-between">
      <div>
        {/* Top Minimalist Brand Header */}
        <header className="border-b border-border/60 bg-white/80 backdrop-blur-md sticky top-0 z-40">
          <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
            <Link 
              href="/" 
              className="font-editorial text-2xl font-normal text-primary tracking-tight hover:opacity-80 transition-opacity"
            >
              kureva
            </Link>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 border border-border rounded-lg text-xs font-semibold text-secondary hover:text-primary hover:bg-soft transition-all bg-white shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{copied ? "Link Copied" : "Share List"}</span>
              </button>
              <Link
                href="/register"
                className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-1.5 bg-accent text-white rounded-lg text-xs font-semibold hover:bg-accent-dark transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Your List</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Cover Banner */}
        {wishlist.cover_image && (
          <div className="w-full h-48 sm:h-64 md:h-80 bg-gray-100 overflow-hidden relative border-b border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={wishlist.cover_image} 
              alt={wishlist.name} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          </div>
        )}

        {/* Main Wishlist Registry Body */}
        <main className="mx-auto max-w-5xl px-6 py-10">
          
          {/* Wishlist Header & Bio Card */}
          <div className="bg-white border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm mb-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] tracking-wider font-semibold text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Wishlist Registry</span>
                  </span>
                  <span className="text-xs text-secondary font-light">
                    {items.length} {items.length === 1 ? "gift" : "gifts"} • {reservedCount} reserved
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-normal text-primary font-editorial tracking-tight leading-tight">
                  {wishlist.name}
                </h1>

                <div className="flex items-center space-x-2 pt-1">
                  <div className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-semibold">
                    {wishlist.owner_name ? wishlist.owner_name[0].toUpperCase() : (wishlist.username ? wishlist.username[0].toUpperCase() : "U")}
                  </div>
                  <p className="text-xs text-secondary font-light">
                    Curated by{" "}
                    <Link 
                      href={`/${wishlist.username}`} 
                      className="text-primary font-semibold hover:text-accent hover:underline transition-colors"
                    >
                      @{wishlist.username}
                    </Link>
                  </p>
                </div>

                {wishlist.description && (
                  <div className="mt-4 p-4 rounded-xl bg-soft/60 border border-border/50 text-xs sm:text-sm text-secondary leading-relaxed font-light break-words">
                    &ldquo;{wishlist.description}&rdquo;
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-normal text-primary font-editorial tracking-tight">
              Gift Registry Items ({items.length})
            </h2>
            <span className="text-xs text-secondary font-light">
              Select an item below to reserve or mark as bought
            </span>
          </div>

          {/* Item Cards Grid */}
          {items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border p-8 shadow-sm">
              <Gift className="w-10 h-10 text-secondary/30 mx-auto mb-3" />
              <h3 className="text-base font-normal text-primary font-editorial mb-1">
                No wishes added yet
              </h3>
              <p className="text-xs text-secondary font-light max-w-sm mx-auto">
                The creator hasn&apos;t added any items to this collection yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {items.map((item: any) => {
                const isReserved = !!item.reservation_status;
                const isPurchased = item.reservation_status === "purchased";

                return (
                  <div
                    key={item.id}
                    className="border border-border/80 rounded-2xl overflow-hidden flex flex-col justify-between bg-white group hover:border-accent hover:shadow-md transition-all duration-300"
                  >
                    <div>
                      {/* Card Media Container */}
                      <div className="h-52 bg-white relative p-4 flex items-center justify-center border-b border-border/40 overflow-hidden">
                        {item.image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-secondary/40 space-y-1">
                            <ShoppingBag className="w-8 h-8 stroke-1" />
                            <span className="text-[11px] font-light">No photo provided</span>
                          </div>
                        )}

                        {/* Priority Pill (Top-Left) */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className={`text-[10px] tracking-wide font-semibold px-2.5 py-0.5 rounded-full shadow-xs border ${
                            item.priority === "must_have" 
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : item.priority === "really_want"
                                ? "bg-amber-50 text-amber-600 border-amber-100"
                                : "bg-stone-50 text-stone-600 border-stone-200"
                          }`}>
                            {item.priority === "must_have" ? "🔥 Must Have" : item.priority === "really_want" ? "✨ Really Want" : "Nice To Have"}
                          </span>
                        </div>

                        {/* Store Link Button (Top-Right) */}
                        {item.product_url && (
                          <a
                            href={item.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-3 right-3 z-10 p-1.5 bg-white/90 hover:bg-white text-secondary hover:text-primary rounded-lg border border-border/70 shadow-xs transition-all"
                            title="View product at store"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Reservation Frosted Overlay */}
                        {isReserved && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-4 text-center">
                            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border shadow-sm mb-1 ${
                              isPurchased 
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-blue-600 text-white border-blue-600"
                            }`}>
                              {isPurchased ? "✓ Purchased by a guest" : "Reserved by a guest"}
                            </span>
                            <p className="text-[10px] text-secondary font-light">
                              {isPurchased ? "This item is already bought." : "Someone has reserved this gift."}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-medium text-primary text-sm leading-snug line-clamp-2 break-words">
                            {item.name}
                          </h3>
                        </div>

                        {/* Formatted Price */}
                        <div className="mt-1 flex items-baseline space-x-1.5">
                          {item.price !== null && item.price !== "" ? (
                            <span className="text-base font-bold text-accent">
                              {getCurrencySymbol(item.currency)}
                              {parseFloat(item.price).toLocaleString(undefined, { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </span>
                          ) : (
                            <span className="text-xs text-secondary/70 font-light italic">
                              Price not listed
                            </span>
                          )}
                          <span className="text-[11px] text-secondary font-light">
                            • Qty: {item.quantity || 1}
                          </span>
                        </div>

                        {/* Store Tag */}
                        {item.store && (
                          <div className="mt-2.5">
                            <span className="inline-flex items-center space-x-1 text-[10px] text-secondary font-medium uppercase tracking-wider bg-soft px-2 py-0.5 rounded border border-border/50">
                              <Store className="w-2.5 h-2.5" />
                              <span>{item.store}</span>
                            </span>
                          </div>
                        )}

                        {/* Notes / Sizing */}
                        {item.notes && (
                          <div className="mt-3 p-2.5 rounded-lg bg-soft/50 border border-border/40 text-[11px] text-secondary leading-relaxed font-light break-words">
                            &ldquo;{item.notes}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-4 pt-0">
                      {isReserved ? (
                        <div className="w-full text-center py-2.5 text-xs text-secondary font-medium bg-soft rounded-xl border border-border/40 select-none">
                          {isPurchased ? "Purchased ✓" : "Reserved"}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(item, "reserve")}
                            className="flex-1 py-2.5 border border-border hover:border-primary/40 text-primary bg-white hover:bg-soft rounded-xl text-xs font-semibold transition-all shadow-xs"
                          >
                            Reserve
                          </button>
                          <button
                            onClick={() => handleOpenModal(item, "purchase")}
                            className="flex-1 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
                          >
                            I bought this
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reservation Guest Modal */}
          {selectedItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/30 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl border border-border max-w-sm w-full p-6 relative shadow-2xl">
                {!successMsg && (
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-4 right-4 text-secondary hover:text-primary p-1 rounded-full hover:bg-soft"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <div className="mb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full inline-block mb-1.5">
                    {actionType === "purchase" ? "Mark as Purchased" : "Reserve Gift"}
                  </span>
                  <h3 className="text-xl font-normal text-primary font-editorial">
                    {actionType === "purchase" ? "Claim this Gift" : "Reserve this Wish"}
                  </h3>
                </div>
                
                <p className="text-xs text-secondary mb-5 leading-relaxed font-light break-words">
                  You are selecting <strong className="text-primary font-medium">{selectedItem.name}</strong>. This hides it from other guests to prevent duplicates.
                </p>

                {successMsg ? (
                  <div className="py-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-primary">{successMsg}</p>
                    <p className="text-xs text-secondary font-light">
                      Updating registry view...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleAction} className="space-y-4">
                    {error && (
                      <div className="bg-red-50 text-red-600 text-xs p-2.5 rounded-lg border border-red-100 text-center font-medium">
                        {error}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kenji"
                        className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">
                        Your Email (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. kenji@example.com"
                        className="w-full px-3.5 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                      />
                    </div>

                    <div className="bg-soft/70 p-3 rounded-xl text-[11px] text-secondary font-light leading-relaxed border border-border/50 flex items-start space-x-2">
                      <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>
                        <strong>Surprise Protection:</strong> The wishlist owner won&apos;t see who reserved this until they open their gifts!
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(null)}
                        className="w-1/3 py-2.5 border border-border rounded-xl text-xs font-semibold text-secondary hover:text-primary hover:bg-soft"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-2/3 py-2.5 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl text-xs shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <span>{actionType === "purchase" ? "Confirm Purchase" : "Reserve Gift"}</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-white py-10 mt-12 text-center text-xs text-secondary">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Link href="/" className="font-editorial text-xl font-normal text-primary tracking-tight">
              kureva
            </Link>
            <span className="text-secondary/40">•</span>
            <span className="font-light">Modern Wishlist & Registry Platform</span>
          </div>

          <div className="flex items-center space-x-4 font-medium text-xs">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="/login" className="hover:text-primary transition-colors">Sign In</Link>
            <Link href="/register" className="text-accent hover:underline">Create a Wishlist</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
