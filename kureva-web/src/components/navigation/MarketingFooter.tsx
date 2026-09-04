"use client";

import Link from "next/link";
import { Sparkles, Heart, ArrowUpRight } from "lucide-react";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-stone-200/90 bg-stone-50/80 text-stone-600">
      {/* Main Footer Links */}
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand & Mission Column */}
          <div className="md:col-span-2 space-y-4">
            <Link 
              href="/" 
              className="text-2xl font-normal tracking-tight text-stone-900 lowercase font-editorial inline-block hover:opacity-80 transition-opacity"
            >
              kureva
            </Link>
            <p className="text-xs sm:text-sm text-stone-500 font-light leading-relaxed max-w-sm">
              Understated wishlist curation, automated store link parsing, aesthetic story card design, and verified gift registries for the moments that matter.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs text-stone-400 font-mono">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>for thoughtful gifters</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 font-sans">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-light">
              <li>
                <Link href="/how-it-works" className="hover:text-stone-900 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-stone-900 transition-colors">
                  Create Wishlist
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#story-studio" className="hover:text-stone-900 transition-colors">
                  Story Card Studio
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#link-parser" className="hover:text-stone-900 transition-colors">
                  Link Auto-Fill
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#verification" className="hover:text-stone-900 transition-colors">
                  Gift Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 font-sans">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-light">
              <li>
                <Link href="/about" className="hover:text-stone-900 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-stone-900 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-stone-900 transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/about#philosophy" className="hover:text-stone-900 transition-colors">
                  Design Philosophy
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 font-sans">
              Legal & Trust
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-light">
              <li>
                <Link href="/privacy" className="hover:text-stone-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-stone-900 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy#anti-troll" className="hover:text-stone-900 transition-colors">
                  Anti-Troll Protection
                </Link>
              </li>
              <li>
                <Link href="/privacy#data-security" className="hover:text-stone-900 transition-colors">
                  Data Security
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Philosophy Bar */}
      <div className="border-t border-stone-200/80 bg-stone-100/70 py-6 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 gap-3">
          <div className="flex items-center space-x-4 font-mono text-[11px] text-stone-500">
            <span>KANSO (Simplicity)</span>
            <span>•</span>
            <span>MA (Space)</span>
            <span>•</span>
            <span>SHIBUI (Subtle Beauty)</span>
          </div>

          <div className="text-[12px] text-stone-500">
            © {new Date().getFullYear()} Kureva. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
