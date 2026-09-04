"use client";

import { useState } from "react";
import Link from "next/link";
import MarketingHeader from "@/components/navigation/MarketingHeader";
import MarketingFooter from "@/components/navigation/MarketingFooter";
import { Sparkles, ChevronDown, HelpCircle, Search, ArrowRight, MessageSquare } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: "General" | "Adding Wishes" | "Gifting & Privacy" | "Story Studio";
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [openIndices, setOpenIndices] = useState<number[]>([0, 1]); // first two open by default
  const [searchQuery, setSearchQuery] = useState("");

  const faqs: FAQItem[] = [
    {
      category: "General",
      question: "Is Kureva completely free to use?",
      answer:
        "Yes! Kureva is 100% free for creating wishlists, auto-importing products, sharing registries, downloading high-resolution story graphics, and receiving verified gift claims.",
    },
    {
      category: "General",
      question: "Do my friends need to create an account to buy or claim a gift?",
      answer:
        "No! Guests can browse your public registry, click direct store links, and claim or reserve gifts in one tap without ever creating an account or downloading an app.",
    },
    {
      category: "General",
      question: "How do custom vanity profile links work?",
      answer:
        "When you register an account with a unique username, you get your own public curator page at kureva.pxxl.pro/@yourname where all your public and unlisted collections live in one clean link-in-bio hub.",
    },
    {
      category: "Adding Wishes",
      question: "How does the 1-Click Store Auto-Fill feature work?",
      answer:
        "When adding a wish, simply paste a URL from stores like Jumia, Amazon, Zara, ASOS, or Apple. Our server extracts the product title, image, price, currency, and store name automatically so you don't have to type them manually.",
    },
    {
      category: "Adding Wishes",
      question: "Can I upload my own custom photos and set custom prices?",
      answer:
        "Yes. You can upload custom cover photography, take product photos, manually adjust prices, choose currencies (₦, $, €, £, ¥), and assign priority tags (Most Wanted, Really Loved, Nice To Have).",
    },
    {
      category: "Gifting & Privacy",
      question: "What is Kureva's Anti-Troll Claim Verification protection?",
      answer:
        "To prevent malicious internet visitors from prank-clicking 'I bought this' and locking your wishlist, any unverified guest claim remains open and available to the public. Only when you review the gifter's details in your private dashboard and click 'Verify & Confirm' is the item marked officially received.",
    },
    {
      category: "Gifting & Privacy",
      question: "What privacy options do I have for my wishlists?",
      answer:
        "You can choose between: Private (only you can see when logged in), Shared / Unlisted (anyone with your secret link can view and gift), or Public (visible on your creator profile for everyone).",
    },
    {
      category: "Gifting & Privacy",
      question: "Can gifters leave secret surprise messages?",
      answer:
        "Yes! When a guest claims a gift, they can write a personal note and email. This message is kept private and delivered exclusively to the wishlist creator in their dashboard.",
    },
    {
      category: "Story Studio",
      question: "How does the Story Graphic Studio work?",
      answer:
        "Click 'Share' on any wishlist and tap 'Download Story Graphic (.PNG)'. You can choose between 9:16 Instagram Story and 1:1 Square layouts, pick aesthetic gradient presets like Emerald Silk or Sunset Blush, spotlight individual items, and download a high-res PNG with an embedded scannable QR code.",
    },
    {
      category: "Story Studio",
      question: "Where can I share my generated story graphics?",
      answer:
        "Our graphics are pixel-perfect for WhatsApp Status, Instagram Stories, Instagram Feed, Twitter/X posts, TikTok, Snapchat, and Telegram channels.",
    },
  ];

  const categories = ["All", "General", "Adding Wishes", "Gifting & Privacy", "Story Studio"];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleIndex = (index: number) => {
    if (openIndices.includes(index)) {
      setOpenIndices(openIndices.filter((i) => i !== index));
    } else {
      setOpenIndices([...openIndices, index]);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col justify-between text-stone-800 selection:bg-emerald-100">
      <MarketingHeader />

      <main className="flex-grow">
        {/* Header Hero */}
        <section className="py-20 md:py-28 px-6 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold tracking-wide uppercase">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Got Questions?</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-stone-900 font-editorial leading-[1.1]">
            Frequently Asked Questions
          </h1>

          <p className="text-base sm:text-xl text-stone-600 font-light max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about creating registries, auto-importing store links, story graphics, and verified gifting on Kureva.
          </p>

          {/* Search Bar */}
          <div className="pt-4 max-w-lg mx-auto relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions (e.g., auto-fill, privacy, QR codes)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-stone-200/90 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-xs transition-all"
            />
          </div>
        </section>

        {/* Category Filters */}
        <section className="max-w-4xl mx-auto px-6 pb-8">
          <div className="flex items-center justify-center flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-stone-900 text-white shadow-xs"
                    : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* FAQ Accordion List */}
        <section className="py-6 px-6 max-w-4xl mx-auto pb-24 space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
              <p className="text-stone-500 text-sm">No matching questions found for &quot;{searchQuery}&quot;.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Reset search filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndices.includes(index);
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-white border border-stone-200/80 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() => toggleIndex(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-stone-50/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 pr-4">
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                        {faq.category}
                      </span>
                      <span className="text-sm sm:text-base font-medium text-stone-900 font-editorial">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-emerald-600" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-stone-600 font-light leading-relaxed border-t border-stone-100 animate-in fade-in-50 duration-150">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Need help footer card */}
          <div className="mt-12 p-8 rounded-3xl bg-emerald-950 text-white flex flex-col sm:flex-row justify-between items-center gap-6 shadow-xl">
            <div className="space-y-1.5 text-center sm:text-left">
              <h3 className="text-lg font-medium font-editorial text-white">
                Have a question not listed here?
              </h3>
              <p className="text-xs text-emerald-200 font-light">
                We are always here to help you design and share the best registries.
              </p>
            </div>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-white text-emerald-950 text-xs sm:text-sm font-semibold hover:bg-emerald-50 transition-colors shrink-0 shadow-xs flex items-center space-x-1.5"
            >
              <span>Contact Support</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
