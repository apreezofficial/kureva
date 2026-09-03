"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import Navbar from "@/components/navigation/Navbar";
import MobileNav from "@/components/navigation/MobileNav";
import { 
  Plus, 
  Share2, 
  Settings, 
  Trash2, 
  ExternalLink, 
  Check,
  Pencil,
  Gift,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  User,
  Mail,
  MessageSquare
} from "lucide-react";

export default function WishlistDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
  const resolvedParams = use(params);
  const uuid = resolvedParams.uuid;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [wishlist, setWishlist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchWishlist = async () => {
    try {
      const res = await apiRequest(`/api/wishlists/${uuid}`);
      if (res.success && res.data) {
        setWishlist(res.data);
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

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Remove this item from your collection?")) return;
    try {
      await apiRequest(`/api/wishlists/${uuid}/items/${itemId}`, { method: "DELETE" });
      fetchWishlist();
    } catch (err) {
      alert("Failed to delete item.");
    }
  };

  const handleVerifyClaim = async (itemId: number) => {
    setActionLoadingId(itemId);
    try {
      const res = await apiRequest(`/api/items/${itemId}/verify-claim`, { method: "POST" });
      if (res.success) {
        fetchWishlist();
      }
    } catch (err: any) {
      alert(err.message || "Failed to verify gift claim.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReleaseClaim = async (itemId: number) => {
    if (!confirm("Decline this claim and reopen the item for other guests?")) return;
    setActionLoadingId(itemId);
    try {
      const res = await apiRequest(`/api/items/${itemId}/release-claim`, { method: "POST" });
      if (res.success) {
        fetchWishlist();
      }
    } catch (err: any) {
      alert(err.message || "Failed to release gift claim.");
    } finally {
      setActionLoadingId(null);
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

  const items = wishlist.items || [];
  const claimedItems = items.filter((it: any) => !!it.reservation_status);
  const pendingClaims = claimedItems.filter((it: any) => !it.is_verified);

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
                <span className="capitalize">{wishlist.visibility} (Shared)</span>
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
              <Link
                href={`/dashboard/wishlists/${uuid}/share`}
                className="flex items-center space-x-1.5 px-3.5 py-2 border border-border rounded-lg text-sm text-secondary hover:text-primary hover:bg-white transition-all duration-200 bg-white/60 shadow-sm"
              >
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium">Share</span>
              </Link>
              
              {/* Settings Page Link */}
              <Link
                href={`/dashboard/wishlists/${uuid}/edit`}
                className="flex items-center space-x-1.5 px-3.5 py-2 border border-border rounded-lg text-sm text-secondary hover:text-primary hover:bg-white transition-all duration-200 bg-white/60 shadow-sm"
              >
                <Settings className="w-4 h-4" />
                <span className="text-xs font-medium">Settings</span>
              </Link>
              
              {/* Add Wish Page Link */}
              <Link
                href={`/dashboard/wishes/new?wishlist=${wishlist.uuid}`}
                className="flex items-center space-x-1.5 px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent-dark transition-all duration-200 font-medium shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Wish</span>
              </Link>
            </div>
          </div>

          {/* Gift Claims & Verification Review Panel */}
          {claimedItems.length > 0 && (
            <div className="mb-10 bg-white border border-stone-200 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900">Gift Claims & Verification</h2>
                    <p className="text-xs text-stone-500 font-light">
                      Review gift claims from guests. Verify gifts you have received or release false claims.
                    </p>
                  </div>
                </div>
                {pendingClaims.length > 0 && (
                  <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
                    {pendingClaims.length} pending verification
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {claimedItems.map((item: any) => {
                  const isVerified = !!item.is_verified;
                  const isBusy = actionLoadingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-stone-200/80 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start space-x-3.5">
                        <div className="w-12 h-12 rounded-xl bg-white border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                          {item.image_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={item.image_url} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <Gift className="w-5 h-5 text-stone-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-stone-900 line-clamp-1">{item.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-stone-600">
                            <span className="flex items-center space-x-1 font-medium text-stone-800">
                              <User className="w-3 h-3 text-stone-400" />
                              <span>{item.reserved_by_name || "Guest"}</span>
                            </span>
                            {item.reserved_by_email && (
                              <span className="flex items-center space-x-1 text-stone-500">
                                <Mail className="w-3 h-3 text-stone-400" />
                                <span>{item.reserved_by_email}</span>
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.reservation_status === "purchased"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {item.reservation_status === "purchased" ? "Claimed as Bought" : "Reserved"}
                            </span>
                          </div>

                          {item.reservation_note && (
                            <p className="text-xs text-stone-600 italic mt-1.5 font-light">
                              &ldquo;{item.reservation_note}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Owner Verification Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {isVerified ? (
                          <div className="flex items-center space-x-2">
                            <span className="flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verified & Received</span>
                            </span>
                            <button
                              onClick={() => handleReleaseClaim(item.id)}
                              disabled={isBusy}
                              className="text-[11px] text-stone-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                              Release
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleVerifyClaim(item.id)}
                              disabled={isBusy}
                              className="px-3.5 py-1.5 bg-[#1b7a43] hover:bg-[#145d33] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Verify & Confirm</span>
                            </button>
                            <button
                              onClick={() => handleReleaseClaim(item.id)}
                              disabled={isBusy}
                              className="px-3 py-1.5 border border-stone-300 hover:border-red-400 hover:text-red-600 text-stone-600 rounded-xl text-xs font-semibold transition-all bg-white disabled:opacity-50"
                            >
                              Decline / Reopen
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
              {wishlist.items.map((item: any) => {
                const isClaimed = !!item.reservation_status;
                const isVerified = !!item.is_verified;

                return (
                  <div
                    key={item.id}
                    className="border border-border rounded-2xl overflow-hidden flex flex-col justify-between bg-white group hover:border-accent hover:shadow-md transition-all duration-200"
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

                      {/* Claim / Verification Badge */}
                      {isClaimed && (
                        <div className="absolute top-3 right-3">
                          <span className={`text-[10px] tracking-wide font-semibold px-2.5 py-0.5 rounded-full shadow-sm border ${
                            isVerified
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {isVerified ? "✓ Verified Received" : "⏳ Pending Verification"}
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
                          <span className="text-base font-bold text-accent">
                            {item.currency === "NGN" ? "₦" : item.currency === "USD" ? "$" : item.currency === "EUR" ? "€" : item.currency === "GBP" ? "£" : `${item.currency} `}
                            {parseFloat(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-xs text-secondary/70 font-light italic">Price not specified</span>
                        )}
                      </div>

                      {item.store && (
                        <span className="inline-block mt-2 text-[10px] text-secondary font-medium uppercase tracking-wider bg-soft px-2 py-0.5 rounded border border-border/50">
                          {item.store}
                        </span>
                      )}

                      {/* Gifter claim notice on card */}
                      {isClaimed && (
                        <div className="mt-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-[11px] text-stone-600 space-y-1">
                          <p className="font-semibold text-stone-800">
                            Claimed by {item.reserved_by_name || "a guest"}
                          </p>
                          {!isVerified ? (
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handleVerifyClaim(item.id)}
                                className="text-[10px] font-bold text-emerald-700 hover:underline"
                              >
                                ✓ Confirm Received
                              </button>
                              <button
                                onClick={() => handleReleaseClaim(item.id)}
                                className="text-[10px] font-bold text-red-600 hover:underline"
                              >
                                Decline
                              </button>
                            </div>
                          ) : (
                            <p className="text-[10px] text-emerald-700 font-medium">Confirmed ✓</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Actions: Edit Page Link & Delete */}
                    <div className="px-5 pb-3.5 pt-2.5 flex items-center justify-between border-t border-border/40 bg-soft/40">
                      <span className="text-[11px] text-secondary font-light">Qty: {item.quantity}</span>
                      <div className="flex items-center space-x-1">
                        <Link
                          href={`/dashboard/wishlists/${uuid}/items/${item.id}/edit`}
                          className="text-secondary hover:text-primary transition-colors p-1.5 rounded hover:bg-white"
                          title="Edit Wish"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
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
                );
              })}
            </div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
