"use client";

import { useState } from "react";
import Link from "next/link";
import MarketingHeader from "@/components/navigation/MarketingHeader";
import MarketingFooter from "@/components/navigation/MarketingFooter";
import WishlistStoryCardModal from "@/components/wishlist/WishlistStoryCardModal";
import ProductMotionFlow from "@/components/home/ProductMotionFlow";
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Gift, 
  Share2, 
  ExternalLink, 
  Check, 
  Heart, 
  Plus, 
  QrCode, 
  ShieldCheck, 
  Lock, 
  Globe, 
  Calendar, 
  User, 
  X,
  PackageCheck,
  Eye,
  RefreshCw,
  ShoppingBag,
  Info
} from "lucide-react";

interface DemoWishItem {
  id: number;
  title: string;
  price: string;
  currency: string;
  store: string;
  url: string;
  image: string;
  priority: "most_wanted" | "really_loved" | "nice_to_have";
  priorityLabel: string;
  status: "available" | "reserved" | "purchased";
  isVerified?: boolean;
  gifterName?: string;
  gifterNote?: string;
}

export default function DemoPage() {
  const [viewMode, setViewMode] = useState<"guest" | "creator">("guest");
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial demo wishlist items
  const [items, setItems] = useState<DemoWishItem[]>([
    {
      id: 1,
      title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
      price: "450,000",
      currency: "₦",
      store: "Amazon",
      url: "https://amazon.com",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
      priority: "most_wanted",
      priorityLabel: "🔥 Most Wanted",
      status: "purchased",
      isVerified: true,
      gifterName: "Sophia M.",
      gifterNote: "Happy 25th birthday Maya! Hope you enjoy your tunes on your next flight! ✈️🎧"
    },
    {
      id: 2,
      title: "Le Labo Santal 33 Eau de Parfum (50ml)",
      price: "195,000",
      currency: "₦",
      store: "Sephora",
      url: "https://sephora.com",
      image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&auto=format&fit=crop&q=80",
      priority: "really_loved",
      priorityLabel: "Really Loved",
      status: "purchased",
      isVerified: false,
      gifterName: "Daniel K.",
      gifterNote: "Ordered from Sephora online! Should arrive by Wednesday."
    },
    {
      id: 3,
      title: "Fujifilm Instax Mini Evo Hybrid Camera",
      price: "175,000",
      currency: "₦",
      store: "Jumia",
      url: "https://jumia.com.ng",
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80",
      priority: "nice_to_have",
      priorityLabel: "Nice To Have",
      status: "available",
    },
    {
      id: 4,
      title: "Dyson Airwrap Multi-Styler Complete Long",
      price: "650,000",
      currency: "₦",
      store: "Apple / Dyson",
      url: "https://dyson.com",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80",
      priority: "most_wanted",
      priorityLabel: "🔥 Most Wanted",
      status: "available",
    },
    {
      id: 5,
      title: "Aesop Resurrection Aromatique Hand Balm (75ml)",
      price: "38,000",
      currency: "₦",
      store: "Cult Beauty",
      url: "https://cultbeauty.com",
      image: "https://images.unsplash.com/photo-1608248597359-00f074a362f7?w=500&auto=format&fit=crop&q=80",
      priority: "nice_to_have",
      priorityLabel: "Nice To Have",
      status: "available",
    }
  ]);

  // Claim modal state
  const [selectedClaimItem, setSelectedClaimItem] = useState<DemoWishItem | null>(null);
  const [claimType, setClaimType] = useState<"reserve" | "purchase">("purchase");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestNote, setGuestNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate stats
  const claimedCount = items.filter(i => i.status !== "available").length;
  const totalCount = items.length;
  const progressPercent = Math.round((claimedCount / totalCount) * 100);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCopyShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      showToast("Link copied to clipboard! Anyone with this link can view this registry.");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaimItem) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setItems(prev => prev.map(item => {
        if (item.id === selectedClaimItem.id) {
          return {
            ...item,
            status: claimType === "purchase" ? "purchased" : "reserved",
            isVerified: false,
            gifterName: guestName.trim() || "Kind Guest",
            gifterNote: guestNote.trim() || "Enjoy your gift!"
          };
        }
        return item;
      }));

      setIsSubmitting(false);
      setSelectedClaimItem(null);
      setGuestName("");
      setGuestEmail("");
      setGuestNote("");
      showToast(`🎉 You successfully claimed "${selectedClaimItem.title}"!`);
    }, 600);
  };

  const handleVerifyItem = (itemId: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, isVerified: true };
      }
      return item;
    }));
    showToast("✓ Gift receipt confirmed & verified by creator!");
  };

  const handleReopenItem = (itemId: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { 
          ...item, 
          status: "available", 
          isVerified: false, 
          gifterName: undefined, 
          gifterNote: undefined 
        };
      }
      return item;
    }));
    showToast("Gift reopened and marked as available again.");
  };

  const handleResetDemo = () => {
    setItems([
      {
        id: 1,
        title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
        price: "450,000",
        currency: "₦",
        store: "Amazon",
        url: "https://amazon.com",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
        priority: "most_wanted",
        priorityLabel: "🔥 Most Wanted",
        status: "purchased",
        isVerified: true,
        gifterName: "Sophia M.",
        gifterNote: "Happy 25th birthday Maya! Hope you enjoy your tunes on your next flight! ✈️🎧"
      },
      {
        id: 2,
        title: "Le Labo Santal 33 Eau de Parfum (50ml)",
        price: "195,000",
        currency: "₦",
        store: "Sephora",
        url: "https://sephora.com",
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&auto=format&fit=crop&q=80",
        priority: "really_loved",
        priorityLabel: "Really Loved",
        status: "purchased",
        isVerified: false,
        gifterName: "Daniel K.",
        gifterNote: "Ordered from Sephora online! Should arrive by Wednesday."
      },
      {
        id: 3,
        title: "Fujifilm Instax Mini Evo Hybrid Camera",
        price: "175,000",
        currency: "₦",
        store: "Jumia",
        url: "https://jumia.com.ng",
        image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80",
        priority: "nice_to_have",
        priorityLabel: "Nice To Have",
        status: "available",
      },
      {
        id: 4,
        title: "Dyson Airwrap Multi-Styler Complete Long",
        price: "650,000",
        currency: "₦",
        store: "Apple / Dyson",
        url: "https://dyson.com",
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80",
        priority: "most_wanted",
        priorityLabel: "🔥 Most Wanted",
        status: "available",
      },
      {
        id: 5,
        title: "Aesop Resurrection Aromatique Hand Balm (75ml)",
        price: "38,000",
        currency: "₦",
        store: "Cult Beauty",
        url: "https://cultbeauty.com",
        image: "https://images.unsplash.com/photo-1608248597359-00f074a362f7?w=500&auto=format&fit=crop&q=80",
        priority: "nice_to_have",
        priorityLabel: "Nice To Have",
        status: "available",
      }
    ]);
    showToast("Demo reset to default state.");
  };

  // Demo Wishlist Object for Story Card Modal
  const demoWishlistObject = {
    title: "Maya's 25th Birthday Wishlist",
    description: "Celebrating 25 years with things I truly cherish ✨",
    username: "maya",
    items: items.map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      currency: item.currency,
      store: item.store,
      image: item.image,
      priority: item.priority
    }))
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col justify-between text-stone-800 selection:bg-emerald-100">
      <MarketingHeader />

      {/* Top Demo Interactive Controller Banner */}
      <div className="bg-[#022c22] text-white px-4 sm:px-6 py-3.5 border-b border-emerald-900 sticky top-16 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-medium text-emerald-100">
              <strong className="text-white font-semibold">Live Interactive Demo:</strong> Maya&apos;s 25th Birthday Wishlist
            </span>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-2">
            {/* View Mode Switcher */}
            <div className="inline-flex bg-emerald-950/80 p-1 rounded-xl border border-emerald-800/80 text-xs">
              <button
                onClick={() => setViewMode("guest")}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  viewMode === "guest" 
                    ? "bg-white text-emerald-950 shadow-xs font-semibold" 
                    : "text-emerald-300 hover:text-white"
                }`}
              >
                Guest View (Claim Gifts)
              </button>
              <button
                onClick={() => setViewMode("creator")}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  viewMode === "creator" 
                    ? "bg-white text-emerald-950 shadow-xs font-semibold" 
                    : "text-emerald-300 hover:text-white"
                }`}
              >
                Creator View (Review Claims)
              </button>
            </div>

            <button
              onClick={handleResetDemo}
              title="Reset Demo"
              className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 hover:text-white border border-emerald-700/50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <Link
              href="/register"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs transition-colors shadow-xs"
            >
              Create Free Wishlist →
            </Link>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-stone-900 text-white text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-2xl border border-stone-700 flex items-center space-x-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Registry Showcase Container */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-16 flex-1">
        {/* Section 1: Animated Interactive Lifecycle Walkthrough */}
        <section className="space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#1b7a43]" />
              <span>Interactive Lifecycle Walkthrough</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-normal text-stone-900 font-editorial">
              How Kureva works, from setup to verified receipt.
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-light max-w-xl">
              Click through the 5 steps below to see how easy it is to claim vanity handles, import products from any store, export 9:16 QR story cards, and verify gift claims.
            </p>
          </div>

          <ProductMotionFlow />
        </section>

        {/* Section 2: Live Wishlist Registry Sandbox */}
        <section className="space-y-6 pt-6 border-t border-stone-200/80">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-800 text-xs font-semibold tracking-wide uppercase">
              <Gift className="w-3.5 h-3.5 text-[#1b7a43]" />
              <span>Live Registry Sandbox</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-normal text-stone-900 font-editorial">
              Maya&apos;s 25th Birthday Registry Sandbox
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-light max-w-xl">
              Simulate claiming gifts as a guest with a personal note, or switch to Creator View at the top to review and confirm receipts.
            </p>
          </div>

          {/* Wishlist Header Card */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-md overflow-hidden">
          {/* Cover Banner */}
          <div className="h-44 sm:h-56 bg-gradient-to-r from-emerald-900 via-[#1b7a43] to-teal-800 relative p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-white/90 text-xs font-medium border border-white/20">
                <Globe className="w-3 h-3" />
                <span>Public Registry</span>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsStoryModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/95 hover:bg-white text-stone-900 font-semibold text-xs shadow-xs transition-all flex items-center space-x-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#1b7a43]" />
                  <span>Story Card Studio</span>
                </button>
                <button
                  onClick={handleCopyShare}
                  className="px-3.5 py-1.5 rounded-xl bg-black/30 hover:bg-black/40 backdrop-blur-md text-white font-medium text-xs border border-white/20 transition-all flex items-center space-x-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Copied!" : "Share"}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-white/80 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>Celebration Date: October 14, 2026</span>
            </div>
          </div>

          {/* Profile & Info Bar */}
          <div className="p-6 sm:p-8 relative">
            {/* Avatar */}
            <div className="-mt-16 sm:-mt-20 mb-4 inline-block relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1 shadow-lg border border-stone-200/80">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                  alt="Maya"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            </div>

            {/* Title & Bio */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-normal font-editorial text-stone-900">
                    Maya&apos;s 25th Birthday Wishlist
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-500 font-mono">
                    curated by @maya
                  </p>
                </div>

                {/* Progress Pill */}
                <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 sm:text-right min-w-[180px]">
                  <div className="flex justify-between items-center sm:justify-end gap-2 text-xs font-semibold text-stone-700 mb-1.5">
                    <span>Gifts Claimed:</span>
                    <span className="text-emerald-700 font-bold">{claimedCount} of {totalCount} ({progressPercent}%)</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#1b7a43] h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <p className="text-stone-600 text-sm sm:text-base font-light pt-2 max-w-2xl leading-relaxed">
                Celebrating a quarter-century! If you&apos;d like to get me something, here are a few items I&apos;d truly appreciate. Claimed items are updated in real-time so no one buys duplicates. Thank you so much! ❤️
              </p>
            </div>
          </div>
        </div>

        {/* Mode Explainer Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start space-x-3 text-xs sm:text-sm text-emerald-950">
          <Info className="w-4 h-4 text-[#1b7a43] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-emerald-900">
              {viewMode === "guest" ? "Guest Mode Active" : "Creator Mode Active"}
            </p>
            <p className="text-emerald-800/90 leading-relaxed">
              {viewMode === "guest" 
                ? "You are seeing what your friends & followers see. Click 'Claim This Gift' on any available wish to simulate sending a surprise note and claiming the item."
                : "You are seeing Maya's creator perspective. Here you can review gifter names, read private celebration notes, and click 'Verify Receipt' to prevent troll claims."}
            </p>
          </div>
        </div>

        {/* Wishlist Items List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-semibold text-stone-900 font-editorial">
              Wishes in this Registry ({items.length})
            </h2>
            <span className="text-xs text-stone-500 font-mono">
              Live Sync Enabled
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {items.map((item) => {
              const isClaimed = item.status !== "available";

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all duration-300 p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between ${
                    isClaimed 
                      ? "border-stone-200/60 bg-stone-50/50" 
                      : "border-stone-200/90 shadow-xs hover:border-emerald-700/40 hover:shadow-md"
                  }`}
                >
                  {/* Left: Product Image & Details */}
                  <div className="flex items-start sm:items-center space-x-4 w-full sm:w-auto">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/80 relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {isClaimed && (
                        <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[1px] flex items-center justify-center text-white">
                          <Check className="w-6 h-6 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Priority Tag & Store */}
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                          {item.store}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/70">
                          {item.priorityLabel}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className={`text-sm sm:text-base font-medium leading-snug line-clamp-2 ${
                        isClaimed ? "text-stone-500 line-through" : "text-stone-900"
                      }`}>
                        {item.title}
                      </h3>

                      {/* Price */}
                      <div className="text-sm sm:text-base font-semibold text-stone-900 font-mono">
                        {item.currency} {item.price}
                      </div>

                      {/* Gifter & Verified Status Info */}
                      {isClaimed && (
                        <div className="pt-1 flex flex-col gap-1 text-xs">
                          <div className="flex items-center space-x-1.5 font-medium">
                            {item.isVerified ? (
                              <span className="inline-flex items-center space-x-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#1b7a43]" />
                                <span>Verified by {item.gifterName}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                <PackageCheck className="w-3.5 h-3.5 text-amber-700" />
                                <span>Claimed by {item.gifterName} (Pending Creator Review)</span>
                              </span>
                            )}
                          </div>

                          {/* Private Note (Visible in Creator Mode) */}
                          {viewMode === "creator" && item.gifterNote && (
                            <div className="mt-1 p-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 italic text-xs">
                              &ldquo;{item.gifterNote}&rdquo;
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="w-full sm:w-auto flex flex-col sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                    {item.status === "available" ? (
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl border border-stone-200 hover:border-stone-300 text-stone-600 hover:text-stone-900 transition-colors"
                          title="Open Store Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setSelectedClaimItem(item)}
                          className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#1b7a43] hover:bg-[#145d33] text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5 active:scale-98"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>Claim This Gift</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                        <div className="px-3.5 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-500 text-xs font-semibold flex items-center justify-center space-x-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Claimed</span>
                        </div>

                        {/* Creator View Controls */}
                        {viewMode === "creator" && (
                          <div className="flex items-center space-x-2">
                            {!item.isVerified && (
                              <button
                                onClick={() => handleVerifyItem(item.id)}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                              >
                                Confirm Receipt
                              </button>
                            )}
                            <button
                              onClick={() => handleReopenItem(item.id)}
                              className="px-3 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-medium transition-colors"
                            >
                              Reopen Wish
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </section>

        {/* Bottom CTA Card */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-medium border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for your own celebration?</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-normal font-editorial text-white">
            Create your dream wishlist in under 60 seconds.
          </h3>
          <p className="text-stone-300 text-sm sm:text-base font-light max-w-xl mx-auto leading-relaxed">
            Paste links from Jumia, Amazon, Zara or any store. Generate high-res story cards with QR codes and never receive duplicate gifts.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#1b7a43] hover:bg-[#145d33] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center space-x-2 active:scale-98"
            >
              <span>Create Free Wishlist</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-all border border-white/15"
            >
              Learn How It Works
            </Link>
          </div>
        </div>
      </main>

      {/* Interactive Claim Modal */}
      {selectedClaimItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Simulate Gifting
                </span>
                <h3 className="text-xl sm:text-2xl font-normal font-editorial text-stone-900 mt-1">
                  Claim this Gift
                </h3>
              </div>
              <button
                onClick={() => setSelectedClaimItem(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Item summary */}
            <div className="flex items-center space-x-3.5 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <img
                src={selectedClaimItem.image}
                alt={selectedClaimItem.title}
                className="w-14 h-14 rounded-xl object-cover border border-stone-200"
              />
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-semibold text-stone-900 line-clamp-1">
                  {selectedClaimItem.title}
                </p>
                <p className="text-xs font-mono text-stone-600 font-semibold">
                  {selectedClaimItem.currency} {selectedClaimItem.price} • {selectedClaimItem.store}
                </p>
              </div>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              {/* Claim Action Type */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setClaimType("purchase")}
                  className={`p-3 rounded-xl border text-left font-medium transition-all ${
                    claimType === "purchase"
                      ? "border-[#1b7a43] bg-emerald-50/60 text-emerald-950 font-semibold ring-1 ring-[#1b7a43]"
                      : "border-stone-200 hover:border-stone-300 text-stone-700"
                  }`}
                >
                  <div className="font-semibold text-stone-900">I Bought This</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">I have placed the order</div>
                </button>

                <button
                  type="button"
                  onClick={() => setClaimType("reserve")}
                  className={`p-3 rounded-xl border text-left font-medium transition-all ${
                    claimType === "reserve"
                      ? "border-[#1b7a43] bg-emerald-50/60 text-emerald-950 font-semibold ring-1 ring-[#1b7a43]"
                      : "border-stone-200 hover:border-stone-300 text-stone-700"
                  }`}
                >
                  <div className="font-semibold text-stone-900">Reserving for Later</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">Holding it for 48 hours</div>
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Your Name / Nickname
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex M."
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Your Email (Optional, for updates)
                </label>
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Personal Surprise Note for Maya
                </label>
                <textarea
                  rows={2}
                  placeholder="Happy 25th birthday Maya! Enjoy capturing memories!"
                  value={guestNote}
                  onChange={(e) => setGuestNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedClaimItem(null)}
                  className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#1b7a43] hover:bg-[#145d33] text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Confirm Demo Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Story Card Studio Modal */}
      {isStoryModalOpen && (
        <WishlistStoryCardModal
          wishlist={demoWishlistObject}
          shareUrl="https://kureva.pxxl.pro/demo"
          isOpen={isStoryModalOpen}
          onClose={() => setIsStoryModalOpen(false)}
        />
      )}

      <MarketingFooter />
    </div>
  );
}
