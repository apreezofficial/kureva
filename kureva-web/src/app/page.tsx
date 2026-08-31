"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ArrowRight, Gift, Calendar, Heart, Share2 } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="mx-auto max-w-5xl w-full px-6 py-6 flex justify-between items-center">
        <div className="text-xl font-medium tracking-widest text-primary lowercase font-editorial">
          kureva
        </div>
        <div className="flex items-center space-x-6">
          {user ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-primary hover:text-accent transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-secondary hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm px-4 py-1.5 rounded-full bg-accent text-white font-medium hover:bg-accent-dark transition-colors"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center items-center px-6 py-12 md:py-24 text-center max-w-3xl mx-auto">
        <span className="text-[11px] tracking-[0.2em] font-semibold text-accent uppercase bg-accent/5 px-3 py-1 rounded-full mb-6">
          Your little collection
        </span>
        <h1 className="text-4xl md:text-6xl font-normal tracking-tight text-primary font-editorial mb-6 leading-tight">
          Wish for it. Share it.<br />Make it yours.
        </h1>
        <p className="text-base md:text-lg text-secondary max-w-xl mb-10 leading-relaxed font-light">
          Kureva makes it easy to collect the things you love, organize your wishes, and share them with the people who matter.
        </p>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-16">
          <Link
            href={user ? "/dashboard/wishlists" : "/register"}
            className="flex items-center justify-center space-x-2 px-8 py-3 rounded-md bg-accent text-white font-medium hover:bg-accent-dark transition-all duration-200 hover:shadow-sm"
          >
            <span>Create your wishlist</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center px-8 py-3 rounded-md border border-border text-primary font-medium hover:bg-soft transition-colors"
          >
            Explore Kureva
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left w-full max-w-5xl mt-8 pt-12 border-t border-border">
          <div>
            <div className="flex items-center space-x-2 text-accent mb-3">
              <Gift className="w-5 h-5" />
              <h3 className="font-medium text-primary text-base">Collect anything</h3>
            </div>
            <p className="text-sm text-secondary leading-relaxed font-light">
              Add products manually or instantly extract images and prices directly from Jumia, Amazon, or Shopify links.
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2 text-accent mb-3">
              <Share2 className="w-5 h-5" />
              <h3 className="font-medium text-primary text-base">Share beautifully</h3>
            </div>
            <p className="text-sm text-secondary leading-relaxed font-light">
              Generate custom profile URLs or share unlisted pages for birthdays, weddings, or quick registry lists.
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2 text-accent mb-3">
              <Calendar className="w-5 h-5" />
              <h3 className="font-medium text-primary text-base">Mark occasions</h3>
            </div>
            <p className="text-sm text-secondary leading-relaxed font-light">
              Add countdown timers, locations, and attach multiple wishlists to design digital invitations for your guests.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-soft py-10 px-6 mt-12">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row justify-between items-center text-sm text-secondary">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="font-editorial text-primary font-medium lowercase tracking-widest">kureva</span>
            <span>— Understated wishlist curation.</span>
          </div>
          <div className="flex space-x-6 text-[13px]">
            <span>Kanso (Simplicity)</span>
            <span>Ma (Space)</span>
            <span>Shibui (Beauty)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
