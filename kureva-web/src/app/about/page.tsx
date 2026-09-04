"use client";

import Link from "next/link";
import MarketingHeader from "@/components/navigation/MarketingHeader";
import MarketingFooter from "@/components/navigation/MarketingFooter";
import { Sparkles, Heart, Shield, Compass, ArrowRight, CheckCircle2, Feather } from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      title: "Kanso (簡素 — Simplicity)",
      description:
        "We eliminate unnecessary noise, cluttered banners, and aggressive popups so the gifts and items you cherish remain the absolute focus.",
      icon: Feather,
    },
    {
      title: "Ma (間 — Intentional Space)",
      description:
        "Every element on Kureva is given room to breathe. Thoughtful whitespace and editorial typography create a calm, luxurious curation experience.",
      icon: Compass,
    },
    {
      title: "Shibui (渋味 — Subtle Elegance)",
      description:
        "Understated beauty over flashy commercialism. From our ticket-frame story cards to custom color palettes, we design for timeless taste.",
      icon: Sparkles,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col justify-between text-stone-800 selection:bg-emerald-100">
      <MarketingHeader />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-28 px-6 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Our Origin & Purpose</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-stone-900 font-editorial leading-[1.1]">
            Wishlists, reimagined with quiet dignity.
          </h1>

          <p className="text-base sm:text-xl text-stone-600 font-light max-w-2xl mx-auto leading-relaxed">
            Kureva was built to replace chaotic spreadsheets, awkward group chats, and ad-stuffed registry sites with an understated, elegant space for your desires.
          </p>
        </section>

        {/* Narrative Section */}
        <section className="py-12 md:py-16 px-6 max-w-4xl mx-auto border-t border-stone-200/80">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-4">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-700">
                The Backstory
              </span>
              <h2 className="text-2xl sm:text-3xl font-normal text-stone-900 font-editorial mt-2 leading-tight">
                Why traditional gifting was broken.
              </h2>
            </div>

            <div className="md:col-span-8 space-y-5 text-sm sm:text-base text-stone-600 font-light leading-relaxed">
              <p>
                When someone asks, <em>&quot;What do you want for your birthday?&quot;</em> most people hesitate. You scramble to find links across multiple stores, text screenshots back and forth, and inevitably end up with duplicate gifts or things you didn&apos;t need.
              </p>
              <p>
                Existing registry platforms were either locked to a single department store or bloated with third-party tracking, affiliate ads, and clunky interfaces that forced guests to download an app just to claim a gift.
              </p>
              <p className="font-medium text-stone-900">
                We built Kureva to be different: open to any store in the world, beautifully designed for social media, completely free of clutter, and respectful of both creators and gifters.
              </p>
            </div>
          </div>
        </section>

        {/* Japanese Philosophy Principles */}
        <section id="philosophy" className="py-16 md:py-24 px-6 bg-white border-y border-stone-200/80">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-700">
                Core Philosophy
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-stone-900 font-editorial">
                The aesthetics behind our craftsmanship.
              </h2>
              <p className="text-sm text-stone-500 font-light">
                Every screen, button, and graphic in Kureva is guided by three Japanese design principles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((v, i) => {
                const Icon = v.icon;
                return (
                  <div 
                    key={i} 
                    className="p-8 rounded-3xl bg-[#fafaf9] border border-stone-200/70 space-y-4 hover:border-emerald-300/80 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-medium text-stone-900 font-editorial">
                      {v.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Commitment to Privacy & Anti-Troll */}
        <section className="py-16 md:py-24 px-6 max-w-4xl mx-auto">
          <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-14 space-y-8 relative overflow-hidden shadow-2xl">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Our Privacy & Creator Promise</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-normal font-editorial">
                Built with anti-troll security and total creator control.
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
                Your registry is your sacred space. We designed an anti-troll verification system so malicious visitors cannot falsely claim items to lock your list. Unverified claims remain open until you confirm receipt.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-stone-300 border-t border-stone-800 pt-6">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No guest account required to claim gifts</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero intrusive ads or data selling</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Direct outbound store links with zero markups</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Surprise duplicate protection on every claim</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center space-x-2 px-7 py-3 rounded-2xl bg-[#1b7a43] hover:bg-[#145d33] text-white text-xs sm:text-sm font-semibold transition-all shadow-md"
              >
                <span>Create Your Wishlist</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
