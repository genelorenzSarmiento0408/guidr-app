/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
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

  useEffect(() => {
    if (!user?.id) return;

    let lastPingAt = 0;
    const updateLastActive = async (force = false) => {
      const now = Date.now();
      if (!force && now - lastPingAt < 60_000) return;
      if (!force && document.visibilityState !== "visible") return;

      lastPingAt = now;
      await supabase
        .from("profiles")
        .update({ last_active: new Date().toISOString() })
        .eq("user_id", user.id);
    };

    updateLastActive(true);

    const intervalId = window.setInterval(() => {
      updateLastActive(false);
    }, 60_000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        updateLastActive(true);
      }
    };

    window.addEventListener("focus", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [supabase, user?.id]);

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

  const confirmSignOut = async () => {
    await supabase.auth.signOut();
    setShowLogoutConfirm(false);
    setIsOpen(false);
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

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-[#228C1D]/30 bg-[#0A0D0A] p-6 text-white shadow-2xl">
            <h2 className="text-xl font-bold">Log out of Guidr?</h2>
            <p className="mt-2 text-sm text-white/70">
              You can sign back in anytime with your account.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="flex-1 rounded-full bg-[#228C1D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d7518]"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
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
            onClick={() => setShowLogoutConfirm(true)}
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
