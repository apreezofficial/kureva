"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { ExternalLink, Gift, Heart, HelpCircle, Check, ArrowLeft } from "lucide-react";

export default function PublicWishlistPage({ params }: { params: Promise<{ uuid: string }> }) {
  const resolvedParams = use(params);
  const uuid = resolvedParams.uuid;
  
  const [wishlist, setWishlist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        setSuccessMsg(res.message || "Done!");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex flex-col justify-between">
        <div>
          <div className="h-48 md:h-64 bg-gray-100 animate-pulse w-full"></div>
          <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
            <div className="h-10 w-2/3 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-24 w-full bg-white border border-border/60 rounded-xl animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="h-64 bg-white border border-border/60 rounded-xl animate-pulse"></div>
              <div className="h-64 bg-white border border-border/60 rounded-xl animate-pulse"></div>
              <div className="h-64 bg-white border border-border/60 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !wishlist) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-soft px-6 text-center">
        <h2 className="text-2xl font-normal text-primary font-editorial mb-2">Unavailable</h2>
        <p className="text-sm text-secondary max-w-sm mb-6 font-light">{error}</p>
        <Link href="/" className="text-xs px-4 py-2 bg-accent text-white rounded font-medium hover:bg-accent-dark">
          Back to Kureva
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16 flex flex-col justify-between">
      <div>
        {/* Cover Image */}
        {wishlist.cover_image && (
          <div className="w-full h-40 md:h-56 bg-gray-100 overflow-hidden relative border-b border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={wishlist.cover_image} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <main className="mx-auto max-w-4xl px-6 py-10">
          {/* Header */}
          <div className="border-b border-border pb-6 mb-8 flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <span className="text-[10px] tracking-widest font-semibold text-accent uppercase bg-accent/5 px-2 py-0.5 rounded-full inline-block mb-3">
                Wishlist Registry
              </span>
              <h1 className="text-3xl font-normal text-primary font-editorial tracking-tight leading-tight">
                {wishlist.name}
              </h1>
              <p className="text-sm text-secondary mt-1 max-w-xl font-light">
                Created by{" "}
                <Link href={`/profile/${wishlist.username}`} className="text-accent font-medium hover:underline">
                  @{wishlist.username}
                </Link>
              </p>
              {wishlist.description && (
                <p className="text-sm text-secondary mt-3 italic font-light max-w-2xl bg-soft/50 p-4 rounded border border-border/50">
                  &ldquo;{wishlist.description}&rdquo;
                </p>
              )}
            </div>
            
            <Link
              href="/"
              className="flex items-center space-x-1 text-xs text-secondary hover:text-primary transition-colors border border-border px-3 py-1.5 rounded-md hover:bg-soft"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>kureva home</span>
            </Link>
          </div>

          {/* List Items */}
          {wishlist.items.length === 0 ? (
            <div className="text-center py-16 bg-soft rounded-lg">
              <Gift className="w-8 h-8 text-secondary/30 mx-auto mb-3" />
              <p className="text-xs text-secondary font-light">Nothing has been added to this wishlist yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {wishlist.items.map((item: any) => {
                const isReserved = !!item.reservation_status;
                const isPurchased = item.reservation_status === "purchased";

                return (
                  <div
                    key={item.id}
                    className="border border-border rounded-lg overflow-hidden flex flex-col justify-between bg-white group hover:border-accent hover:shadow-sm transition-all duration-200"
                  >
                    <div>
                      {item.image_url ? (
                        <div className="h-44 bg-gray-50 overflow-hidden border-b border-border/40 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {isReserved && (
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                              <span className={`text-xs font-semibold px-3 py-1.5 rounded border shadow-sm ${
                                isPurchased 
                                  ? "bg-accent text-white border-accent"
                                  : "bg-blue-600 text-white border-blue-600"
                              }`}>
                                {isPurchased ? "Purchased ✓" : "Reserved"}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-44 bg-soft flex items-center justify-center border-b border-border/40 text-secondary/30 relative">
                          <span>No Image</span>
                          {isReserved && (
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                              <span className={`text-xs font-semibold px-3 py-1.5 rounded border shadow-sm ${
                                isPurchased 
                                  ? "bg-accent text-white border-accent"
                                  : "bg-blue-600 text-white border-blue-600"
                              }`}>
                                {isPurchased ? "Purchased ✓" : "Reserved"}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[9px] tracking-wide font-semibold px-2 py-0.5 rounded border uppercase ${
                            item.priority === "must_have" 
                              ? "bg-red-50 text-red-600 border-red-100"
                              : item.priority === "really_want"
                                ? "bg-amber-50 text-amber-600 border-amber-100"
                                : "bg-gray-50 text-gray-600 border-gray-100"
                          }`}>
                            {item.priority === "must_have" ? "Must Have" : item.priority === "really_want" ? "Really Want" : "Nice To Have"}
                          </span>
                          <span className="text-[10px] text-secondary font-light">Qty: {item.quantity}</span>
                        </div>

                        <h3 className="font-medium text-primary text-base leading-snug line-clamp-2 mb-1.5">
                          {item.name}
                        </h3>

                        <div className="flex items-baseline space-x-1.5 text-primary mb-2">
                          {item.price !== null ? (
                            <>
                              <span className="text-base font-semibold">{parseFloat(item.price).toFixed(2)}</span>
                              <span className="text-[10px] text-secondary font-medium uppercase">{item.currency}</span>
                            </>
                          ) : (
                            <span className="text-xs text-secondary font-light">Price on site</span>
                          )}
                        </div>

                        {item.store && (
                          <span className="inline-block text-[10px] text-secondary font-medium uppercase tracking-wider bg-soft px-2 py-0.5 rounded mb-3 border border-border/40">
                            {item.store}
                          </span>
                        )}

                        {item.notes && (
                          <p className="text-xs text-secondary italic font-light leading-relaxed border-t border-border/30 pt-2">
                            &ldquo;{item.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-border/30 bg-soft/20 flex gap-2">
                      {isReserved ? (
                        <div className="w-full text-center py-2 text-xs text-secondary font-medium bg-soft rounded border border-border/40 select-none">
                          {isPurchased ? "Already purchased" : "Already reserved"}
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleOpenModal(item, "reserve")}
                            className="flex-grow py-2 border border-border rounded text-xs text-secondary hover:text-primary hover:bg-soft transition-colors font-medium"
                          >
                            Reserve
                          </button>
                          <button
                            onClick={() => handleOpenModal(item, "purchase")}
                            className="flex-grow py-2 bg-accent text-white rounded text-xs hover:bg-accent-dark transition-colors font-medium"
                          >
                            I bought this
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reservation Guest Modal */}
          {selectedItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm">
              <div className="bg-white rounded-lg border border-border max-w-sm w-full p-6 relative">
                {!successMsg && (
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-4 right-4 text-secondary hover:text-primary"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                <h3 className="text-lg font-normal text-primary font-editorial mb-3">
                  {actionType === "purchase" ? "Mark as Purchased" : "Reserve this Wish"}
                </h3>
                
                <p className="text-xs text-secondary mb-4 leading-relaxed font-light">
                  You are selecting <strong>{selectedItem.name}</strong>. We will hide this from other guests so they don&apos;t buy duplicates.
                </p>

                {successMsg ? (
                  <div className="py-8 text-center space-y-3">
                    <Check className="w-8 h-8 text-accent mx-auto" />
                    <p className="text-sm font-medium text-primary">{successMsg}</p>
                  </div>
                ) : (
                  <form onSubmit={handleAction} className="space-y-4">
                    {error && (
                      <div className="bg-red-50 text-red-600 text-xs p-2 rounded mb-2 border border-red-100 text-center">
                        {error}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-[10px] font-semibold text-secondary uppercase tracking-wider mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kenji"
                        className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-secondary uppercase tracking-wider mb-1">
                        Your Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. kenji@example.com"
                        className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-accent"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                      />
                    </div>

                    <div className="bg-soft p-3 rounded text-[11px] text-secondary font-light leading-relaxed border border-border/50">
                      <strong>Surprise Privacy:</strong> The wishlist owner won&apos;t see who reserved this item until they open their gifts!
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2.5 bg-accent text-white font-medium rounded hover:bg-accent-dark transition-colors text-sm disabled:opacity-50"
                    >
                      {submitting ? "Processing..." : actionType === "purchase" ? "Confirm Purchase" : "Reserve Gift"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="py-8 text-center text-xs text-secondary font-light">
        <Link href="/" className="font-editorial text-primary tracking-widest lowercase mr-1">kureva</Link>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
