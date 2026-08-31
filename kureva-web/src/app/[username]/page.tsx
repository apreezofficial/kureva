"use client";

import { useEffect, useState, use } from "react";
import Link, { default as NextLink } from "next/link";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiRequest(`/api/users/${username}`);
        if (res.success && res.data) {
          setProfile(res.data.profile);
          setWishlists(res.data.wishlists || []);
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
      <div className="min-h-screen bg-[#fafaf9] flex flex-col justify-between">
        <div>
          <div className="mx-auto max-w-5xl px-6 py-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse mb-4"></div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-6"></div>
            <div className="h-10 w-full max-w-lg bg-gray-100/50 rounded-lg animate-pulse mb-12"></div>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="h-40 bg-white border border-border/60 rounded-lg animate-pulse"></div>
              <div className="h-40 bg-white border border-border/60 rounded-lg animate-pulse"></div>
              <div className="h-40 bg-white border border-border/60 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
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

          <div className="space-y-6">
            <h2 className="text-xs font-semibold tracking-wider text-secondary uppercase flex items-center space-x-2 border-b border-border/60 pb-2">
              <Gift className="w-4 h-4 text-accent" />
              <span>Public Wishlists</span>
            </h2>

            {wishlists.length === 0 ? (
              <p className="text-xs text-secondary font-light italic">No public wishlists listed.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
        </main>
      </div>

      <footer className="py-8 text-center text-xs text-secondary font-light border-t border-border/40 mt-16 bg-soft/20">
        <NextLink href="/" className="font-editorial text-primary tracking-widest lowercase mr-1">kureva</NextLink>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
