"use client";

import { useEffect, useState } from "react";
import { Eye, Filter, Search } from "lucide-react";
import Image from "next/image";
import ProfileModal from "@/components/ProfileModal";

type ProfileLike = {
  id: string;
  username: string;
  program: string;
  yearStanding: string;
  chatLink: string;
  photoUrl: string;
  skills: string;
  userId: string;
  createdAt: string;
  mentorshipLink?: string;
  mentorshipPrice?: number;
  userType: ("student" | "company")[];
  bio?: string;
  headline?: string;
  collaborationLink?: string;
};

type PostLike = {
  id: string;
  title: string;
  description: string;
  userId: string;
  createdAt: string;
  projectType?: string;
  status?: string;
  requiredSkills?: string;
  profile: ProfileLike;
};

interface HomeClientProps {
  initialPosts: PostLike[];
  currentProfile?: {
    id: string;
    username: string;
    skills?: string | null;
    headline?: string | null;
    user_type?: string[] | null;
  } | null;
}

export default function HomeClient({
  initialPosts,
  currentProfile,
}: HomeClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<ProfileLike | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim().toLowerCase());
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  const recommendedPosts = currentProfile?.skills
    ? [...initialPosts]
        .map((post) => {
          const profileSkills = currentProfile.skills?.toLowerCase() || "";
          const requiredSkillsText = (post.requiredSkills || "").toLowerCase();
          const description = post.description.toLowerCase();
          const title = post.title.toLowerCase();

          let score = 0;
          profileSkills
            .split(",")
            .map((skill: string) => skill.trim())
            .filter(Boolean)
            .forEach((skill: string) => {
              if (requiredSkillsText.includes(skill)) score += 4;
              if (description.includes(skill)) score += 2;
              if (title.includes(skill)) score += 1;
            });

          post.requiredSkills
            ?.split(",")
            .map((skill: string) => skill.trim().toLowerCase())
            .filter(Boolean)
            .forEach((skill: string) => {
              if (profileSkills.includes(skill)) score += 3;
            });

          if ((post.status || "open") !== "closed") score += 1;

          return { post, score };
        })
        .sort((a, b) => b.score - a.score)
        .filter((entry) => entry.score > 0)
        .slice(0, 3)
        .map((entry) => entry.post)
    : [];

  const filteredPosts = initialPosts.filter((post) => {
    const searchableText =
      `${post.title} ${post.description} ${post.profile.skills || ""} ${post.requiredSkills || ""}`.toLowerCase();
    const matchesSearch =
      !debouncedSearchTerm || searchableText.includes(debouncedSearchTerm);
    const matchesStatus =
      statusFilter === "all" || (post.status || "open") === statusFilter;
    const matchesType =
      typeFilter === "all" ||
      (post.projectType || "").toLowerCase() === typeFilter;
    const matchesRequiredSkills =
      !requiredSkills ||
      (post.profile.skills || "")
        .toLowerCase()
        .includes(requiredSkills.toLowerCase()) ||
      post.description.toLowerCase().includes(requiredSkills.toLowerCase()) ||
      (post.requiredSkills || "")
        .toLowerCase()
        .includes(requiredSkills.toLowerCase());

    return (
      matchesSearch && matchesStatus && matchesType && matchesRequiredSkills
    );
  });

  function handleViewProfile(profile: ProfileLike) {
    setSelectedProfile(profile);
    setIsModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-[#050705] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 rounded-4xl border border-white/5 bg-linear-to-br from-[#071007] via-[#050705] to-[#0b1a0b] p-6 shadow-2xl shadow-black/30">
          <div className="inline-flex items-center rounded-full border border-[#228C1D]/40 bg-[#228C1D]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#8ee58a]">
            Opportunity board
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Find your next project partner.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
            Browse active opportunities, filter by what matters, and match on
            real skills instead of filler content.
          </p>
        </header>

        {currentProfile?.skills && recommendedPosts.length > 0 && (
          <section className="mb-10 rounded-4xl border border-[#228C1D]/30 bg-[#081108] p-5 shadow-lg shadow-black/20">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Recommended for You
                </h2>
                <p className="text-sm text-white/60">
                  Based on {currentProfile.username}&apos;s skills and recent
                  opportunities.
                </p>
              </div>
              <span className="rounded-full border border-[#228C1D]/30 bg-[#228C1D]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#8ee58a]">
                Tailored
              </span>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {recommendedPosts.map((post) => (
                <article
                  key={`recommended-${post.id}`}
                  className="rounded-2xl border border-white/5 bg-[#0c120c] p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-white/45">
                    <span>{post.projectType || "Opportunity"}</span>
                    <span>{post.status || "open"}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-white/65">
                    {post.description}
                  </p>
                  {post.requiredSkills && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.requiredSkills.split(",").map((skill: string) => {
                        const trimmedSkill = skill.trim();
                        if (!trimmedSkill) return null;

                        return (
                          <span
                            key={`recommended-${post.id}-${trimmedSkill}`}
                            className="rounded-full border border-[#228C1D]/30 bg-[#228C1D]/10 px-2.5 py-1 text-xs font-medium text-[#8ee58a]"
                          >
                            {trimmedSkill}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="mb-8 rounded-[1.75rem] border border-white/5 bg-[#0a0d0a] p-4 shadow-xl shadow-black/20">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7e9f7d]" />
            <input
              type="text"
              placeholder="Search by title, description, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-[1.25rem] border border-white/5 bg-[#050705] py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:border-[#228C1D] focus:outline-none focus:ring-2 focus:ring-[#228C1D]/20"
            />
          </div>
        </div>

        <div className="mb-8 rounded-[1.75rem] border border-white/5 bg-[#0a0d0a] p-4 shadow-xl shadow-black/20">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/80">
            <Filter className="h-4 w-4 text-[#8ee58a]" />
            Filters
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/45">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#050705] px-3 py-3 text-white focus:border-[#228C1D] focus:outline-none focus:ring-2 focus:ring-[#228C1D]/20"
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/45">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#050705] px-3 py-3 text-white focus:border-[#228C1D] focus:outline-none focus:ring-2 focus:ring-[#228C1D]/20"
              >
                <option value="all">All types</option>
                <option value="research">Research</option>
                <option value="startup">Startup</option>
                <option value="internship">Internship</option>
                <option value="collaboration">Collaboration</option>
                <option value="mentorship">Mentorship</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/45">
                Required Skills
              </label>
              <input
                type="text"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="React, Python, UI/UX..."
                className="w-full rounded-xl border border-white/10 bg-[#050705] px-3 py-3 text-white placeholder:text-white/30 focus:border-[#228C1D] focus:outline-none focus:ring-2 focus:ring-[#228C1D]/20"
              />
            </div>
          </div>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="space-y-6 pb-12">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="rounded-[1.75rem] border border-white/5 bg-[#0a0d0a] p-6 shadow-xl shadow-black/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#8ee58a]">
                      <span>{post.projectType || "Opportunity"}</span>
                      <span className="text-white/30">•</span>
                      <span>{post.status || "open"}</span>
                    </div>
                    <h2 className="text-2xl font-semibold text-white">
                      {post.title}
                    </h2>
                  </div>
                  <div className="text-sm text-white/45">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <p className="mt-4 text-white/70">{post.description}</p>

                {post.requiredSkills && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.requiredSkills.split(",").map((skill: string) => {
                      const trimmedSkill = skill.trim();

                      if (!trimmedSkill) {
                        return null;
                      }

                      return (
                        <span
                          key={`${post.id}-${trimmedSkill}`}
                          className="rounded-full border border-[#228C1D]/30 bg-[#228C1D]/10 px-3 py-1 text-xs font-medium text-[#8ee58a]"
                        >
                          {trimmedSkill}
                        </span>
                      );
                    })}
                  </div>
                )}

                <div className="mt-4 border-t border-white/5 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center">
                      <div className="shrink-0">
                        {post.profile.photoUrl ? (
                          <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-[#111611]">
                            <Image
                              src={post.profile.photoUrl}
                              alt={post.profile.username}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#228C1D]/30 bg-[#228C1D]/10 text-sm font-bold text-[#8ee58a]">
                            {post.profile.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">
                          {post.profile.username}
                        </p>
                        <p className="text-sm text-white/50">
                          {post.profile.program} • {post.profile.yearStanding}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewProfile(post.profile)}
                      className="inline-flex items-center rounded-full border border-[#228C1D]/40 bg-[#228C1D] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#228C1D]/20 transition-colors hover:bg-[#1c7318] focus:outline-none focus:ring-2 focus:ring-[#228C1D]/30"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Profile
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-white/5 bg-[#0a0d0a] py-16 text-center text-white/60 shadow-xl shadow-black/20">
            <p className="text-lg text-white">
              No posts found matching your search.
            </p>
            <p className="mt-2 text-white/45">
              Try adjusting your search terms or browse all available posts.
            </p>
          </div>
        )}

        {selectedProfile && (
          <ProfileModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            profile={selectedProfile}
          />
        )}
      </div>
    </div>
  );
}
