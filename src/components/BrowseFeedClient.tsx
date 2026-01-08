"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Mentor {
  id: string;
  user_id?: string;
  username: string;
  program: string;
  photo_url: string;
  bio: string;
  skills: string;
  user_type: string[];
  year_standing: string;
  chat_enabled: boolean;
}

interface ConnectionRequest {
  id: string;
  mentor_id: string;
  status: string;
}

interface BrowseFeedClientProps {
  mentors: Mentor[];
  currentUserId?: string;
  connectionRequests: ConnectionRequest[];
}

export default function BrowseFeedClient({
  mentors,
  currentUserId,
  connectionRequests,
}: BrowseFeedClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [filterType, setFilterType] = useState<string>("all");
  const [filterSkills, setFilterSkills] = useState<string>("");
  const [hoveredMentor, setHoveredMentor] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{
    username: string;
    photo_url?: string;
  } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch current user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUserId) {
        const { data } = await supabase
          .from("profiles")
          .select("username, photo_url")
          .eq("user_id", currentUserId)
          .single();

        if (data) {
          setUserProfile(data);
        }
      }
    };
    fetchProfile();
  }, [currentUserId, supabase]);

  // Filter mentors
  const filteredMentors = mentors.filter((mentor) => {
    // Filter by type
    if (filterType !== "all") {
      if (filterType === "mentor" && !mentor.user_type?.includes("student")) {
        return false;
      }
      if (
        filterType === "organization" &&
        !mentor.user_type?.includes("company")
      ) {
        return false;
      }
    }

    // Filter by skills
    if (
      filterSkills &&
      !mentor.skills.toLowerCase().includes(filterSkills.toLowerCase())
    ) {
      return false;
    }

    // Don't show current user
    if (currentUserId && mentor.user_id === currentUserId) {
      return false;
    }

    return true;
  });

  // Check if user already sent a request to this mentor
  const hasRequestedConnection = (mentorId: string) => {
    return connectionRequests.some((req) => req.mentor_id === mentorId);
  };

  const handleSendRequest = async (mentorId: string) => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }

    setError(null);
    setSendingRequest(mentorId);

    try {
      const { error: requestError } = await supabase
        .from("connection_requests")
        .insert({
          requester_id: currentUserId,
          mentor_id: mentorId,
          status: "pending",
          message: "",
        });

      if (requestError) throw requestError;

      // Refresh the page to update connection requests
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setSendingRequest(null);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Top Header Bar */}
      <header
        className="fixed top-0 left-0 right-0 z-20 px-6 h-20 flex items-center justify-between"
        style={{ backgroundColor: "#2A2A2A" }}
      >
        {/* Left: Menu Button */}
        <button
          onClick={() => {
            setMenuOpen(!menuOpen);
            window.dispatchEvent(new Event("toggleMenu"));
          }}
          className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <span className="text-sm font-medium">MENU</span>
        </button>

        {/* Center: Logo and Tagline */}
        <div className="flex items-center gap-3">
          <h1
            className="text-3xl font-spartan font-bold"
            style={{ color: "#228C1D" }}
          >
            GUIDR
          </h1>
          <span className="text-white text-sm">
            | Guided By Purpose. Driven By People
          </span>
        </div>

        {/* Right: Messages and Profile */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push("/messages")}
            className="text-white text-sm hover:opacity-80 transition-opacity"
          >
            Messages
          </button>
          <button
            onClick={() =>
              currentUserId && router.push(`/profile/${currentUserId}`)
            }
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden relative">
              {userProfile?.photo_url ? (
                <Image
                  src={userProfile.photo_url}
                  alt={userProfile.username}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <span className="text-gray-800 font-semibold">
                  {userProfile?.username?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">
                {userProfile?.username || "Org/Mentor Name"}
              </p>
              <p className="text-gray-400 text-xs flex items-center gap-1">
                View profile
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </p>
            </div>
          </button>
        </div>
      </header>

      {/* Main Content with top padding */}
      <div className="pt-20">
        {/* Search Bar Section */}
        <div className="bg-black py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-center text-guidr-light text-lg mb-6">
              Experience GUIDR&apos;s intelligent matchmaking
            </h2>
            <div className="flex gap-4 items-center max-w-3xl mx-auto">
              <input
                type="text"
                placeholder="Search by skills, niche, or expertise"
                value={filterSkills}
                onChange={(e) => setFilterSkills(e.target.value)}
                className="flex-1 px-6 py-4 rounded-full border-none bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-guidr-green"
              />
              <button
                className="px-8 py-4 rounded-full font-semibold text-white whitespace-nowrap"
                style={{ backgroundColor: "#228C1D" }}
              >
                Find Match
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Result count badge */}

          {/* Header with Filters */}
          <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
            <h1 className="text-4xl font-spartan font-bold text-guidr-light">
              Find your Guide
            </h1>
            <div className="flex gap-2 items-center">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-600 bg-white text-guidr-dark focus:outline-none focus:ring-2"
                style={{ color: "#228C1D" }}
              >
                <option value="all">Filter by expertise</option>
                <option value="mentor">Mentors</option>
                <option value="organization">Organizations</option>
              </select>
              <button className="p-2 rounded-lg border border-gray-600 bg-gray-800 text-guidr-light hover:bg-gray-700">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button className="p-2 rounded-lg border border-gray-600 bg-gray-800 text-guidr-light hover:bg-gray-700">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Mentor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="relative group"
                onMouseEnter={() => setHoveredMentor(mentor.id)}
                onMouseLeave={() => setHoveredMentor(null)}
              >
                {/* Main Card */}
                <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 cursor-pointer">
                  <div className="aspect-3/4 relative">
                    <Image
                      src={
                        mentor.photo_url ||
                        "https://via.placeholder.com/400x600?text=No+Photo"
                      }
                      alt={mentor.username}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-xl font-bold mb-1">
                        {mentor.username}
                      </h3>
                      <p className="text-sm text-gray-300">{mentor.program}</p>
                    </div>
                  </div>
                </div>

                {/* Hover Preview Card */}
                {hoveredMentor === mentor.id && (
                  <div className="absolute bottom-0 left-0 right-0 z-10 bg-guidr-dark border border-guidr-green rounded-lg p-6 shadow-2xl">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">
                          {mentor.program}
                        </p>
                      </div>
                    </div>

                    {/* Bio Preview */}
                    <p className="text-sm text-guidr-light mb-4 line-clamp-3">
                      {mentor.bio || "No bio available"}
                    </p>

                    {/* Skills Tags */}
                    {mentor.skills && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {mentor.skills
                          .split(",")
                          .slice(0, 3)
                          .map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 text-xs rounded-full bg-guidr-green/20 text-guidr-green border border-guidr-green"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/profile/${mentor.id}`)}
                        className="flex-1 px-4 py-2 rounded-lg border text-sm font-semibold text-guidr-light hover:bg-gray-700 transition-colors"
                        style={{ borderColor: "#228C1D" }}
                      >
                        View Profile
                      </button>
                      {currentUserId && !hasRequestedConnection(mentor.id) ? (
                        <button
                          onClick={() => handleSendRequest(mentor.id)}
                          disabled={sendingRequest === mentor.id}
                          className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
                          style={{ backgroundColor: "#228C1D" }}
                        >
                          {sendingRequest === mentor.id
                            ? "Sending..."
                            : "Send Request"}
                        </button>
                      ) : hasRequestedConnection(mentor.id) ? (
                        <button
                          disabled
                          className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 bg-gray-700 cursor-not-allowed"
                        >
                          Request Sent
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredMentors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-guidr-light text-lg">
                No mentors found matching your criteria.
              </p>
            </div>
          )}
        </div>

        {/* Footer Section */}
        <footer
          className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800"
          style={{ backgroundColor: "#3A3A3A" }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Logo */}
            <div className="text-center mb-6">
              <h2
                className="text-3xl font-spartan font-bold"
                style={{ color: "#FFFFFF" }}
              >
                GUIDR
              </h2>
            </div>

            {/* Links */}
            <div className="flex justify-center gap-8 mb-6 text-white text-sm">
              <a
                href="/support"
                className="hover:text-guidr-green transition-colors"
              >
                Support
              </a>
              <a
                href="/terms"
                className="hover:text-guidr-green transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/privacy"
                className="hover:text-guidr-green transition-colors"
              >
                Privacy Policy
              </a>
            </div>

            {/* Copyright */}
            <div className="text-center text-gray-400 text-sm">
              Copyright © 2025 GUIDR®. All Rights Reserved
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
