"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import Navbar from "@/components/navigation/Navbar";
import MobileNav from "@/components/navigation/MobileNav";
import { Plus, X, Calendar, MapPin, Share2, Globe, EyeOff, Link2, Check } from "lucide-react";

export default function OccasionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [occasions, setOccasions] = useState<any[]>([]);
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Creation modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("birthday");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [selectedWishlists, setSelectedWishlists] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [copiedUuid, setCopiedUuid] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const resO = await apiRequest("/api/occasions");
      const resW = await apiRequest("/api/wishlists");
      if (resO.success) setOccasions(resO.data || []);
      if (resW.success) setWishlists(resW.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [user, authLoading, router]);

  const handleCopyLink = (uuid: string) => {
    const url = `${window.location.origin}/o/${uuid}`;
    navigator.clipboard.writeText(url);
    setCopiedUuid(uuid);
    setTimeout(() => setCopiedUuid(null), 2000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await apiRequest("/api/occasions", {
        method: "POST",
        data: {
          name,
          type,
          date,
          description,
          location,
          cover_image: coverImage,
          visibility,
          wishlist_ids: selectedWishlists,
        },
      });

      if (res.success) {
        setIsModalOpen(false);
        // reset form
        setName("");
        setType("birthday");
        setDate("");
        setDescription("");
        setLocation("");
        setCoverImage("");
        setVisibility("private");
        setSelectedWishlists([]);
        fetchData();
      }
    } catch (err) {
      alert("Failed to create occasion");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (uuid: string) => {
    if (!confirm("Are you sure you want to remove this occasion?")) return;
    try {
      await apiRequest(`/api/occasions/${uuid}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      alert("Failed to delete occasion");
    }
  };

  const toggleWishlistSelection = (uuid: string) => {
    if (selectedWishlists.includes(uuid)) {
      setSelectedWishlists(selectedWishlists.filter((id) => id !== uuid));
    } else {
      setSelectedWishlists([...selectedWishlists, uuid]);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-8 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-normal text-primary tracking-tight font-editorial">
                Your Occasions
              </h1>
              <p className="text-xs text-secondary mt-1 tracking-wide">
                Track anniversaries, birthdays, or weddings and invite friends.
              </p>
            </div>
            <Link
              href="/dashboard/occasions/new"
              className="flex items-center space-x-1.5 px-4 py-2 bg-accent text-white rounded text-sm hover:bg-accent-dark transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Create Occasion</span>
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-secondary">Loading occasions...</p>
          ) : occasions.length === 0 ? (
            <div className="border border-dashed border-border rounded-lg p-12 text-center bg-soft max-w-md mx-auto mt-12">
              <Calendar className="w-8 h-8 text-secondary/40 mx-auto mb-4" />
              <h3 className="font-medium text-primary text-base mb-1">No occasions yet</h3>
              <p className="text-xs text-secondary mb-6 leading-relaxed font-light">
                Birthdays, weddings, little celebrations — keep them all in one place and share associated wishlists.
              </p>
              <Link
                href="/dashboard/occasions/new"
                className="px-6 py-2 bg-accent text-white rounded text-sm hover:bg-accent-dark transition-colors font-medium inline-block"
              >
                Create an occasion
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {occasions.map((o) => {
                const daysLeft = o.days_until;
                const isUpcoming = daysLeft >= 0;
                
                return (
                  <div
                    key={o.uuid}
                    className="border border-border rounded-lg p-6 bg-white flex flex-col md:flex-row justify-between gap-6 hover:border-accent transition-all duration-200"
                  >
                    <div className="flex-grow space-y-3">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-[11px] font-semibold tracking-wider text-secondary uppercase flex items-center space-x-1.5">
                          {o.visibility === "public" ? (
                            <>
                              <Globe className="w-3.5 h-3.5 text-accent" />
                              <span>Public</span>
                            </>
                          ) : o.visibility === "unlisted" ? (
                            <>
                              <Link2 className="w-3.5 h-3.5 text-blue-500" />
                              <span>Unlisted</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                              <span>Private</span>
                            </>
                          )}
                        </span>
                        <span className="text-[11px] text-secondary">•</span>
                        <span className="text-[11px] text-secondary capitalize font-medium">{o.type}</span>
                      </div>
                      
                      <div>
                        <h2 className="text-xl font-medium text-primary leading-snug">{o.name}</h2>
                        {o.description && (
                          <p className="text-xs text-secondary mt-1 font-light leading-relaxed max-w-xl">
                            {o.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-secondary font-light pt-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(o.date).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}</span>
                        </div>
                        {o.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{o.location}</span>
                          </div>
                        )}
                      </div>

                      {o.wishlists && o.wishlists.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mb-1.5">Attached Wishlists:</span>
                          <div className="flex flex-wrap gap-2">
                            {o.wishlists.map((w: any) => (
                              <Link
                                key={w.uuid}
                                href={`/dashboard/wishlists/${w.uuid}`}
                                className="text-xs px-2.5 py-1 bg-soft hover:bg-border rounded border border-border/50 text-primary font-medium transition-colors"
                              >
                                {w.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col justify-between md:justify-center md:items-end gap-4 min-w-[140px] border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                      <div className="text-left md:text-right">
                        {isUpcoming ? (
                          <>
                            <span className="text-3xl font-light text-accent font-editorial">{daysLeft}</span>
                            <span className="text-xs text-secondary block font-light">days remaining</span>
                          </>
                        ) : (
                          <span className="text-xs text-secondary bg-soft px-3 py-1 rounded-full font-medium">Occasion passed</span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCopyLink(o.uuid)}
                          className="p-2 border border-border rounded text-secondary hover:text-primary hover:bg-soft transition-colors"
                          title="Copy invitation link"
                        >
                          {copiedUuid === o.uuid ? <Check className="w-4 h-4 text-accent" /> : <Share2 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(o.uuid)}
                          className="p-2 border border-border text-red-500 rounded hover:bg-red-50 hover:border-red-100 transition-colors"
                          title="Delete occasion"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}


        </main>
      </div>

      <MobileNav />
    </div>
  );
}
