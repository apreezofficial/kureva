"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import Navbar from "@/components/navigation/Navbar";
import MobileNav from "@/components/navigation/MobileNav";
import { 
  ArrowLeft, 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  Download, 
  ExternalLink,
  Sparkles,
  ImageIcon
} from "lucide-react";

export default function ShareWishlistPage({ 
  params 
}: { 
  params: Promise<{ uuid: string }> 
}) {
  const resolvedParams = use(params);
  const uuid = resolvedParams.uuid;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [wishlist, setWishlist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/w/${uuid}` : "";

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchWishlist = async () => {
      try {
        const res = await apiRequest(`/api/wishlists/${uuid}`);
        if (res.success && res.data) {
          setWishlist(res.data);
        } else {
          router.push("/dashboard/wishlists");
        }
      } catch (e) {
        console.error(e);
        router.push("/dashboard/wishlists");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user, authLoading, router, uuid]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    showToast("Wishlist link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const shareText = wishlist ? `Check out my "${wishlist.name}" wishlist on Kureva: ${shareUrl}` : shareUrl;

  const socialChannels = [
    {
      name: "Twitter",
      bgColor: "bg-[#e8f5fd]",
      textColor: "text-[#1da1f2]",
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my "${wishlist?.name || "wishlist"}" on Kureva!`)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      },
      icon: (
        <svg className="w-6 h-6 fill-[#1da1f2]" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"/>
        </svg>
      )
    },
    {
      name: "Facebook",
      bgColor: "bg-[#e7f0fe]",
      textColor: "text-[#1877f2]",
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      },
      icon: (
        <svg className="w-6 h-6 fill-[#1877f2]" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: "WhatsApp",
      bgColor: "bg-[#e8f8f0]",
      textColor: "text-[#25d366]",
      action: () => {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      },
      icon: (
        <svg className="w-6 h-6 fill-[#25d366]" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      )
    },
    {
      name: "Instagram",
      bgColor: "bg-[#fbeaf0]",
      textColor: "text-[#e4405f]",
      action: () => {
        handleCopyLink();
        showToast("Link copied! Paste into your Instagram bio or Story.");
      },
      icon: (
        <svg className="w-6 h-6 fill-[#e4405f]" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      name: "Messenger",
      bgColor: "bg-[#e5f2fe]",
      textColor: "text-[#0084ff]",
      action: () => {
        const url = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(shareUrl)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      },
      icon: (
        <svg className="w-6 h-6 fill-[#0084ff]" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.082.3 2.235.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.964 3.26 6.559-6.963 3.13 3.26 5.889-3.26-6.559 6.963z"/>
        </svg>
      )
    },
    {
      name: "Snapchat",
      bgColor: "bg-[#fef9d9]",
      textColor: "text-[#fffc00]",
      action: () => {
        const url = `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(shareUrl)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      },
      icon: (
        <svg className="w-6 h-6 fill-[#d4b106]" viewBox="0 0 24 24">
          <path d="M12.001 0C6.07 0 3.407 3.526 3.407 6.425c0 2.296 1.472 3.639 2.016 4.708.204.402.164.846-.118 1.189-.526.643-1.464 1.25-2.585 1.547-.468.125-.72.63-.586 1.089.261.895 1.411 1.624 3.242 1.785.452.04.793.411.758.865-.084 1.083-.755 2.128-2.453 2.766-.356.134-.514.542-.361.888.373.844 2.13 1.748 5.681 1.748.742 0 1.564-.047 2.452-.158.487-.061.942.234 1.053.712.158.681.656 1.236 1.947 1.236s1.789-.555 1.947-1.236c.111-.478.566-.773 1.053-.712.888.111 1.71.158 2.452.158 3.551 0 5.308-.904 5.681-1.748.153-.346-.005-.754-.361-.888-1.698-.638-2.369-1.683-2.453-2.766-.035-.454.306-.825.758-.865 1.831-.161 2.981-.89 3.242-1.785.134-.459-.118-.964-.586-1.089-1.121-.297-2.059-.904-2.585-1.547-.282-.343-.322-.787-.118-1.189.544-1.069 2.016-2.412 2.016-4.708C20.595 3.526 17.932 0 12.001 0z"/>
        </svg>
      )
    },
    {
      name: "TikTok",
      bgColor: "bg-[#fce8ee]",
      textColor: "text-[#000000]",
      action: () => {
        handleCopyLink();
        showToast("Link copied! Paste into your TikTok bio or video caption.");
      },
      icon: (
        <svg className="w-6 h-6 fill-[#000000]" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      )
    },
    {
      name: "Telegram",
      bgColor: "bg-[#e1f3fb]",
      textColor: "text-[#229ed9]",
      action: () => {
        const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out my "${wishlist?.name || "wishlist"}" on Kureva!`)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      },
      icon: (
        <svg className="w-6 h-6 fill-[#229ed9]" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      )
    },
    {
      name: "Email",
      bgColor: "bg-[#fde8e8]",
      textColor: "text-[#ea4335]",
      action: () => {
        const subject = `My Wishlist: ${wishlist?.name || "Gifts"}`;
        const body = `Hey! Here is the link to my wishlist on Kureva:\n\n${shareUrl}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      },
      icon: (
        <svg className="w-6 h-6 fill-[#ea4335]" viewBox="0 0 24 24">
          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.545l8.073-6.052C21.69 2.28 24 3.434 24 5.457z"/>
        </svg>
      )
    },
    {
      name: "SMS",
      bgColor: "bg-[#e6f8ed]",
      textColor: "text-[#34c759]",
      action: () => {
        window.location.href = `sms:?&body=${encodeURIComponent(`Check out my "${wishlist?.name || "wishlist"}": ${shareUrl}`)}`;
      },
      icon: (
        <svg className="w-6 h-6 fill-[#34c759]" viewBox="0 0 24 24">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.05 21.95a1 1 0 001.218 1.218L7 21.88A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.045-1.1.996.996 0 00-.518-.145.992.992 0 00-.472.12l-2.457.818.818-2.457a1 1 0 00-.025-.99A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
        </svg>
      )
    }
  ];

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=${encodeURIComponent(shareUrl)}&margin=10`;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex flex-col justify-between">
        <div>
          <Navbar />
          <div className="max-w-md mx-auto px-6 py-10 space-y-6">
            <div className="h-10 w-10 bg-gray-200 rounded-full mx-auto animate-pulse"></div>
            <div className="h-8 w-48 bg-gray-200 rounded mx-auto animate-pulse"></div>
            <div className="grid grid-cols-4 gap-4 pt-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col items-center space-y-2">
                  <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="w-10 h-3 bg-gray-100 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
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
        <main className="mx-auto max-w-md px-6 py-10">
          <div className="mb-6">
            <Link
              href={`/dashboard/wishlists/${uuid}`}
              className="flex items-center space-x-1.5 text-xs text-secondary hover:text-primary transition-colors font-medium tracking-wide uppercase"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Wishlist</span>
            </Link>
          </div>

          <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
            {/* Header Icon */}
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Share2 className="w-6 h-6" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
                Share your wishlist
              </h1>
              <p className="text-xs text-secondary font-light truncate max-w-xs mx-auto">
                &ldquo;{wishlist?.name}&rdquo;
              </p>
            </div>

            {/* Social Sharing Grid */}
            <div className="grid grid-cols-4 gap-y-7 gap-x-3 mb-8">
              {socialChannels.map((channel) => (
                <button
                  key={channel.name}
                  type="button"
                  onClick={channel.action}
                  className="flex flex-col items-center group transition-transform active:scale-95"
                >
                  <div className={`w-14 h-14 rounded-full ${channel.bgColor} flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-all duration-200`}>
                    {channel.icon}
                  </div>
                  <span className="text-[11px] font-medium text-gray-700 tracking-tight group-hover:text-primary transition-colors">
                    {channel.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Copy Link Input Bar */}
            <div className="mb-6">
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-2">
                Wishlist Link
              </label>
              <div className="flex items-center space-x-2 bg-soft p-1.5 rounded-xl border border-border/70">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="bg-transparent text-xs text-primary font-mono px-2.5 py-1.5 flex-grow truncate focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all duration-200 shadow-sm ${
                    copied 
                      ? "bg-emerald-600 text-white" 
                      : "bg-white text-primary border border-border hover:border-accent"
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Download QR Code Section */}
            <div>
              <label className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-2">
                Download QR Code
              </label>
              
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="w-full py-3.5 px-4 bg-[#2e7d32] hover:bg-[#256629] text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all duration-200 shadow-sm"
              >
                <span>Get a QR code that is linked to your list</span>
                <ImageIcon className="w-4 h-4 shrink-0 opacity-90" />
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs px-4 py-2.5 rounded-full shadow-lg flex items-center space-x-2 animate-fade-in font-medium">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* QR Code Modal Overlay */}
          {showQrModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/30 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl border border-border max-w-sm w-full p-6 text-center shadow-2xl relative">
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="absolute top-4 right-4 text-secondary hover:text-primary p-1 rounded-full hover:bg-soft"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Wishlist QR Code
                </h3>
                <p className="text-xs text-secondary mb-5 font-light">
                  Scan with any phone camera to view &ldquo;{wishlist?.name}&rdquo;
                </p>

                <div className="p-4 bg-white border-2 border-dashed border-border rounded-xl inline-block mx-auto mb-6 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrImageUrl}
                    alt="QR Code"
                    className="w-52 h-52 object-contain"
                  />
                </div>

                <div className="space-y-2.5">
                  <a
                    href={qrImageUrl}
                    download={`wishlist-${wishlist?.name || "qr"}.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#2e7d32] hover:bg-[#256629] text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download QR Image (.PNG)</span>
                  </a>
                  
                  <button
                    type="button"
                    onClick={() => setShowQrModal(false)}
                    className="w-full py-2.5 text-xs text-secondary hover:text-primary font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
