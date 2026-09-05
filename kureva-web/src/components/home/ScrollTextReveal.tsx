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

  // Punchy, concise manifesto tokens
  const phrases: WordToken[][] = [
    [
      { text: "We" },
      { text: "believe" },
      { text: "gifting" },
      { text: "should" },
      { text: "be" },
      { text: "thoughtful", isHighlight: true },
      { text: "and" },
      { text: "effortless.", isHighlight: true },
    ],
    [
      { text: "No" },
      { text: "awkward" },
      { text: "texts." },
      { text: "No" },
      { text: "duplicate" },
      { text: "gifts." },
    ],
    [
      { text: "Collect" },
      { text: "what" },
      { text: "you" },
      { text: "love" },
      { text: "from" },
      { text: "any", isHighlight: true },
      { text: "store", isHighlight: true },
      { text: "worldwide." },
    ],
    [
      { text: "Share" },
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

      // Start illuminating when top enters lower half (75%), finish when near top (20%)
      const startPoint = windowHeight * 0.85;
      const endPoint = windowHeight * 0.25;

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
      className="py-20 md:py-32 px-6 bg-[#fbfbf9] border-y border-stone-200/80 transition-colors"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white border border-stone-200 text-stone-700 text-xs font-mono font-medium tracking-wide uppercase shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>The Kureva Manifesto</span>
        </div>

        {/* Large Editorial Reveal Paragraph */}
        <div className="text-3xl sm:text-5xl md:text-6xl font-normal font-editorial tracking-tight leading-[1.28] md:leading-[1.22] text-stone-900">
          {allWords.map(({ token, index }) => {
            const wordStart = index / totalWords;
            const isWordActive = scrollProgress >= wordStart;
            const isHighlightActive =
              token.isHighlight && scrollProgress >= (index + 0.3) / totalWords;

            return (
              <span
                key={index}
                className="inline-block mr-[0.28em] mb-[0.1em] select-none"
              >
                <span
                  className={`inline-block px-1.5 py-0.5 rounded-md transition-all duration-300 ${
                    isHighlightActive
                      ? "bg-[#d4f932] text-stone-950 font-medium scale-102"
                      : isWordActive
                      ? "text-stone-900 font-normal opacity-100"
                      : "text-stone-300 font-normal opacity-50"
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
