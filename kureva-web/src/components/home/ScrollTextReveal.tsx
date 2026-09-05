"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

interface WordToken {
  text: string;
  isHighlight?: boolean;
  highlightClass?: string;
}

export default function ScrollTextReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Content tokens designed for Kureva
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
      { text: "group" },
      { text: "chats." },
      { text: "No" },
      { text: "duplicate" },
      { text: "gifts." },
    ],
    [
      { text: "Our" },
      { text: "goal" },
      { text: "is" },
      { text: "to" },
      { text: "give" },
      { text: "you" },
      { text: "complete", isHighlight: true },
      { text: "freedom", isHighlight: true },
      { text: "to" },
      { text: "collect" },
      { text: "the" },
      { text: "things" },
      { text: "you" },
      { text: "love" },
      { text: "from" },
      { text: "any" },
      { text: "store." },
    ],
    [
      { text: "Curate" },
      { text: "with" },
      { text: "quiet" },
      { text: "dignity." },
      { text: "Receive", isHighlight: true },
      { text: "what", isHighlight: true },
      { text: "you", isHighlight: true },
      { text: "cherish.", isHighlight: true },
    ],
  ];

  // Flatten words to assign sequential threshold ranges
  const allWords: { token: WordToken; index: number }[] = [];
  phrases.forEach((phrase) => {
    phrase.forEach((token) => {
      allWords.push({ token, index: allWords.length });
    });
  });

  const totalWords = allWords.length;

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Start calculating when container enters the middle of the screen
      const totalScrollable = rect.height - windowHeight;
      if (totalScrollable <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.min(Math.max(currentScroll / totalScrollable, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[160vh] md:min-h-[190vh] bg-[#fbfbf9] px-6">
      {/* Sticky centered viewport container */}
      <div className="sticky top-20 md:top-28 max-w-5xl mx-auto py-12 md:py-20 flex flex-col justify-center min-h-[60vh]">
        <div className="space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-mono font-medium tracking-wide uppercase w-fit">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>The Kureva Manifesto</span>
          </div>

          {/* Large Editorial Reveal Paragraph */}
          <div className="text-3xl sm:text-5xl md:text-6xl font-normal font-editorial tracking-tight leading-[1.28] md:leading-[1.24] text-stone-900">
            {allWords.map(({ token, index }) => {
              // Word activation progress
              const wordStart = index / totalWords;
              const wordEnd = (index + 1) / totalWords;
              const isWordActive = scrollProgress >= wordStart;

              // Highlighter activation progress (slightly delayed for tactile effect)
              const isHighlightActive =
                token.isHighlight && scrollProgress >= (index + 0.5) / totalWords;

              return (
                <span
                  key={index}
                  className="inline-block mr-[0.28em] mb-[0.1em] transition-all duration-300 select-none"
                >
                  <span
                    className={`inline-block px-1 py-0.5 rounded-md transition-all duration-300 ${
                      isHighlightActive
                        ? "bg-[#d4f932] text-stone-950 font-medium shadow-2xs scale-102"
                        : isWordActive
                        ? "text-stone-900 font-normal"
                        : "text-stone-300/80 font-normal"
                    }`}
                  >
                    {token.text}
                  </span>
                </span>
              );
            })}
          </div>

          {/* Subtle scroll indicator guide */}
          <div className="pt-6 flex items-center space-x-3 text-xs font-mono text-stone-400">
            <div className="w-24 h-1 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-100"
                style={{ width: `${Math.round(scrollProgress * 100)}%` }}
              />
            </div>
            <span>Scroll to read • {Math.round(scrollProgress * 100)}%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
