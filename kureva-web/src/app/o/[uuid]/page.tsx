"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { Calendar, MapPin, Gift, Clock, ArrowLeft } from "lucide-react";

export default function PublicOccasionPage({ params }: { params: Promise<{ uuid: string }> }) {
  const resolvedParams = use(params);
  const uuid = resolvedParams.uuid;

  const [occasion, setOccasion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOccasion = async () => {
      try {
        const res = await apiRequest(`/api/occasions/${uuid}`);
        if (res.success && res.data) {
          setOccasion(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load occasion invitation details.");
      } finally {
        setLoading(false);
      }
    };
    fetchOccasion();
  }, [uuid]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-soft">
        <p className="text-sm text-secondary font-light">Opening invitation...</p>
      </div>
    );
  }

  if (error || !occasion) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-soft px-6 text-center">
        <h2 className="text-2xl font-normal text-primary font-editorial mb-2">Invitation Expired</h2>
        <p className="text-sm text-secondary max-w-sm mb-6 font-light">{error || "This occasion could not be loaded."}</p>
        <Link href="/" className="text-xs px-4 py-2 bg-accent text-white rounded font-medium hover:bg-accent-dark">
          Back to Kureva
        </Link>
      </div>
    );
  }

  const daysLeft = occasion.days_until;
  const isUpcoming = daysLeft >= 0;

  return (
    <div className="min-h-screen bg-soft flex flex-col justify-between">
      {/* Cover Backdrop */}
      {occasion.cover_image && (
        <div className="w-full h-48 md:h-72 bg-gray-200 relative overflow-hidden border-b border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={occasion.cover_image} alt="" className="w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-soft/90 to-transparent"></div>
        </div>
      )}

      <main className="flex-grow flex items-center justify-center py-10 px-6">
        <div className="bg-white border border-border rounded-lg shadow-sm p-8 md:p-12 max-w-2xl w-full text-center space-y-8 relative">
          <div className="absolute top-6 left-6">
            <Link
              href="/"
              className="flex items-center space-x-1 text-xs text-secondary hover:text-primary transition-colors border border-border px-2.5 py-1 rounded hover:bg-soft"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>home</span>
            </Link>
          </div>

          <div className="pt-4">
            <span className="text-[11px] tracking-[0.2em] font-semibold text-accent uppercase bg-accent/5 px-3 py-1 rounded-full">
              Invitation
            </span>
          </div>

          {/* Invitation Text */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-normal text-primary font-editorial tracking-tight leading-snug">
              {occasion.name}
            </h1>
            <p className="text-xs text-secondary font-light">
              Hosted by{" "}
              <Link href={`/profile/${occasion.username}`} className="text-accent font-medium hover:underline">
                @{occasion.username}
              </Link>
            </p>
            {occasion.description && (
              <p className="text-sm text-secondary font-light leading-relaxed max-w-lg mx-auto border-t border-b border-border/60 py-6 my-6 italic">
                &ldquo;{occasion.description}&rdquo;
              </p>
            )}
          </div>

          {/* Countdown & Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md mx-auto pt-4 text-left">
            <div className="space-y-3 bg-soft p-4 rounded-lg border border-border/40">
              <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider block">When & Where</span>
              <div className="space-y-2 text-xs text-primary font-medium">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span>
                    {new Date(occasion.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {occasion.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span>{occasion.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 bg-soft p-4 rounded-lg border border-border/40 flex flex-col justify-center text-center">
              {isUpcoming ? (
                <>
                  <span className="text-4xl font-light text-accent font-editorial tracking-tight">{daysLeft}</span>
                  <span className="text-[10px] text-secondary uppercase font-semibold tracking-wider">Days Until Celebration</span>
                </>
              ) : (
                <span className="text-xs font-semibold text-secondary py-3">Occasion Has Passed</span>
              )}
            </div>
          </div>

          {/* Attached Wishlists */}
          {occasion.wishlists && occasion.wishlists.length > 0 && (
            <div className="pt-6 border-t border-border/60">
              <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-4 flex items-center justify-center space-x-1.5">
                <Gift className="w-4 h-4 text-accent" />
                <span>Browse Gift Registries</span>
              </h3>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {occasion.wishlists.map((w: any) => (
                  <Link
                    key={w.uuid}
                    href={`/w/${w.uuid}`}
                    className="flex-grow sm:flex-grow-0 min-w-[200px] border border-border p-4 rounded-lg hover:border-accent hover:shadow-sm text-left transition-all duration-200"
                  >
                    <h4 className="text-sm font-medium text-primary line-clamp-1">{w.name}</h4>
                    <p className="text-[11px] text-secondary mt-1 font-light line-clamp-1">{w.description || "View gift collection"}</p>
                    <span className="text-[10px] text-accent font-semibold block mt-3 hover:underline">Open Registry →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 text-center text-xs text-secondary font-light">
        <Link href="/" className="font-editorial text-primary tracking-widest lowercase mr-1">kureva</Link>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
