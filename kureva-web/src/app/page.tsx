"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import MarketingHeader from "@/components/navigation/MarketingHeader";
import MarketingFooter from "@/components/navigation/MarketingFooter";
import ScrollTextReveal from "@/components/home/ScrollTextReveal";
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Gift,
  Share2,
  ShieldCheck,
  Link2,
  QrCode,
  Palette,
  ShoppingBag,
  ExternalLink,
  Check,
  Heart,
  Plus
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [claimedItem, setClaimedItem] = useState<number | null>(null);

  const showcaseWishes = [
    {
      id: 1,
      title: "Sony WH-1000XM5 Wireless Noise Canceling",
      price: "₦ 450,000",
      store: "AMAZON",
      tag: "🔥 Most Wanted",
      status: "available",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      title: "Le Labo Santal 33 Eau de Parfum (50ml)",
      price: "₦ 195,000",
      store: "SEPHORA",
      tag: "Really Loved",
      status: "verified",
      gifter: "Sophia (Verified Receipt)",
      image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&auto=format&fit=crop&q=80",
    },
    {
      id: 3,
      title: "Fujifilm Instax Mini Evo Hybrid Camera",
      price: "₦ 175,000",
      store: "JUMIA",
      tag: "Nice To Have",
      status: "available",
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80",
    },
  ];

  const sections = [
    {
      number: "01",
      badge: "Curation & Setup",
      title: "Curate wishlists for every moment.",
      description:
        "Create personalized gift collections for birthdays, weddings, holidays, or quiet everyday wants. Customize cover photography, add personal creator notes, and set granular privacy controls with a few taps.",
      highlights: [
        "Private, Shared, or Public visibility controls",
        "Custom high-resolution cover photography",
        "Instant shareable link and registry generation"
      ],
      image: "/images/home/feature-create-wishlist.png",
      alt: "Create a new wishlist with custom covers and privacy settings",
      reversed: false,
    },
    {
      number: "02",
      badge: "Effortless Import",
      title: "Paste any store link. We handle the rest.",
      description:
        "Found something you love on Jumia, Amazon, ASOS, or Zara? Just paste the product link into Kureva. Our smart parser automatically pulls the title, price, currency, store name, and product photos in seconds.",
      highlights: [
        "1-Click store auto-fill from any e-commerce website",
        "Multi-currency formatting (₦, $, €, £, ¥)",
        "Priority flags: Most Wanted, Really Loved, Nice To Have"
      ],
      image: "/images/home/feature-add-wish.png",
      alt: "Add a wish with automated product link parser",
      reversed: true,
    },
    {
      number: "03",
      badge: "Instant Distribution",
      title: "Share everywhere in a single tap.",
      description:
        "Effortlessly distribute your wishlist across WhatsApp, Instagram, Twitter, Snapchat, TikTok, Facebook, Telegram, SMS, and Email. Your friends get direct access to your registry with zero app installation required.",
      highlights: [
        "1-Tap native sharing to 10+ social platforms & messaging apps",
        "Zero-friction web access for all your friends and family",
        "Instant clipboard copy with customized vanity links"
      ],
      image: "/images/home/feature-share-social.png",
      alt: "Share wishlist across WhatsApp, Instagram, TikTok and social channels",
      reversed: false,
    },
    {
      number: "04",
      badge: "Story Graphic Studio",
      title: "Design aesthetic story cards with scannable QR codes.",
      description:
        "Generate high-resolution 9:16 story cards and 1:1 square graphics tailored for WhatsApp status and Instagram stories. Choose editorial gradient presets like Emerald Silk or Midnight Velvet, spotlight your top wishes, and embed instant scannable QR codes.",
      highlights: [
        "Editorial Ticket-Frame canvas with high-res .PNG export",
        "Scannable QR codes leading directly to your gift registry",
        "Aesthetic gradient palettes & spotlight product cards"
      ],
      image: "/images/home/feature-story-studio.png",
      alt: "Customize and export high-res story graphics with QR code",
      reversed: true,
    },
    {
      number: "05",
      badge: "Creator Control & Privacy",
      title: "Stay in total control with verified gift receipts.",
      description:
        "Never worry about false claims or prank locks. Unverified guest claims remain open to the public until you review the gifter's name, email, and personal note in your private dashboard. One click to confirm receipt or reopen the item.",
      highlights: [
        "Private review banner showing gifter details and surprise notes",
        "Anti-troll security: unverified claims remain available to guests",
        "1-Click 'Verify & Confirm' or 'Decline / Reopen' controls"
      ],
      image: "/images/home/feature-claim-verification.png",
      alt: "Owner dashboard gift claims and verification review panel",
      reversed: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col justify-between selection:bg-emerald-100 text-stone-800">
      <MarketingHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Occasion / Use-Case Badges Pill */}
          <div className="inline-flex items-center flex-wrap justify-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-stone-200/90 text-stone-700 text-xs font-medium shadow-2xs">
            <span className="font-semibold text-emerald-800">Perfect for:</span>
            <span>🎂 Birthdays</span>
            <span className="text-stone-300">•</span>
            <span>💍 Weddings</span>
            <span className="text-stone-300">•</span>
            <span>🍼 Baby Showers</span>
            <span className="text-stone-300">•</span>
            <span>🎄 Holidays</span>
            <span className="text-stone-300">•</span>
            <span>✨ Everyday Desires</span>
          </div>

          {/* Main Editorial Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-stone-900 font-editorial leading-[1.08]">
            Create your dream wishlist.<br />
            <span className="text-[#1b7a43] italic">Get the gifts you actually love.</span>
          </h1>

          {/* Crystal-Clear Subtitle */}
          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed font-light">
            Collect wishes from any store in seconds, export high-res story cards with QR codes for WhatsApp & Instagram, and let friends claim gifts with zero duplicate surprises.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href={user ? "/dashboard/wishlists" : "/register"}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#1b7a43] hover:bg-[#145d33] text-white font-semibold rounded-2xl text-sm shadow-md flex items-center justify-center space-x-2 transition-all active:scale-98"
            >
              <span>Create your free wishlist</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="w-full sm:w-auto px-7 py-3.5 border border-stone-300 hover:border-stone-400 bg-white text-stone-800 font-semibold rounded-2xl text-sm transition-all shadow-xs"
            >
              How It Works
            </Link>
          </div>

          {/* Realistic Live Registry Preview Mockup */}
          <div className="pt-12 max-w-3xl mx-auto text-left">
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden">
              {/* Registry Header Bar */}
              <div className="p-6 sm:p-8 bg-[#fafaf9] border-b border-stone-200/80 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
                      Live Gift Registry
                    </span>
                  </div>
                  <h3 className="text-2xl font-normal font-editorial text-stone-900">
                    Maya&apos;s 25th Birthday Wishlist
                  </h3>
                  <div className="text-xs text-stone-500 flex items-center space-x-2">
                    <span>Curated by @maya</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">2 of 3 gifts claimed (67%)</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-xl bg-[#1b7a43] text-white text-xs font-semibold shadow-2xs hover:bg-[#145d33] transition-colors flex items-center space-x-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Story Card</span>
                  </Link>
                </div>
              </div>

              {/* Wish Items Grid */}
              <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                {showcaseWishes.map((item) => {
                  const isClaimed = claimedItem === item.id || item.status === "verified";
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-stone-200/80 bg-white overflow-hidden shadow-2xs flex flex-col justify-between group hover:border-emerald-400/60 transition-all"
                    >
                      <div>
                        {/* Image Frame */}
                        <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-stone-800 px-2 py-0.5 rounded-md shadow-2xs">
                            {item.store}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-1.5">
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                            {item.tag}
                          </span>
                          <h4 className="text-xs font-semibold text-stone-900 line-clamp-2 leading-tight">
                            {item.title}
                          </h4>
                          <div className="text-xs font-bold text-stone-900 pt-0.5 font-mono">
                            {item.price}
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="p-4 pt-0">
                        {isClaimed ? (
                          <div className="w-full py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-semibold flex items-center justify-center space-x-1">
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{item.gifter || "Claimed • Verified ✓"}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setClaimedItem(item.id)}
                            className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-[#1b7a43] text-white text-[11px] font-semibold transition-colors flex items-center justify-center space-x-1 shadow-2xs active:scale-98"
                          >
                            <Gift className="w-3.5 h-3.5" />
                            <span>Claim This Gift</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* On-Scroll Word Illumination & Highlighter Section */}
      <ScrollTextReveal />

      {/* Zigzag Feature Sections (Top 5 Curated Screenshots) */}
      <section className="py-16 md:py-24 space-y-24 md:space-y-36 max-w-6xl mx-auto px-6">
        {sections.map((sec) => (
          <div
            key={sec.number}
            className={`flex flex-col items-center gap-10 md:gap-16 lg:gap-24 ${
              sec.reversed ? "lg:flex-row-reverse" : "lg:flex-row"
            }`}
          >
            {/* Text Column */}
            <div className="flex-1 space-y-5 text-left">
              <div className="flex items-center space-x-2.5">
                <span className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-mono font-bold">
                  {sec.number}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  {sec.badge}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-stone-900 font-editorial tracking-tight leading-tight">
                {sec.title}
              </h2>

              <p className="text-sm sm:text-base text-stone-600 font-light leading-relaxed">
                {sec.description}
              </p>

              <div className="space-y-2.5 pt-2">
                {sec.highlights.map((h, hIdx) => (
                  <div key={hIdx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-stone-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  href={user ? "/dashboard/wishlists" : "/register"}
                  className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-900 transition-colors group"
                >
                  <span>Experience this feature</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Mobile Screenshot Mockup Column */}
            <div className="flex-1 w-full max-w-md lg:max-w-none flex justify-center">
              <div className="relative group w-full max-w-xs sm:max-w-sm">
                {/* Subtle Decorative Backdrop Glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/10 to-stone-500/10 rounded-[38px] blur-xl opacity-75 group-hover:opacity-100 transition duration-500"></div>

                {/* Phone Mockup Frame */}
                <div className="relative rounded-[32px] overflow-hidden border-[6px] border-stone-900/90 shadow-2xl bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sec.image}
                    alt={sec.alt}
                    className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl space-y-6">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-[11px] tracking-widest font-semibold uppercase text-emerald-400">
              Join Kureva Today
            </span>
            <h2 className="text-3xl sm:text-5xl font-normal font-editorial tracking-tight">
              Create your dream wishlist in under 60 seconds.
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed max-w-md mx-auto">
              Start collecting wishes, sharing story cards, and receiving the gifts you genuinely desire.
            </p>
            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-2xl bg-[#1b7a43] hover:bg-[#145d33] text-white text-sm font-semibold transition-all shadow-md active:scale-98"
              >
                <span>Get Started for Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
