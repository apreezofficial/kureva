"use client";

import { useEffect, useRef, useState } from "react";

interface WordToken {
  text: string;
  isHighlight?: boolean;
}

export default function ScrollTextReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Carefully balanced tokens for 3 wide, cinematic lines
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

      // Start calculating when the section enters the bottom 80% of screen,
      // and finish by the time the section is at 20% from the top
      const startPoint = windowHeight * 0.85;
      const endPoint = windowHeight * 0.2;

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
      className="py-24 md:py-36 px-6 sm:px-12 md:px-16 lg:px-20 bg-[#faf8f0] border-y border-stone-200/80"
    >
      <div className="w-full max-w-7xl mx-auto space-y-10">
        {/* Top Center Pill Badge */}
        <div className="flex justify-center">
          <span className="px-4 py-1.5 rounded-full bg-[#f0eee4] text-stone-800 text-xs font-semibold tracking-wide">
            Impact
          </span>
        </div>

        {/* Full-Width Bold Editorial Paragraph */}
        <div className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[4.5rem] font-semibold font-sans tracking-[-0.025em] leading-[1.12] md:leading-[1.15] text-left">
          {words.map((word, index) => {
            const wordStart = index / totalWords;
            const isWordActive = scrollProgress >= wordStart;
            const isHighlightActive =
              word.isHighlight && scrollProgress >= (index + 0.3) / totalWords;

            return (
              <span
                key={index}
                className="inline-block mr-[0.24em] mb-[0.06em] select-none"
              >
                <span
                  className={`inline-block px-1.5 py-0.5 rounded-[3px] transition-all duration-200 ${
                    isHighlightActive
                      ? "bg-[#d4f932] text-stone-950 font-semibold opacity-100"
                      : isWordActive
                      ? "text-stone-950 font-semibold opacity-100"
                      : "text-stone-400 font-semibold opacity-30"
                  }`}
                >
                  {word.text}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
