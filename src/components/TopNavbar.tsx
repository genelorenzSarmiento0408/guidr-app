"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface TopNavbarProps {
  currentUserId?: string | null;
  currentUserProfile?: {
    username?: string | null;
    photo_url?: string | null;
  } | null;
  className?: string;
}

export default function TopNavbar({
  currentUserId,
  currentUserProfile,
  className = "",
}: TopNavbarProps) {
  const router = useRouter();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-20 h-20 px-4 sm:px-6 flex items-center justify-between bg-black ${className}`}
    >
      <button
        onClick={() => window.dispatchEvent(new Event("toggleMenu"))}
        className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity"
      >
        <svg
          width="64"
          height="48"
          viewBox="0 0 64 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.6665 32H42.6665"
            stroke="#F9F9F9"
            strokeWidth="2.66667"
            strokeLinecap="square"
            strokeLinejoin="round"
          />
          <path
            d="M21.3335 16H53.3335"
            stroke="#F9F9F9"
            strokeWidth="2.66667"
            strokeLinecap="square"
            strokeLinejoin="round"
          />
        </svg>

        <span className="text-sm font-medium">MENU</span>
      </button>

      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-spartan font-bold text-[#228C1D]">
          GUIDR
        </h1>
        <span className="text-white text-xl sm:text-2xl">|</span>
        <span className="hidden md:inline text-white text-sm truncate">
          Guided By Purpose. Driven By People
        </span>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
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
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center overflow-hidden relative">
            {currentUserProfile?.photo_url ? (
              <Image
                src={currentUserProfile.photo_url}
                alt={currentUserProfile.username || "Profile"}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <span className="text-gray-800 font-semibold">
                {currentUserProfile?.username?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-white text-sm font-medium line-clamp-1">
              {currentUserProfile?.username || "Org/Mentor Name"}
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
  );
}
