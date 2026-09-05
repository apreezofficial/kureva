"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Play, 
  Pause, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  QrCode, 
  Link2, 
  Share2, 
  Heart, 
  SlidersHorizontal, 
  User, 
  Lock, 
  Eye, 
  ShoppingBag, 
  ExternalLink,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Gift
} from "lucide-react";

interface StepConfig {
  id: number;
  label: string;
  badge: string;
  title: string;
  description: string;
  tagline: string;
}

export default function ProductMotionFlow() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  // Sub-animation states within steps
  const [typedUrl, setTypedUrl] = useState<string>("");
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [scrapedResult, setScrapedResult] = useState<boolean>(false);
  const [claimVerified, setClaimVerified] = useState<boolean>(false);

  const steps: StepConfig[] = [
    {
      id: 0,
      label: "01. Quick Setup",
      badge: "Fast Onboarding",
      title: "Claim your vanity curator handle in 5 seconds.",
      description: "Sign up and create your clean public profile at kureva.pxxl.pro/@yourname.",
      tagline: "Zero friction, no spam."
    },
    {
      id: 1,
      label: "02. Create Wishlist",
      badge: "Registry Curation",
      title: "Create curated collections for birthdays, weddings, or holidays.",
      description: "Set custom cover photography, personal notes, and privacy controls with a few taps.",
      tagline: "Private, Shared, or Public."
    },
    {
      id: 2,
      label: "03. Store Auto-Fill",
      badge: "Universal Link Parser",
      title: "Paste any store link. We auto-fill title, photo & price.",
      description: "Works seamlessly with Jumia, Amazon, Zara, ASOS, Apple, and Shopify stores.",
      tagline: "1-Click instant scraping."
    },
    {
      id: 3,
      label: "04. Story Studio",
      badge: "Social Graphic Studio",
      title: "Auto-generate aesthetic 9:16 story cards with QR codes.",
      description: "Ready for WhatsApp status & Instagram stories with custom luxury gradient presets.",
      tagline: "High-res export & instant scan."
    },
    {
      id: 4,
      label: "05. Verified Gifting",
      badge: "Anti-Troll Protection",
      title: "Friends claim gifts. You verify receipts in 1-click.",
      description: "Prevents duplicate gifts without troll locks. Unverified claims remain open until verified.",
      tagline: "Surprise notes & verified receipts."
    }
  ];

  const STEP_DURATION = 5500; // 5.5 seconds per step

  // Main playback timer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 50;
    const increment = (intervalTime / STEP_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveStep((current) => (current + 1) % steps.length);
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  // Step-specific micro-animations
  useEffect(() => {
    setProgress(0);

    // Reset sub-states
    setTypedUrl("");
    setIsScraping(false);
    setScrapedResult(false);
    setClaimVerified(false);

    if (activeStep === 2) {
      // Typing simulation for Step 3: Link auto-fill
      const targetUrl = "https://www.jumia.com.ng/classic-baggy-denim-jeans";
      let currentIndex = 0;
      const typeInterval = setInterval(() => {
        if (currentIndex <= targetUrl.length) {
          setTypedUrl(targetUrl.slice(0, currentIndex));
          currentIndex += 2;
        } else {
          clearInterval(typeInterval);
          setIsScraping(true);
          setTimeout(() => {
            setIsScraping(false);
            setScrapedResult(true);
          }, 800);
        }
      }, 40);

      return () => clearInterval(typeInterval);
    } else if (activeStep === 4) {
      // Claim verification simulation
      const verifyTimer = setTimeout(() => {
        setClaimVerified(true);
      }, 2200);
      return () => clearTimeout(verifyTimer);
    }
  }, [activeStep]);

  const handleStepClick = (stepIndex: number) => {
    setActiveStep(stepIndex);
    setProgress(0);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 text-left">
      {/* Step Navigation Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-stone-200/80">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(idx)}
                className={`relative px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center space-x-2 ${
                  isActive
                    ? "bg-white text-stone-900 shadow-xs border border-stone-300 font-semibold"
                    : "text-stone-500 hover:text-stone-800 hover:bg-white/60"
                }`}
              >
                <span>{step.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1b7a43] animate-pulse" />
                )}
                {/* Progress bar inside active tab */}
                {isActive && isPlaying && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="bg-[#1b7a43] h-full transition-all duration-75"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Play / Pause toggle */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? "Pause automated walkthrough" : "Play walkthrough"}
          className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors shrink-0 shadow-2xs"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        </button>
      </div>

      {/* Main Motion Stage Box */}
      <div className="bg-stone-900 rounded-3xl border border-stone-800 shadow-2xl overflow-hidden relative">
        {/* Browser Top Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-stone-950/80 border-b border-stone-800/80 flex items-center justify-between text-xs">
          {/* Traffic Light Dots */}
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          {/* Browser Address Bar */}
          <div className="flex items-center space-x-2 px-3.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-stone-400 font-mono text-[11px] max-w-xs sm:max-w-md w-full justify-center">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span className="text-stone-300 truncate">kureva.pxxl.pro/app</span>
            <span className="text-stone-600">/</span>
            <span className="text-emerald-400 font-medium truncate">
              {activeStep === 0 && "register"}
              {activeStep === 1 && "wishlists/new"}
              {activeStep === 2 && "wishes/import"}
              {activeStep === 3 && "studio/story-card"}
              {activeStep === 4 && "verify-claims"}
            </span>
          </div>

          {/* Step Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 text-stone-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Step {activeStep + 1} of 5</span>
          </div>
        </div>

        {/* Animated Canvas Content */}
        <div className="p-6 sm:p-10 min-h-[380px] sm:min-h-[440px] flex flex-col justify-between relative bg-radial from-stone-900 via-stone-900 to-stone-950">
          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Step Banner & Context */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-5">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {steps[activeStep].badge}
                </span>
                <span className="text-xs text-stone-400 font-light">• {steps[activeStep].tagline}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-normal font-editorial text-white">
                {steps[activeStep].title}
              </h3>
            </div>

            <Link
              href="/register"
              className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium shrink-0 group transition-colors"
            >
              <span>Create Your Free List</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Interactive UI Stage Simulation */}
          <div className="py-6 sm:py-8 flex items-center justify-center relative z-10">
            {/* ------------------------------------------------------------- */}
            {/* STEP 0: ONBOARDING & SETUP */}
            {/* ------------------------------------------------------------- */}
            {activeStep === 0 && (
              <div className="w-full max-w-lg bg-stone-950/90 border border-stone-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-lg font-editorial">
                      M
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Maya&apos;s Profile</h4>
                      <p className="text-xs font-mono text-emerald-400">kureva.pxxl.pro/@maya</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-stone-400 bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-800">
                    Instant Setup ✓
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-stone-500 font-bold">Public Bio</span>
                    <p className="text-xs text-stone-300 font-light truncate">Curating my 25th birthday ✨</p>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-stone-500 font-bold">Currency</span>
                    <p className="text-xs text-stone-300 font-mono font-medium">NGN (₦) • Multi-currency</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 flex items-center justify-between text-xs text-emerald-200">
                  <span>Custom vanity URL generated &amp; locked</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 1: CREATE WISHLIST */}
            {/* ------------------------------------------------------------- */}
            {activeStep === 1 && (
              <div className="w-full max-w-lg bg-stone-950/90 border border-stone-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="h-28 rounded-xl bg-gradient-to-r from-emerald-900 via-[#1b7a43] to-teal-800 p-4 flex flex-col justify-between relative overflow-hidden border border-emerald-700/50">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/40 text-white text-[10px] font-mono border border-white/20">
                      Public Registry
                    </span>
                    <span className="text-white/80 text-[11px] font-mono">Oct 14, 2026</span>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-normal font-editorial text-white">
                      Maya&apos;s 25th Birthday Wishlist
                    </h4>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Visibility: <strong className="text-white">Public / Social Shared</strong></span>
                  </div>
                  <span className="font-mono text-emerald-400">Ready for wishes</span>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 2: LINK AUTO-FILL */}
            {/* ------------------------------------------------------------- */}
            {activeStep === 2 && (
              <div className="w-full max-w-lg space-y-3 animate-in fade-in zoom-in-95 duration-300">
                {/* Pasting URL bar */}
                <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 flex items-center space-x-3 text-xs shadow-xl">
                  <Link2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="flex-1 font-mono text-stone-300 truncate">
                    {typedUrl || "https://www.jumia.com.ng/..."}
                    <span className="inline-block w-1.5 h-3.5 bg-emerald-400 ml-0.5 animate-pulse" />
                  </div>
                  {isScraping && (
                    <span className="text-[11px] font-mono text-emerald-400 animate-pulse">Auto-Filling...</span>
                  )}
                  {scrapedResult && (
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">Auto-Filled ✓</span>
                  )}
                </div>

                {/* Scraped Result Card */}
                {scrapedResult ? (
                  <div className="bg-stone-950 border border-emerald-600/40 rounded-2xl p-4 flex items-center space-x-4 shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
                    <img
                      src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300&auto=format&fit=crop&q=80"
                      alt="Product preview"
                      className="w-16 h-16 rounded-xl object-cover border border-stone-700 shrink-0"
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-stone-800 text-stone-300">
                          JUMIA NIGERIA
                        </span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                          🔥 Most Wanted
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-white truncate">Classic Baggy Denim Jeans</h4>
                      <p className="text-xs font-mono font-bold text-emerald-400">₦ 45,000</p>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl border border-dashed border-stone-800 text-center text-xs text-stone-500">
                    Extracting title, price, photos, and store metadata in seconds...
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 3: STORY STUDIO */}
            {/* ------------------------------------------------------------- */}
            {activeStep === 3 && (
              <div className="w-full max-w-sm bg-gradient-to-b from-[#022c22] to-[#064e3b] border border-emerald-500/40 rounded-3xl p-5 shadow-2xl text-white space-y-4 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
                {/* Header Ticket Details */}
                <div className="flex justify-between items-center text-[10px] font-mono text-emerald-300/80 border-b border-white/10 pb-2">
                  <span>KUREVA STORY STUDIO</span>
                  <span>9:16 HIGH-RES EXPORT</span>
                </div>

                <div className="space-y-1 text-center pt-1">
                  <h4 className="text-lg font-editorial font-normal">Maya&apos;s Birthday Wishlist</h4>
                  <p className="text-xs text-emerald-200/80 font-light">Scan to view registry &amp; claim wishes</p>
                </div>

                {/* QR Code & Preview Frame */}
                <div className="bg-white/95 rounded-2xl p-4 text-stone-900 flex flex-col items-center justify-center space-y-2 shadow-inner">
                  <div className="w-24 h-24 bg-stone-900 rounded-xl p-2 flex items-center justify-center text-white relative">
                    <QrCode className="w-20 h-20 text-white" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-stone-600">
                    kureva.pxxl.pro/w/maya-25
                  </span>
                </div>

                {/* 1-Tap Share Bar */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="py-2 px-3 rounded-xl bg-white/10 border border-white/15 text-center font-medium">
                    WhatsApp Status
                  </div>
                  <div className="py-2 px-3 rounded-xl bg-white/10 border border-white/15 text-center font-medium">
                    Instagram Story
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 4: VERIFIED GIFTING */}
            {/* ------------------------------------------------------------- */}
            {activeStep === 4 && (
              <div className="w-full max-w-lg bg-stone-950/90 border border-stone-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-300">
                {/* Claim Incoming Banner */}
                <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="font-semibold text-white">Sophia claimed &quot;Sony Headphones&quot;</p>
                      <p className="text-[11px] text-stone-400 italic">&ldquo;Happy 25th birthday Maya! Enjoy your tunes! 🎧&rdquo;</p>
                    </div>
                  </div>
                </div>

                {/* Creator Control & Verification */}
                <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-stone-400">Receipt Status:</span>
                    {claimVerified ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700/60 font-semibold font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Verified by Creator ✓</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 font-mono">Reviewing Claim...</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => setClaimVerified(true)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                        claimVerified
                          ? "bg-emerald-600 text-white"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{claimVerified ? "Confirmed & Verified" : "Click to Verify Receipt"}</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-stone-500 font-light text-center">
                  Anti-Troll Guarantee: Wishlists are never blocked by prank claims. You stay in total control.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Controls Bar */}
          <div className="relative z-10 flex items-center justify-between pt-4 border-t border-stone-800/80 text-xs text-stone-400">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-emerald-400">
                0{activeStep + 1}
              </span>
              <span className="text-stone-600">/</span>
              <span className="font-mono text-stone-500">05</span>
              <span className="text-stone-300 font-medium pl-1">{steps[activeStep].label.replace(/^\d+\.\s*/, "")}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : steps.length - 1))}
                className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
              >
                Next Step →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
