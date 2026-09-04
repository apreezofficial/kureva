"use client";

import { useState } from "react";
import Link from "next/link";
import MarketingHeader from "@/components/navigation/MarketingHeader";
import MarketingFooter from "@/components/navigation/MarketingFooter";
import { Sparkles, Mail, MessageSquare, Send, CheckCircle2, Heart, HelpCircle } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Question");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate short submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col justify-between text-stone-800 selection:bg-emerald-100">
      <MarketingHeader />

      <main className="flex-grow">
        {/* Header Hero */}
        <section className="py-20 md:py-24 px-6 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold tracking-wide uppercase">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>We&apos;d Love to Hear from You</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-stone-900 font-editorial leading-[1.1]">
            Contact & Support
          </h1>

          <p className="text-base sm:text-xl text-stone-600 font-light max-w-2xl mx-auto leading-relaxed">
            Have a question, feedback, feature idea, or need help with a wishlist? Send us a note and we will get back to you promptly.
          </p>
        </section>

        {/* Contact Content Grid */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            {/* Left Info Panel */}
            <div className="md:col-span-5 space-y-6">
              <div className="p-8 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-700">
                    Direct Contact
                  </span>
                  <h3 className="text-xl font-medium text-stone-900 font-editorial">
                    Talk directly to our team.
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 font-light leading-relaxed">
                    We read and respond to every message personally. No automated phone trees or robotic replies.
                  </p>
                </div>

                <div className="space-y-4 pt-2 border-t border-stone-100 text-xs sm:text-sm">
                  <div className="flex items-center space-x-3 text-stone-700">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-stone-900">Email Inquiries</div>
                      <div className="text-stone-500 font-mono text-xs">support@kureva.com</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-stone-700">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-stone-900">Knowledge Base</div>
                      <Link href="/faq" className="text-emerald-700 hover:underline text-xs">
                        Browse our FAQ →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creator Card */}
              <div className="p-7 rounded-3xl bg-stone-900 text-white space-y-3 shadow-md">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Curator Community</span>
                </div>
                <h4 className="text-base font-medium font-editorial">
                  Building a wedding, bridal shower, or influencer wishlist?
                </h4>
                <p className="text-xs text-stone-300 font-light leading-relaxed">
                  Reach out for custom branding, high-resolution story presets, or VIP assistance.
                </p>
              </div>
            </div>

            {/* Right Form Panel */}
            <div className="md:col-span-7">
              <div className="p-8 sm:p-10 rounded-3xl bg-white border border-stone-200/80 shadow-sm">
                {submitted ? (
                  <div className="text-center py-12 space-y-4 animate-in fade-in-50 duration-300">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-medium font-editorial text-stone-900">
                      Message received!
                    </h3>
                    <p className="text-sm text-stone-600 font-light max-w-sm mx-auto leading-relaxed">
                      Thank you for reaching out, <span className="font-semibold text-stone-900">{name}</span>. Our team will review your message and reply to <span className="font-semibold text-stone-900">{email}</span> within 24 hours.
                    </p>
                    <div className="pt-4">
                      <button
                        onClick={() => {
                          setSubmitted(false);
                          setName("");
                          setEmail("");
                          setSubject("");
                          setMessage("");
                        }}
                        className="px-6 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                      >
                        Send another message
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-medium text-stone-900 font-editorial">
                        Send us a message
                      </h3>
                      <p className="text-xs text-stone-500 font-light">
                        Fill out the form below and we will get back to you quickly.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Maya Lin"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-stone-50/60 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-stone-50/60 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                          Category
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-stone-50/60 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-stone-800"
                        >
                          <option value="Question">General Question</option>
                          <option value="Feature">Feature Idea</option>
                          <option value="Bug">Report an Issue</option>
                          <option value="Partnership">Creator Partnership</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                          Subject *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="What is this regarding?"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-stone-50/60 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                        Message *
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell us how we can help..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-stone-50/60 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all resize-none"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-[#1b7a43] hover:bg-[#145d33] text-white font-semibold rounded-xl text-sm shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-98 disabled:opacity-70"
                      >
                        <Send className="w-4 h-4" />
                        <span>{loading ? "Sending message..." : "Send Message"}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
