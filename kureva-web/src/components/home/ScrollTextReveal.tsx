"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

interface WordToken {
  text: string;
  isHighlight?: boolean;
}

export default function ScrollTextReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Carefully structured tokens for wide 3-line layout
  const words: WordToken[] = [
    { text: "We" },
    { text: "believe" },
    { text: "gifting", isHighlight: true },
    { text: "should", isHighlight: true },
    { text: "be", isHighlight: true },
    { text: "thoughtful", isHighlight: true },
    { text: "and" },
    { text: "stand" },
    { text: "up" },
    { text: "for" },
    { text: "what's" },
    { text: "right." },
    { text: "Our" },
    { text: "goal" },
    { text: "is" },
    { text: "to" },
    { text: "provide" },
    { text: "complete", isHighlight: true },
    { text: "freedom", isHighlight: true },
    { text: "to" },
    { text: "collect" },
    { text: "what" },
    { text: "you" },
    { text: "love" },
    { text: "from" },
    { text: "any" },
    { text: "store." },
    { text: "No" },
    { text: "duplicate" },
    { text: "gifts." },
    { text: "No" },
    { text: "awkward" },
    { text: "guessing." },
    { text: "Curate" },
    { text: "with" },
    { text: "dignity." },
    { text: "Receive", isHighlight: true },
    { text: "what", isHighlight: true },
    { text: "you", isHighlight: true },
    { text: "cherish.", isHighlight: true },
  ];

  const totalWords = words.length;

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Extended, slower scroll distance: spans across full height of section
      const totalScrollableDistance = rect.height + windowHeight * 0.4;
      const scrolled = windowHeight * 0.85 - rect.top;

      const progress = Math.min(
        Math.max(scrolled / totalScrollableDistance, 0),
        1
      );
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="relative py-32 md:py-48 px-6 sm:px-12 md:px-16 lg:px-20 bg-[#faf8f0] overflow-hidden"
    >
      {/* Animated Top Border Line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#1b7a43]/40 to-transparent transition-opacity duration-500" />

      {/* Subtle Ambient Background Glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-700"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 50%, rgba(27, 122, 67, ${0.03 + scrollProgress * 0.05}), transparent)`
        }}
      />

      <div className="relative w-full max-w-7xl mx-auto space-y-12">
        {/* Top Center Pill Badge with Animated Glow Border */}
        <div className="flex justify-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/90 border border-emerald-700/20 text-emerald-900 text-xs font-semibold tracking-wide shadow-xs ring-2 ring-[#1b7a43]/10 transition-all duration-300 hover:ring-[#1b7a43]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#1b7a43] animate-spin-slow" />
            <span>Our Purpose</span>
          </div>
        </div>

        {/* Full-Width Bold Editorial Paragraph */}
        <div className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[4.5rem] font-semibold font-sans tracking-[-0.025em] leading-[1.14] md:leading-[1.16] text-left">
          {words.map((word, index) => {
            const wordStart = index / totalWords;
            const isWordActive = scrollProgress >= wordStart;
            const isHighlightActive =
              word.isHighlight && scrollProgress >= (index + 0.2) / totalWords;

            return (
              <span
                key={index}
                className="inline-block mr-[0.24em] mb-[0.06em] select-none"
              >
                <span
                  className={`inline-block px-1.5 py-0.5 rounded-md border transition-all duration-500 ease-out ${
                    isHighlightActive
                      ? "bg-[#a7f3d0] text-[#064e3b] font-semibold border-emerald-400/50 shadow-xs scale-102"
                      : isWordActive
                      ? "text-stone-950 font-semibold border-transparent opacity-100"
                      : "text-stone-400 font-semibold border-transparent opacity-25"
                  }`}
                >
                  {word.text}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Animated Bottom Border Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#1b7a43]/40 to-transparent transition-opacity duration-500" />
    </section>
  );
}
