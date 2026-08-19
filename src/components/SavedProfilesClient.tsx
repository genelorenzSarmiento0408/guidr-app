"use client";

import type { Profile } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TopNavbar from "./TopNavbar";
import Footer from "./Footer";

interface SavedProfilesClientProps {
  initialProfiles: Profile[];
  currentUserId: string;
  currentUserProfile: {
    id: string;
    username: string;
    photo_url?: string | null;
  } | null;
}

export default function SavedProfilesClient({
  initialProfiles,
  currentUserId,
  currentUserProfile,
}: SavedProfilesClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [profiles, setProfiles] = useState(initialProfiles);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const shortSummary = (profile: Profile) => {
    const details = profile as Profile & {
      headline?: string | null;
      bio?: string | null;
    };
    const source = details.headline || details.bio || profile.skills || "";
    if (!source.trim()) return "Connect for mentoring and collaboration.";
    return source.length > 88 ? `${source.slice(0, 85).trim()}...` : source;
  };

  const handleRemoveSavedProfile = async (savedProfileId: string) => {
    setRemovingId(savedProfileId);

    const { error } = await supabase
      .from("saved_profiles")
      .delete()
      .eq("user_id", currentUserId)
      .eq("saved_profile_id", savedProfileId);

    if (!error) {
      setProfiles((prev) =>
        prev.filter((profile) => profile.id !== savedProfileId),
      );
      router.refresh();
    }

    setRemovingId(null);
  };

  return (
    <div className="min-h-screen bg-black">
      <TopNavbar
        currentUserId={currentUserId}
        currentUserProfile={currentUserProfile}
      />

      <div className="pt-27 sm:pt-28 max-w-360 mx-auto px-4 sm:px-8 lg:px-11 pb-15 sm:pb-18">
        <Link
          href="/browse"
          className="inline-flex items-center gap-3 text-white/90 hover:text-white mb-7 sm:mb-9"
        >
          <span className="h-[1.9rem] w-[1.9rem] rounded-full border border-white/30 flex items-center justify-center text-[0.85rem] leading-none">
            ←
          </span>
          <span className="text-[0.72rem] sm:text-[0.78rem] font-semibold tracking-[0.06em]">
            BACK TO DASHBOARD
          </span>
        </Link>

        <h1 className="text-[2rem] sm:text-[2.25rem] leading-[1.1] font-spartan font-bold text-white mb-[1.65rem] sm:mb-9">
          Saved Profiles
        </h1>

        {profiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-[1.35rem] xl:gap-[1.45rem]">
            {profiles.map((profile) => {
              const links = profile as Profile & {
                mentorshipLink?: string | null;
                collaborationLink?: string | null;
                userId?: string | null;
              };

              const mentorshipHref =
                links.mentorshipLink || profile.chatLink || "#";
              const collaborationHref = links.collaborationLink || "#";
              const messageUserId = links.userId || profile.id;

              return (
                <article
                  key={profile.id}
                  className="w-full max-w-92 mx-auto rounded-[0.6rem] overflow-hidden border border-[#1d3f1b] bg-[#0b110d] shadow-[0_0.9375rem_2.5rem_rgba(0,0,0,0.35)]"
                >
                  <div className="relative aspect-4/5 w-full bg-[#121712]">
                    {profile.photoUrl ? (
                      <Image
                        src={profile.photoUrl}
                        alt={profile.username}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-6xl text-white/40 font-bold">
                        {profile.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="px-4 sm:px-[1.1rem] pt-[0.85rem] pb-[0.9rem] text-white">
                    <h2 className="text-[1.9rem] leading-[1.05] font-spartan font-semibold">
                      {profile.username}
                    </h2>
                    <p className="mt-[0.3rem] text-[0.86rem] leading-[1.15] text-white/80">
                      {profile.program || "Profession / Title"}
                      {profile.yearStanding ? ` / ${profile.yearStanding}` : ""}
                    </p>
                    <p className="mt-[0.9rem] text-[0.74rem] leading-[1.35] text-white/75 min-h-[2.7rem]">
                      {shortSummary(profile)}
                    </p>

                    <div className="mt-[0.85rem] space-y-[0.6rem] text-[0.89rem] text-white/90">
                      <a
                        href={mentorshipHref}
                        target={mentorshipHref !== "#" ? "_blank" : undefined}
                        rel={
                          mentorshipHref !== "#"
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="inline-flex items-center gap-2 hover:text-white"
                      >
                        <span className="text-white/90">↗</span>
                        <span>Mentorship</span>
                      </a>
                      <a
                        href={collaborationHref}
                        target={
                          collaborationHref !== "#" ? "_blank" : undefined
                        }
                        rel={
                          collaborationHref !== "#"
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="inline-flex items-center gap-2 hover:text-white"
                      >
                        <span className="text-white/90">↗</span>
                        <span>Collaboration</span>
                      </a>
                    </div>

                    <div className="mt-4 space-y-[0.55rem]">
                      <button
                        onClick={() =>
                          router.push(`/messages?user=${messageUserId}`)
                        }
                        className="w-full h-[2.35rem] rounded-full bg-[#228C1D] px-4 text-[0.78rem] font-semibold tracking-[0.01em] text-white hover:bg-[#1d7518] inline-flex items-center justify-center gap-[0.45rem]"
                      >
                        <span>Message</span>
                        <span className="text-[0.72rem] leading-none">▢</span>
                      </button>

                      <button
                        onClick={() => handleRemoveSavedProfile(profile.id)}
                        disabled={removingId === profile.id}
                        className="w-full h-[2.2rem] rounded-full border border-white/70 px-4 text-[0.74rem] font-semibold tracking-[0.01em] text-white hover:bg-white/10 disabled:opacity-50 inline-flex items-center justify-center gap-[0.45rem]"
                      >
                        <span>
                          {removingId === profile.id
                            ? "Removing..."
                            : "Remove Profile"}
                        </span>
                        <span className="text-[0.72rem] leading-none">🗑</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-[#1d3f1b] bg-[#0b110d] py-14 text-center text-white/70">
            <p>You haven&apos;t saved any profiles yet.</p>
          </div>
        )}
      </div>

      <Footer year={2025} />
    </div>
  );
}
