"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import WishlistStoryCardModal from "@/components/wishlist/WishlistStoryCardModal";
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
  Loader2,
  PackageCheck,
  Bookmark,
  ChevronRight,
  Info,
  Clock,
  CheckCircle2
} from "lucide-react";

export default function PublicWishlistPage({ params }: { params: Promise<{ uuid: string }> }) {
  const resolvedParams = use(params);
  const uuid = resolvedParams.uuid;
  
  const [wishlist, setWishlist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  // Reservation Modal states
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [actionType, setActionType] = useState<"reserve" | "purchase">("purchase");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestNote, setGuestNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

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
    setGuestNote("");
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
        data: { 
          name: guestName, 
          email: guestEmail,
          note: guestNote 
        },
      });

      if (res.success) {
        setSuccessMsg(res.message || "Thank you! The gift claim is recorded.");
        setTimeout(() => {
          setSelectedItem(null);
          fetchWishlist();
        }, 1800);
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
  const claimedCount = items.filter((it: any) => !!it.reservation_status).length;
  const verifiedCount = items.filter((it: any) => !!it.is_verified).length;
  const progressPercent = items.length > 0 ? Math.round((claimedCount / items.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#fcfbf9] pb-24 flex flex-col justify-between selection:bg-emerald-100">
      <div>
        {/* Top Minimalist Brand Header */}
        <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40">
          <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
            <Link 
              href="/" 
              className="font-editorial text-2xl font-normal text-primary tracking-tight hover:opacity-80 transition-opacity"
            >
              kureva
            </Link>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => setIsStoryModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#1b7a43] hover:bg-[#145d33] text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-98"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share & Story Card</span>
              </button>
              
              <button
                onClick={handleCopyLink}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 border border-stone-200 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 transition-all shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{copied ? "Link Copied" : "Copy Link"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Cover Banner */}
        {wishlist.cover_image && (
          <div className="w-full h-48 sm:h-64 md:h-80 bg-stone-100 overflow-hidden relative border-b border-stone-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={wishlist.cover_image} 
              alt={wishlist.name} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
          </div>
        )}

        {/* Main Wishlist Registry Body */}
        <main className="mx-auto max-w-5xl px-6 py-8">
          
          {/* Wishlist Header & Registry Banner Card */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-xs mb-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3.5 flex-1">
                
                {/* Official Registry Badge & Curator Pill */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[11px] tracking-wider font-semibold text-emerald-800 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Official Gift Registry</span>
                  </span>
                  
                  <Link 
                    href={`/${wishlist.username}`}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-xs font-medium transition-colors"
                  >
                    <User className="w-3 h-3 text-stone-500" />
                    <span>Curated by <strong className="text-stone-900">@{wishlist.username}</strong></span>
                  </Link>
                </div>

                <h1 className="text-3xl sm:text-5xl font-normal text-stone-900 font-editorial tracking-tight leading-tight">
                  {wishlist.name}
                </h1>

                {/* Curator's Personal Note */}
                {wishlist.description && (
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-xs sm:text-sm text-stone-700 leading-relaxed font-light break-words flex items-start space-x-2.5">
                    <span className="text-base leading-none select-none">💬</span>
                    <div>
                      <p className="font-semibold text-stone-800 text-[11px] uppercase tracking-wide mb-0.5">
                        Note from @{wishlist.username}
                      </p>
                      <p className="italic">&ldquo;{wishlist.description}&rdquo;</p>
                    </div>
                  </div>
                )}

                {/* Progress Tracker */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs font-medium text-stone-600 mb-1.5">
                    <span>Registry Gifting Progress</span>
                    <span className="font-semibold text-stone-900">
                      {claimedCount} of {items.length} claimed ({progressPercent}%) • {verifiedCount} verified received
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200/60">
                    <div 
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* "How Gifting Works" Explainer Banner */}
          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-5 mb-10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-700" />
              <span>How Gifting on Kureva Works</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-600">
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                <span><strong>Select an item:</strong> Pick something they&apos;ll cherish from the curated collection below.</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                <span><strong>Buy at store:</strong> Click &ldquo;Buy on Jumia/Amazon&rdquo; to order directly to their doorstep.</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                <span><strong>Claim Gift:</strong> Click &ldquo;I bought this&rdquo; to record your gift so the owner can verify receipt!</span>
              </div>
            </div>
          </div>

          {/* Items Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-2 border-b border-stone-200">
            <h2 className="text-2xl font-normal text-stone-900 font-editorial tracking-tight flex items-center space-x-2">
              <Gift className="w-5 h-5 text-emerald-700" />
              <span>Items on the Registry ({items.length})</span>
            </h2>
            <span className="text-xs text-stone-500 font-light">
              Click &ldquo;I bought this&rdquo; or &ldquo;Reserve&rdquo; to claim an item
            </span>
          </div>

          {/* Item Cards Grid */}
          {items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200 p-8 shadow-xs">
              <Gift className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-lg font-normal text-stone-900 font-editorial mb-1">
                No wishes listed yet
              </h3>
              <p className="text-xs text-stone-500 font-light max-w-sm mx-auto">
                The creator hasn&apos;t added any items to this collection yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {items.map((item: any) => {
                const isClaimed = !!item.reservation_status;
                const isPurchased = item.reservation_status === "purchased" || item.reservation_status === "verified";
                const isVerified = !!item.is_verified;

                return (
                  <div
                    key={item.id}
                    className="border border-stone-200/90 rounded-3xl overflow-hidden flex flex-col justify-between bg-white group hover:border-emerald-600/60 hover:shadow-lg transition-all duration-300"
                  >
                    <div>
                      {/* Card Media Container */}
                      <div className="h-56 bg-stone-50 relative p-4 flex items-center justify-center border-b border-stone-100 overflow-hidden">
                        {item.image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-stone-400 space-y-1.5">
                            <ShoppingBag className="w-9 h-9 stroke-1 text-stone-300" />
                            <span className="text-[11px] font-light">Photo coming soon</span>
                          </div>
                        )}

                        {/* Priority Pill (Top-Left) */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className={`text-[10px] tracking-wide font-semibold px-2.5 py-0.5 rounded-full shadow-xs border ${
                            item.priority === "must_have" 
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : item.priority === "really_want"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-stone-50 text-stone-600 border-stone-200"
                          }`}>
                            {item.priority === "must_have" ? "🔥 Most Wanted" : item.priority === "really_want" ? "✨ Really Loved" : "Nice To Have"}
                          </span>
                        </div>

                        {/* Store Tag Pill (Top-Right) */}
                        {item.store && (
                          <div className="absolute top-3 right-3 z-10">
                            <span className="inline-flex items-center space-x-1 text-[10px] text-stone-700 font-semibold uppercase tracking-wider bg-white/95 px-2.5 py-1 rounded-full border border-stone-200/80 shadow-xs">
                              <Store className="w-2.5 h-2.5 text-stone-500" />
                              <span>{item.store}</span>
                            </span>
                          </div>
                        )}

                        {/* Reservation / Verification Frosted Glass Overlay */}
                        {isClaimed && (
                          <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-4 text-center">
                            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border shadow-xs mb-1.5 flex items-center space-x-1.5 ${
                              isVerified
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : isPurchased 
                                  ? "bg-amber-600 text-white border-amber-600"
                                  : "bg-blue-600 text-white border-blue-600"
                            }`}>
                              {isVerified ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>✓ Gift Received & Verified</span>
                                </>
                              ) : isPurchased ? (
                                <>
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Claimed • Pending Verification</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Reserved by a guest</span>
                                </>
                              )}
                            </span>
                            <p className="text-[11px] text-stone-600 font-light max-w-xs">
                              {isVerified 
                                ? "The creator has confirmed receiving this gift!"
                                : isPurchased 
                                  ? "A guest has claimed this gift. Locked to prevent duplicates." 
                                  : "Someone has temporarily held this item."}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-5">
                        <h3 className="font-semibold text-stone-900 text-base leading-snug line-clamp-2 break-words mb-2">
                          {item.name}
                        </h3>

                        {/* Formatted Price */}
                        <div className="flex items-baseline space-x-1.5">
                          {item.price !== null && item.price !== "" ? (
                            <span className="text-xl font-bold text-stone-900 tracking-tight">
                              {getCurrencySymbol(item.currency)}
                              {parseFloat(item.price).toLocaleString(undefined, { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </span>
                          ) : (
                            <span className="text-xs text-stone-500 font-light italic">
                              Price available at store
                            </span>
                          )}
                          <span className="text-[11px] text-stone-500 font-light">
                            • Quantity: {item.quantity || 1}
                          </span>
                        </div>

                        {/* Notes / Sizing / Guidelines */}
                        {item.notes && (
                          <div className="mt-3.5 p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs text-stone-600 leading-relaxed font-light break-words">
                            <span className="font-semibold text-stone-700 block text-[10px] uppercase tracking-wider mb-0.5">
                              Sizing / Note:
                            </span>
                            &ldquo;{item.notes}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-5 pt-0 space-y-2">
                      
                      {/* Direct Store Buy Link */}
                      {item.product_url && !isClaimed && (
                        <a
                          href={item.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-3 border border-stone-200 hover:border-emerald-600 text-stone-700 hover:text-emerald-700 bg-stone-50/50 hover:bg-emerald-50/30 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
                        >
                          <span>Buy at {item.store || "Store"}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Claiming Actions */}
                      {isClaimed ? (
                        <div className={`w-full text-center py-2.5 text-xs font-medium rounded-xl border select-none ${
                          isVerified
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-stone-100 text-stone-600 border-stone-200"
                        }`}>
                          {isVerified ? "Gift Received & Confirmed ✓" : "Claimed (Awaiting Verification)"}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(item, "reserve")}
                            className="flex-1 py-2.5 border border-stone-300 hover:border-stone-400 text-stone-800 bg-white hover:bg-stone-50 rounded-xl text-xs font-semibold transition-all shadow-xs"
                          >
                            Reserve
                          </button>
                          <button
                            onClick={() => handleOpenModal(item, "purchase")}
                            className="flex-1 py-2.5 bg-[#1b7a43] hover:bg-[#145d33] text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center justify-center space-x-1"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>I bought this</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reservation Guest Dialog Modal */}
          {selectedItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl border border-stone-200 max-w-sm w-full p-6 sm:p-7 relative shadow-2xl">
                {!successMsg && (
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-5 right-5 text-stone-400 hover:text-stone-800 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <div className="mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mb-2 border border-emerald-100">
                    {actionType === "purchase" ? "Claim as Purchased" : "Reserve Gift for 48 Hours"}
                  </span>
                  <h3 className="text-2xl font-normal text-stone-900 font-editorial">
                    {actionType === "purchase" ? "Claim this Gift" : "Reserve this Wish"}
                  </h3>
                </div>
                
                <p className="text-xs text-stone-600 mb-5 leading-relaxed font-light break-words">
                  You are selecting <strong className="text-stone-900 font-semibold">{selectedItem.name}</strong>. This informs the creator so they can verify receipt and prevents duplicate gifts.
                </p>

                {successMsg ? (
                  <div className="py-6 text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                      <Check className="w-7 h-7" />
                    </div>
                    <p className="text-base font-semibold text-stone-900">{successMsg}</p>
                    <p className="text-xs text-stone-500 font-light">
                      The creator can now verify your claim in their registry.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleAction} className="space-y-3.5">
                    {error && (
                      <div className="bg-red-50 text-red-600 text-xs p-2.5 rounded-xl border border-red-100 text-center font-medium">
                        {error}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kenji"
                        className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 bg-stone-50/50 focus:bg-white transition-all"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Your Email (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. kenji@example.com"
                        className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 bg-stone-50/50 focus:bg-white transition-all"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Personal Note / Message (Optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Add a sweet message, sizing note, or order reference..."
                        className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 bg-stone-50/50 focus:bg-white transition-all resize-none"
                        value={guestNote}
                        onChange={(e) => setGuestNote(e.target.value)}
                      />
                    </div>

                    <div className="bg-stone-50 p-3 rounded-2xl text-[11px] text-stone-600 font-light leading-relaxed border border-stone-200/70 flex items-start space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Surprise Protection:</strong> Your claim is locked to avoid duplicates. The wishlist creator verifies receipt upon arrival!
                      </span>
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(null)}
                        className="w-1/3 py-3 border border-stone-200 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-2/3 py-3 bg-[#1b7a43] hover:bg-[#145d33] text-white font-semibold rounded-xl text-xs shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <span>{actionType === "purchase" ? "Confirm Claim" : "Reserve Gift"}</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Story Card & Social Graphic Modal */}
          {wishlist && (
            <WishlistStoryCardModal
              wishlist={wishlist}
              shareUrl={shareUrl}
              isOpen={isStoryModalOpen}
              onClose={() => setIsStoryModalOpen(false)}
            />
          )}
        </main>
      </div>

      {/* Luxury Footer */}
      <footer className="border-t border-stone-200 bg-white py-12 text-center text-xs text-stone-500">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Link href="/" className="font-editorial text-2xl font-normal text-stone-900 tracking-tight">
              kureva
            </Link>
            <span className="text-stone-300">•</span>
            <span className="font-light">Modern Wishlist & Gift Registry</span>
          </div>

          <div className="flex items-center space-x-5 font-medium text-xs">
            <Link href="/" className="hover:text-stone-900 transition-colors">Home</Link>
            <Link href="/login" className="hover:text-stone-900 transition-colors">Sign In</Link>
            <Link href="/register" className="text-emerald-700 hover:underline font-semibold">Create a Wishlist</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
