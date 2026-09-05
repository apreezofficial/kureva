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

  // Bold, impactful manifesto phrases
  const phrases: WordToken[][] = [
    [
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
    ],
    [
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
    ],
    [
      { text: "No" },
      { text: "duplicate", isHighlight: true },
      { text: "gifts.", isHighlight: true },
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
    ],
  ];

  // Flatten words for progressive illumination
  const allWords: { token: WordToken; index: number }[] = [];
  phrases.forEach((phrase) => {
    phrase.forEach((token) => {
      allWords.push({ token, index: allWords.length });
    });
  });

  const totalWords = allWords.length;

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Start illuminating as it scrolls into viewport and finish naturally
      const startPoint = windowHeight * 0.85;
      const endPoint = windowHeight * 0.15;

      const progress = Math.min(
        Math.max((startPoint - rect.top) / (startPoint - endPoint), 0),
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
      className="py-20 md:py-32 px-6 sm:px-10 bg-[#faf8f0] border-y border-stone-200/80 transition-colors"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Center Pill Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#f0eee4] border border-[#e5e2d6] text-stone-800 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-stone-900" />
            <span>Our Purpose</span>
          </div>
        </div>

        {/* Large Bold Editorial Reveal Paragraph */}
        <div className="text-3xl sm:text-5xl md:text-6xl lg:text-[4rem] font-bold font-sans tracking-[-0.03em] leading-[1.12] sm:leading-[1.14] text-stone-900 text-left">
          {allWords.map(({ token, index }) => {
            const wordStart = index / totalWords;
            const isWordActive = scrollProgress >= wordStart;
            const isHighlightActive =
              token.isHighlight && scrollProgress >= (index + 0.2) / totalWords;

            return (
              <span
                key={index}
                className="inline-block mr-[0.26em] mb-[0.06em] select-none"
              >
                <span
                  className={`inline-block px-1 py-0 rounded-[2px] transition-all duration-200 ${
                    isHighlightActive
                      ? "bg-[#d4f932] text-black font-bold"
                      : isWordActive
                      ? "text-stone-950 font-bold opacity-100"
                      : "text-stone-300 font-bold opacity-60"
                  }`}
                >
                  {token.text}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
