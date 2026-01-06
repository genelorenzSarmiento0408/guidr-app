"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        setProfile(profileData);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Separate effect for menu toggle event listener
  useEffect(() => {
    const handleMenuToggle = () => {
      setIsOpen((prev) => !prev);
    };

    window.addEventListener("toggleMenu", handleMenuToggle);

    return () => {
      window.removeEventListener("toggleMenu", handleMenuToggle);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - show when open, hide when not */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-64`}
        style={{ backgroundColor: "#162D10" }}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8 mt-12">
            <h1
              className="text-3xl font-spartan font-bold"
              style={{ color: "#228C1D" }}
            >
              GUIDR
            </h1>
            <p className="text-sm text-guidr-light mt-1">
              Guided By Purpose. Driven By People
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-2">
            <Link
              href="/browse"
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-lg text-guidr-light hover:bg-gray-800 transition-colors ${
                pathname === "/browse" ? "bg-gray-800" : ""
              }`}
            >
              DASHBOARD
            </Link>
            <Link
              href="/messages"
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-lg text-guidr-light hover:bg-gray-800 transition-colors ${
                pathname === "/messages" ? "bg-gray-800" : ""
              }`}
            >
              MESSAGES
            </Link>
            <Link
              href="/saved"
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-lg text-guidr-light hover:bg-gray-800 transition-colors ${
                pathname === "/saved" ? "bg-gray-800" : ""
              }`}
            >
              SAVED PROFILES
            </Link>
          </nav>

          {/* Log Out Button */}
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-full bg-white text-guidr-dark hover:bg-gray-100 transition-colors mb-6"
          >
            <span className="font-semibold" style={{ color: "#228C1D" }}>
              Log out
            </span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "#228C1D" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>

          {/* Footer Links */}
          <div className="pt-6 border-t border-gray-700 space-y-2 text-sm text-gray-400">
            <Link
              href="/help"
              className="flex items-center gap-1 hover:text-guidr-light"
              onClick={() => setIsOpen(false)}
            >
              <span>Help Center</span>
              <svg
                className="w-4 h-4"
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
            </Link>
            <Link
              href="/terms"
              className="flex items-center gap-1 hover:text-guidr-light"
              onClick={() => setIsOpen(false)}
            >
              <span>Terms & Condition</span>
              <svg
                className="w-4 h-4"
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
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
