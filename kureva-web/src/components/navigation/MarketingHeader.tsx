"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";

export default function MarketingHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="mx-auto max-w-6xl w-full px-6 h-16 flex justify-between items-center">
        {/* Logo */}
        <Link 
          href="/" 
          className="text-2xl font-normal tracking-tight text-stone-900 lowercase font-editorial hover:opacity-80 transition-opacity"
        >
          kureva
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-7">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs sm:text-sm font-medium transition-colors ${
                  isActive 
                    ? "text-[#1b7a43] font-semibold" 
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <Link
              href="/dashboard"
              className="text-xs sm:text-sm font-semibold text-stone-900 hover:text-emerald-700 transition-colors flex items-center space-x-1"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs sm:text-sm px-4 py-2 rounded-xl bg-[#1b7a43] hover:bg-[#145d33] text-white font-semibold transition-all shadow-xs"
              >
                Create Wishlist
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stone-200 bg-white px-6 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm py-1.5 transition-colors ${
                    isActive 
                      ? "text-[#1b7a43] font-semibold" 
                      : "text-stone-700 hover:text-stone-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-stone-100 flex flex-col space-y-2.5">
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-semibold text-white bg-[#1b7a43] rounded-xl"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold text-stone-800 bg-stone-100 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold text-white bg-[#1b7a43] rounded-xl shadow-xs"
                >
                  Create Free Wishlist
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
