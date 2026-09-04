"use client";

import Link from "next/link";
import MarketingHeader from "@/components/navigation/MarketingHeader";
import MarketingFooter from "@/components/navigation/MarketingFooter";
import { Shield, Lock, Eye, CheckCircle2 } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col justify-between text-stone-800 selection:bg-emerald-100">
      <MarketingHeader />

      <main className="flex-grow">
        {/* Header Hero */}
        <section className="py-20 md:py-24 px-6 text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold tracking-wide uppercase">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Transparency & Trust</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-stone-900 font-editorial">
            Privacy Policy
          </h1>

          <p className="text-xs sm:text-sm text-stone-500 font-mono">
            Last Updated: September 2026
          </p>
        </section>

        {/* Content Document */}
        <section className="max-w-3xl mx-auto px-6 pb-24">
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-10 text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
            {/* Overview */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-medium text-stone-900 font-editorial">
                1. Our Commitment to Your Privacy
              </h2>
              <p>
                At Kureva, we believe your wishlist is an intimate expression of what you love and cherish. We respect your privacy, do not sell your personal data to third parties, and will never bombard your registries with intrusive affiliate popups or tracking spam.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-medium text-stone-900 font-editorial">
                2. Information We Collect
              </h2>
              <p>
                We only collect the minimal information necessary to deliver a seamless gifting experience:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 pt-1">
                <li><strong className="font-semibold text-stone-900">Account Information:</strong> Your username, display name, email address, and encrypted password when you register.</li>
                <li><strong className="font-semibold text-stone-900">Wishlist & Registry Data:</strong> Wishlist titles, descriptions, cover images, item titles, prices, merchant store links, and priority flags you create.</li>
                <li><strong className="font-semibold text-stone-900">Guest Claim Information:</strong> When a guest reserves or marks an item as bought, we collect the name, optional email, and personal surprise message they provide so the wishlist owner can verify and thank them.</li>
              </ul>
            </div>

            {/* Anti-Troll & Verification Privacy */}
            <div id="anti-troll" className="space-y-3 p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 text-emerald-950">
              <h3 className="text-base font-semibold font-editorial text-emerald-900 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-700" />
                <span>3. Anti-Troll Protection & Claim Confidentiality</span>
              </h3>
              <p className="text-xs sm:text-sm text-emerald-900/90 leading-relaxed font-light">
                To prevent malicious users from falsely claiming gifts to lock wishlists, unverified guest claims remain open to the public until explicitly confirmed by the wishlist owner. Gifters&apos; email addresses and personal notes are confidential and visible only to the verified wishlist creator in their private dashboard.
              </p>
            </div>

            {/* Visibility Settings */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-medium text-stone-900 font-editorial">
                4. Wishlist Visibility Controls
              </h2>
              <p>
                You retain complete control over who can discover your collections:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 pt-1">
                <li><strong className="font-semibold text-stone-900">Private:</strong> Accessible only to you when logged into your account.</li>
                <li><strong className="font-semibold text-stone-900">Shared / Unlisted:</strong> Accessible to anyone who possesses your unique, unguessable registry URL.</li>
                <li><strong className="font-semibold text-stone-900">Public:</strong> Featured on your public creator profile for friends and followers.</li>
              </ul>
            </div>

            {/* Outbound Store Links */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-medium text-stone-900 font-editorial">
                5. Third-Party Store Links
              </h2>
              <p>
                When you click &quot;Buy at Jumia&quot; or &quot;Buy at Amazon&quot;, you are redirected to the merchant&apos;s external website. Transactions occur entirely between you and the third-party merchant. Kureva does not process credit card transactions or store payment information.
              </p>
            </div>

            {/* Data Security & Retention */}
            <div id="data-security" className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-medium text-stone-900 font-editorial">
                6. Data Security & Your Rights
              </h2>
              <p>
                All network communications are encrypted via HTTPS. You have the right at any time to edit, archive, or permanently delete your wishlists and account data directly from your dashboard settings.
              </p>
            </div>

            {/* Contact */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <h2 className="text-xl sm:text-2xl font-medium text-stone-900 font-editorial">
                7. Questions About Our Privacy Policy
              </h2>
              <p>
                If you have questions regarding this policy or your personal data, please contact our privacy team at{" "}
                <Link href="/contact" className="text-emerald-700 font-medium underline">
                  privacy@kureva.com
                </Link>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
