"use client";

import { useEffect, useState, use } from "react";
import Link from "next/view-transitions" // wait, standard Link is fine
import NextLink from "next/link";
import { apiRequest } from "@/lib/api";
import { Gift, Calendar, ArrowLeft, ArrowRight, User } from "lucide-react";

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const rawUsername = resolvedParams.username;
  
  // Clean username if it contains '@' (e.g. %40sarah or @sarah)
  const decodedUsername = decodeURIComponent(rawUsername);
  const username = decodedUsername.startsWith("@") ? decodedUsername.substring(1) : decodedUsername;

  const [profile, setProfile] = useState<any>(null);
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [occasions, setOccasions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiRequest(`/api/users/${username}`);
        if (res.success && res.data) {
          setProfile(res.data.profile);
          setWishlists(res.data.wishlists || []);
          setOccasions(res.data.occasions || []);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-soft">
        <p className="text-sm text-secondary font-light">Opening profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-soft px-6 text-center">
        <h2 className="text-2xl font-normal text-primary font-editorial mb-2">Profile Not Found</h2>
        <p className="text-sm text-secondary max-w-sm mb-6 font-light">{error || "This user profile does not exist."}</p>
        <NextLink href="/" className="text-xs px-4 py-2 bg-accent text-white rounded font-medium hover:bg-accent-dark">
          Back to Kureva
        </NextLink>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16 flex flex-col justify-between">
      <div>
        <header className="border-b border-border bg-soft/50 py-4 px-6">
          <div className="mx-auto max-w-4xl flex justify-between items-center">
            <NextLink href="/" className="text-lg font-medium tracking-widest text-primary lowercase font-editorial">
              kureva
            </NextLink>
            <NextLink href="/login" className="text-xs text-secondary hover:text-primary transition-colors">
              Own a wishlist? Sign In
            </NextLink>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-6 py-12">
          {/* Profile Card Header */}
          <div className="flex flex-col items-center text-center pb-8 border-b border-border mb-12">
            <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center border border-accent/10 mb-4 shadow-sm">
              <User className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-2xl font-semibold text-primary">{profile.name}</h1>
            <span className="text-xs text-secondary mt-1 tracking-wide font-medium">@{profile.username}</span>
            {profile.bio && (
              <p className="text-sm text-secondary max-w-md mt-4 font-light leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Wishlists Column */}
            <div className="md:col-span-2 space-y-6">
              <h2 className="text-xs font-semibold tracking-wider text-secondary uppercase flex items-center space-x-2 border-b border-border/60 pb-2">
                <Gift className="w-4 h-4 text-accent" />
                <span>Public Wishlists</span>
              </h2>

              {wishlists.length === 0 ? (
                <p className="text-xs text-secondary font-light italic">No public wishlists listed.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlists.map((w) => (
                    <NextLink
                      key={w.uuid}
                      href={`/w/${w.uuid}`}
                      className="group border border-border rounded-lg p-5 hover:border-accent transition-all duration-200 bg-white"
                    >
                      <h3 className="font-medium text-primary text-base group-hover:text-accent transition-colors leading-snug">
                        {w.name}
                      </h3>
                      {w.description && (
                        <p className="text-xs text-secondary mt-1.5 line-clamp-2 font-light leading-relaxed">
                          {w.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-4 text-[10px] text-secondary font-light">
                        <span>{w.items_count || 0} wishes</span>
                        <span className="text-accent font-semibold group-hover:underline">View wishes →</span>
                      </div>
                    </NextLink>
                  ))}
                </div>
              )}
            </div>

            {/* Occasions Column */}
            <div className="space-y-6">
              <h2 className="text-xs font-semibold tracking-wider text-secondary uppercase flex items-center space-x-2 border-b border-border/60 pb-2">
                <Calendar className="w-4 h-4 text-accent" />
                <span>Public Occasions</span>
              </h2>

              {occasions.length === 0 ? (
                <p className="text-xs text-secondary font-light italic">No public celebrations scheduled.</p>
              ) : (
                <div className="space-y-4">
                  {occasions.map((o) => {
                    const daysLeft = o.days_until;
                    const isUpcoming = daysLeft >= 0;

                    return (
                      <NextLink
                        key={o.uuid}
                        href={`/o/${o.uuid}`}
                        className="block border border-border rounded-lg p-4 hover:border-accent transition-colors bg-white"
                      >
                        <h3 className="font-medium text-primary text-sm line-clamp-1">{o.name}</h3>
                        <p className="text-[10px] text-secondary mt-0.5 font-light">
                          {new Date(o.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        <div className="mt-3 text-right">
                          {isUpcoming ? (
                            <span className="text-[10px] font-semibold text-accent bg-accent/5 px-2 py-0.5 rounded-full">
                              {daysLeft === 0 ? "Today" : `${daysLeft} days left`}
                            </span>
                          ) : (
                            <span className="text-[10px] text-secondary bg-soft px-2 py-0.5 rounded-full">Passed</span>
                          )}
                        </div>
                      </NextLink>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <footer className="py-8 text-center text-xs text-secondary font-light border-t border-border/40 mt-16 bg-soft/20">
        <NextLink href="/" className="font-editorial text-primary tracking-widest lowercase mr-1">kureva</NextLink>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
