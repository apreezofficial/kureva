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
  Smartphone,
  Eye,
  Check,
  Layers,
  Heart
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [activeHeroTab, setActiveHeroTab] = useState<0 | 1 | 2>(0);

  const heroTabs = [
    {
      id: 0,
      label: "1. Paste Store Link",
      icon: Link2,
      headline: "Paste links from any store. We auto-fill details.",
      previewType: "import",
    },
    {
      id: 1,
      label: "2. Social Story Studio",
      icon: QrCode,
      headline: "Export story graphics with QR codes for WhatsApp & IG.",
      previewType: "story",
    },
    {
      id: 2,
      label: "3. Verified Gifting",
      icon: ShieldCheck,
      headline: "Friends claim gifts. You verify receipt with 0 duplicates.",
      previewType: "claim",
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

          {/* Main Unmistakable Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-stone-900 font-editorial leading-[1.08]">
            Create your dream wishlist.<br />
            <span className="text-[#1b7a43] italic">Get the gifts you actually love.</span>
          </h1>

          {/* Crystal-Clear Value Proposition Subheading */}
          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed font-light">
            Paste links from any online store (Jumia, Amazon, Zara & Apple). Auto-generate high-res story cards with scannable QR codes for WhatsApp & Instagram, and let friends claim gifts with zero duplicate surprises.
          </p>

          {/* Primary Action Buttons */}
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
              See how it works (3 steps)
            </Link>
          </div>

          {/* Visual Interactive Hero Preview Workflow */}
          <div className="pt-10 max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden text-left">
              {/* Interactive Step Switcher Tabs */}
              <div className="grid grid-cols-3 border-b border-stone-200 bg-stone-50/70 p-1.5 gap-1 text-center">
                {heroTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeHeroTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveHeroTab(tab.id as 0 | 1 | 2)}
                      className={`flex items-center justify-center space-x-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-white text-emerald-800 shadow-xs border border-stone-200/60"
                          : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Preview Canvas */}
              <div className="p-6 sm:p-8 bg-gradient-to-b from-stone-50/40 to-white">
                {/* Tab 0: Link Auto-Import Simulation */}
                {activeHeroTab === 0 && (
                  <div className="space-y-4 animate-in fade-in-50 duration-200">
                    <div className="flex items-center space-x-2 text-xs font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full w-fit">
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Instant Link Scraping Engine</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="text-xs text-stone-500 truncate font-mono">
                        https://www.jumia.com.ng/classic-baggy-denim-jeans...
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                        Auto-Filled ✓
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                          🔥 Most Wanted
                        </span>
                        <h4 className="text-sm font-semibold text-stone-900">Classic Baggy Denim Jeans</h4>
                        <div className="text-xs text-stone-500">₦ 45,000 • Jumia Nigeria</div>
                      </div>
                      <span className="text-xs font-semibold text-[#1b7a43] bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-2xs shrink-0">
                        Added to Wishlist
                      </span>
                    </div>
                  </div>
                )}

                {/* Tab 1: Story Graphic Preview */}
                {activeHeroTab === 1 && (
                  <div className="space-y-4 animate-in fade-in-50 duration-200">
                    <div className="flex items-center space-x-2 text-xs font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full w-fit">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Pixel-Perfect Story Card Studio</span>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-5 rounded-2xl shadow-md border border-emerald-800 flex items-center justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase tracking-widest text-emerald-300 font-mono">
                          Official Wishlist Registry
                        </span>
                        <div className="text-lg font-editorial text-white">Birthday Wishlist</div>
                        <div className="text-xs text-emerald-200/80">Curated by @apcodesphere</div>
                      </div>

                      <div className="w-16 h-16 bg-white rounded-xl p-1.5 shadow-md flex flex-col items-center justify-center shrink-0">
                        <QrCode className="w-10 h-10 text-stone-900" />
                        <span className="text-[7px] font-bold text-stone-600 mt-0.5">SCAN ME</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                      <span>✓ 9:16 Story format (Instagram & WhatsApp)</span>
                      <span className="font-semibold text-emerald-700">1-Tap .PNG Export</span>
                    </div>
                  </div>
                )}

                {/* Tab 2: Verified Gifting */}
                {activeHeroTab === 2 && (
                  <div className="space-y-4 animate-in fade-in-50 duration-200">
                    <div className="flex items-center space-x-2 text-xs font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full w-fit">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Anti-Troll & Duplicate Prevention</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Gift className="w-4 h-4 text-emerald-700" />
                          <span className="text-xs font-semibold text-stone-900">Claim from Gifter (David)</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Pending Verification
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 italic bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        &quot;Happy Birthday! Ordered it directly to your address.&quot;
                      </p>
                      <div className="flex items-center space-x-2 pt-1">
                        <span className="text-xs font-semibold px-3 py-1 bg-emerald-700 text-white rounded-lg shadow-2xs">
                          ✓ Verify & Confirm
                        </span>
                        <span className="text-xs font-medium text-stone-500 hover:text-stone-800 px-2">
                          Decline / Reopen
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-500 text-center">
                      *Unverified claims remain open to public visitors so prank clicks never lock your gifts.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Quick Value Grid */}
      <section className="border-y border-stone-200 bg-white py-14 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-700">
              Simple 3-Step Flow
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal text-stone-900 font-editorial">
              How you get the gifts you actually want.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#fafaf9] border border-stone-200/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold text-xs font-mono">
                01
              </div>
              <h3 className="text-base font-semibold text-stone-900 font-editorial">
                Paste Any Store Link
              </h3>
              <p className="text-xs text-stone-600 font-light leading-relaxed">
                Add products from Jumia, Amazon, ASOS, Zara, or Apple. We pull the title, price, and photo automatically.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#fafaf9] border border-stone-200/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold text-xs font-mono">
                02
              </div>
              <h3 className="text-base font-semibold text-stone-900 font-editorial">
                Share on WhatsApp & IG
              </h3>
              <p className="text-xs text-stone-600 font-light leading-relaxed">
                Export 9:16 story cards with embedded QR codes. Friends open your registry without needing an app.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#fafaf9] border border-stone-200/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold text-xs font-mono">
                03
              </div>
              <h3 className="text-base font-semibold text-stone-900 font-editorial">
                Zero Duplicate Gifts
              </h3>
              <p className="text-xs text-stone-600 font-light leading-relaxed">
                Guests claim what they buy and leave surprise notes. You verify receipt in your private dashboard.
              </p>
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
