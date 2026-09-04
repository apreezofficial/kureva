"use client";

import Link from "next/link";
import MarketingHeader from "@/components/navigation/MarketingHeader";
import MarketingFooter from "@/components/navigation/MarketingFooter";
import { FileText, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col justify-between text-stone-800 selection:bg-emerald-100">
      <MarketingHeader />

      <main className="flex-grow">
        {/* Header Hero */}
        <section className="py-20 md:py-24 px-6 text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold tracking-wide uppercase">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Service Agreement</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-stone-900 font-editorial">
            Terms of Service
          </h1>

          <p className="text-xs sm:text-sm text-stone-500 font-mono">
            Last Updated: September 2026
          </p>
        </section>

        {/* Content Document */}
        <section className="max-w-3xl mx-auto px-6 pb-24">
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-10 text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
            {/* Acceptance */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-medium text-stone-900 font-editorial">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using Kureva (&quot;the Service&quot;), creating an account, publishing a wishlist, or claiming a gift as a guest, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
            </div>

            {/* Account Responsibilities */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-medium text-stone-900 font-editorial">
                2. User Accounts & Authenticity
              </h2>
              <p>
                When creating an account, you agree to provide accurate and truthful information. You are responsible for safeguarding your credentials and for all activities that occur under your account. You must not impersonate other individuals or entities.
              </p>
            </div>

            {/* Acceptable Use */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-medium text-stone-900 font-editorial">
                3. Acceptable Use & Registry Conduct
              </h2>
              <p>
                You agree not to use Kureva to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 pt-1">
                <li>Submit fraudulent, abusive, or malicious links or content.</li>
                <li>Prank, harass, or submit false gift reservations intended to disrupt another user&apos;s registry.</li>
                <li>Attempt to scrape or harvest private user information without permission.</li>
                <li>Violate any applicable local, national, or international laws.</li>
              </ul>
            </div>

            {/* Merchant Stores */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-medium text-stone-900 font-editorial">
                4. External Merchant Transactions & Disclaimers
              </h2>
              <p>
                Kureva provides tools to curate links and display public registries. We do not sell, ship, or guarantee products listed by external merchants (e.g. Jumia, Amazon, Zara). Any purchases are made directly with the merchant under their respective shipping and return policies.
              </p>
            </div>

            {/* User Content */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-medium text-stone-900 font-editorial">
                5. Intellectual Property & User Content
              </h2>
              <p>
                You retain full ownership of all images, notes, and collections you post to Kureva. By posting, you grant Kureva a non-exclusive license to display and generate story graphics for your lists as directed by your visibility settings.
              </p>
            </div>

            {/* Termination */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-medium text-stone-900 font-editorial">
                6. Termination & Account Deletion
              </h2>
              <p>
                You may delete your account and all associated registries at any time from your settings. We reserve the right to suspend or terminate accounts that violate our community conduct or security guidelines.
              </p>
            </div>

            {/* Contact */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <h2 className="text-xl sm:text-2xl font-medium text-stone-900 font-editorial">
                7. Contact Us
              </h2>
              <p>
                If you have any questions regarding these terms, please contact our support team at{" "}
                <Link href="/contact" className="text-emerald-700 font-medium underline">
                  legal@kureva.com
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
