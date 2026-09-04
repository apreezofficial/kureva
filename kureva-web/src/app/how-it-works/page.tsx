"use client";

import Link from "next/link";
import MarketingHeader from "@/components/navigation/MarketingHeader";
import MarketingFooter from "@/components/navigation/MarketingFooter";
import { 
  Sparkles, 
  Link2, 
  Share2, 
  QrCode, 
  ShoppingBag, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Palette,
  Eye,
  SlidersHorizontal,
  BookmarkCheck
} from "lucide-react";

export default function HowItWorksPage() {
  const creatorSteps = [
    {
      step: "01",
      title: "Create & Customize Your Wishlist",
      description:
        "Name your collection, upload custom cover photography, write a personal note to your friends, and select your visibility (Public, Shared/Unlisted, or Private).",
      icon: SlidersHorizontal,
    },
    {
      step: "02",
      title: "Paste Store Links to Auto-Import",
      description:
        "Found something on Jumia, Amazon, ASOS, Zara, or Apple? Paste the product URL. Kureva automatically extracts the product title, image, price, and store name in seconds.",
      icon: Link2,
    },
    {
      step: "03",
      title: "Share Everywhere & Export Story Graphics",
      description:
        "Distribute via WhatsApp, Instagram, or Twitter. Use the built-in Story Graphic Studio to download high-resolution 9:16 story cards with custom palettes and scannable QR codes.",
      icon: QrCode,
    },
    {
      step: "04",
      title: "Verify Received Gifts & Control Your List",
      description:
        "Review incoming claims from friends in your private owner dashboard. When a gift arrives, confirm it with 1 click to mark it verified on the public registry.",
      icon: ShieldCheck,
    },
  ];

  const gifterSteps = [
    {
      step: "01",
      title: "Open the Registry Link",
      description:
        "Click the link shared by the creator or scan their story card QR code. No app downloads or mandatory account creation required.",
      icon: Eye,
    },
    {
      step: "02",
      title: "Buy Directly from the Store",
      description:
        "Click 'Buy at Jumia / Amazon' on any item. You will be redirected straight to the merchant product page to order directly to their address.",
      icon: ShoppingBag,
    },
    {
      step: "03",
      title: "Claim in 1-Click with a Note",
      description:
        "Click 'I bought this' or 'Reserve', enter your name, email, and a surprise personal note. The item is locked to prevent duplicate purchases.",
      icon: BookmarkCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col justify-between text-stone-800 selection:bg-emerald-100">
      <MarketingHeader />

      <main className="flex-grow">
        {/* Header Hero */}
        <section className="py-20 md:py-28 px-6 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Step-by-Step Guide</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-stone-900 font-editorial leading-[1.1]">
            How Kureva works.
          </h1>

          <p className="text-base sm:text-xl text-stone-600 font-light max-w-2xl mx-auto leading-relaxed">
            Whether you are curating your dream birthday registry or buying a gift for a friend, Kureva makes every step effortless, aesthetic, and completely stress-free.
          </p>
        </section>

        {/* For Wishlist Creators */}
        <section className="py-16 md:py-20 px-6 max-w-5xl mx-auto border-t border-stone-200/80">
          <div className="space-y-4 mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-700">
              For Wishlist Creators
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal text-stone-900 font-editorial">
              How to curate, design, and share your desires.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {creatorSteps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div 
                  key={i} 
                  className="p-8 rounded-3xl bg-white border border-stone-200/80 space-y-4 shadow-xs relative overflow-hidden group hover:border-emerald-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full">
                      Step {s.step}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-xl font-medium text-stone-900 font-editorial">
                    {s.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                    {s.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* For Friends & Gifters */}
        <section className="py-16 md:py-24 px-6 bg-white border-y border-stone-200/80">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-700">
                For Friends & Guests
              </span>
              <h2 className="text-3xl sm:text-4xl font-normal text-stone-900 font-editorial">
                The zero-friction guest gifting experience.
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 font-light max-w-xl">
                We believe nobody should ever have to create an account or download an app just to give a gift to someone they love.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {gifterSteps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div 
                    key={i} 
                    className="p-8 rounded-3xl bg-[#fafaf9] border border-stone-200/70 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-stone-900 bg-stone-200 px-3 py-1 rounded-full">
                        Step {s.step}
                      </span>
                      <Icon className="w-5 h-5 text-emerald-700" />
                    </div>

                    <h3 className="text-lg font-medium text-stone-900 font-editorial">
                      {s.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-16 md:py-24 px-6 max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-700">
              Unique Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal text-stone-900 font-editorial">
              Built specifically for modern social gifting.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div id="story-studio" className="p-7 rounded-3xl bg-white border border-stone-200/80 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-stone-900 font-editorial">
                Story Graphic Studio
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Export 9:16 Instagram Story and 1:1 Square graphics with custom gradients and scannable QR codes ready for WhatsApp status.
              </p>
            </div>

            <div id="link-parser" className="p-7 rounded-3xl bg-white border border-stone-200/80 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Link2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-stone-900 font-editorial">
                Universal Link Auto-Fill
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Smart link scraping that grabs titles, images, and prices from Jumia, Amazon, Shopify, Zara, and ASOS stores worldwide.
              </p>
            </div>

            <div id="verification" className="p-7 rounded-3xl bg-white border border-stone-200/80 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-stone-900 font-editorial">
                Anti-Troll Verification
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Items remain open to the public until you confirm the gifter&apos;s receipt in your dashboard. Zero false claim list locking.
              </p>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="pt-8 text-center">
            <Link
              href="/register"
              className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-[#1b7a43] hover:bg-[#145d33] text-white text-sm font-semibold transition-all shadow-md active:scale-98"
            >
              <span>Create Your Free Wishlist</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
