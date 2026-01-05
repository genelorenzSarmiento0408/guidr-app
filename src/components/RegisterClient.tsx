"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Role = "organization" | "mentor";

interface OrganizationForm {
  organizationName: string;
  email: string;
  password: string;
}

interface MentorForm {
  firstName: string;
  lastName: string;
  profession: string;
  email: string;
  password: string;
}

export default function RegisterClient() {
  const router = useRouter();
  const supabase = createClient();
  const [role, setRole] = useState<Role>("organization");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Organization form state
  const [orgForm, setOrgForm] = useState<OrganizationForm>({
    organizationName: "",
    email: "",
    password: "",
  });

  // Mentor form state
  const [mentorForm, setMentorForm] = useState<MentorForm>({
    firstName: "",
    lastName: "",
    profession: "",
    email: "",
    password: "",
  });

  const [termsAccepted, setTermsAccepted] = useState(false);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!orgForm.organizationName.trim()) {
      setError("Organization name is required");
      return;
    }

    if (!validateEmail(orgForm.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!validatePassword(orgForm.password)) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the Terms of Use");
      return;
    }

    setLoading(true);

    try {
      // Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: orgForm.email,
        password: orgForm.password,
        options: {
          data: {
            role: "organization",
            organization_name: orgForm.organizationName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Profile is automatically created by database trigger
        // Redirect to home or confirmation page
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleMentorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!mentorForm.firstName.trim() || !mentorForm.lastName.trim()) {
      setError("First name and last name are required");
      return;
    }

    if (!mentorForm.profession.trim()) {
      setError("Profession/Title is required");
      return;
    }

    if (!validateEmail(mentorForm.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!validatePassword(mentorForm.password)) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the Terms of Use");
      return;
    }

    setLoading(true);

    try {
      // Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: mentorForm.email,
        password: mentorForm.password,
        options: {
          data: {
            role: "mentor",
            first_name: mentorForm.firstName,
            last_name: mentorForm.lastName,
            profession: mentorForm.profession,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Profile is automatically created by database trigger
        // Redirect to home or confirmation page
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: "url('/registration-pattern.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#162D10",
      }}
    >
      <div className="w-full flex items-center justify-between max-w-7xl gap-12">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-1 flex-col justify-between text-guidr-light min-h-[600px]">
          <div>
            <h1
              className="text-6xl font-spartan font-bold mb-6"
              style={{ color: "#228C1D" }}
            >
              GUIDR
            </h1>
            <p className="text-4xl font-semibold mb-2">Guided by purpose.</p>
            <p className="text-4xl font-semibold">Driven by people.</p>
          </div>
          <div className="p-6 border border-guidr-light/30 rounded-lg max-w-md">
            <p className="text-lg">
              Simplifying the way organizations connect with mentors and
              opportunities.
            </p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-guidr-dark mb-2">
              Get Started
            </h2>
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold"
                style={{ color: "#228C1D" }}
              >
                Login
              </Link>
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">
              Select the role you&apos;re signing up for.
            </p>
            <div className="flex gap-2 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setRole("organization")}
                className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                  role === "organization" ? "border-b-2" : "text-gray-500"
                }`}
                style={{
                  color: role === "organization" ? "#228C1D" : undefined,
                  borderColor: role === "organization" ? "#228C1D" : undefined,
                }}
              >
                Organization
              </button>
              <button
                type="button"
                onClick={() => setRole("mentor")}
                className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                  role === "mentor" ? "border-b-2" : "text-gray-500"
                }`}
                style={{
                  color: role === "mentor" ? "#228C1D" : undefined,
                  borderColor: role === "mentor" ? "#228C1D" : undefined,
                }}
              >
                Mentor
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Organization Form */}
          {role === "organization" && (
            <form onSubmit={handleOrganizationSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Organization name"
                  value={orgForm.organizationName}
                  onChange={(e) =>
                    setOrgForm({ ...orgForm, organizationName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guidr-green focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={orgForm.email}
                  onChange={(e) =>
                    setOrgForm({ ...orgForm, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guidr-green focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={orgForm.password}
                  onChange={(e) =>
                    setOrgForm({ ...orgForm, password: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guidr-green focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms-org"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 text-guidr-green border-gray-300 rounded focus:ring-guidr-green"
                  disabled={loading}
                />
                <label htmlFor="terms-org" className="text-xs text-gray-600">
                  By creating an account, you agree to GUIDR&apos;s{" "}
                  <Link
                    href="/terms"
                    className="hover:underline"
                    style={{ color: "#228C1D" }}
                  >
                    Terms of Use
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  !orgForm.organizationName.trim() ||
                  !orgForm.email.trim() ||
                  !orgForm.password.trim() ||
                  !termsAccepted
                }
                className="w-full py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor:
                    loading ||
                    !orgForm.organizationName.trim() ||
                    !orgForm.email.trim() ||
                    !orgForm.password.trim() ||
                    !termsAccepted
                      ? "#cccccc"
                      : "#228C1D",
                  color: "white",
                }}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
          )}

          {/* Mentor Form */}
          {role === "mentor" && (
            <form onSubmit={handleMentorSubmit} className="space-y-4">
              <p
                className="text-sm font-medium mb-2"
                style={{ color: "#228C1D" }}
              >
                Please provide your mentor details.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First name"
                  value={mentorForm.firstName}
                  onChange={(e) =>
                    setMentorForm({ ...mentorForm, firstName: e.target.value })
                  }
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guidr-green focus:border-transparent"
                  disabled={loading}
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={mentorForm.lastName}
                  onChange={(e) =>
                    setMentorForm({ ...mentorForm, lastName: e.target.value })
                  }
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guidr-green focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Profession / Title"
                  value={mentorForm.profession}
                  onChange={(e) =>
                    setMentorForm({ ...mentorForm, profession: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guidr-green focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={mentorForm.email}
                  onChange={(e) =>
                    setMentorForm({ ...mentorForm, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guidr-green focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={mentorForm.password}
                  onChange={(e) =>
                    setMentorForm({ ...mentorForm, password: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guidr-green focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms-mentor"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 text-guidr-green border-gray-300 rounded focus:ring-guidr-green"
                  disabled={loading}
                />
                <label htmlFor="terms-mentor" className="text-xs text-gray-600">
                  By creating an account, you agree to GUIDR&apos;s{" "}
                  <Link
                    href="/terms"
                    className="hover:underline"
                    style={{ color: "#228C1D" }}
                  >
                    Terms of Use
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  !mentorForm.firstName.trim() ||
                  !mentorForm.lastName.trim() ||
                  !mentorForm.profession.trim() ||
                  !mentorForm.email.trim() ||
                  !mentorForm.password.trim() ||
                  !termsAccepted
                }
                className="w-full py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor:
                    loading ||
                    !mentorForm.firstName.trim() ||
                    !mentorForm.lastName.trim() ||
                    !mentorForm.profession.trim() ||
                    !mentorForm.email.trim() ||
                    !mentorForm.password.trim() ||
                    !termsAccepted
                      ? "#cccccc"
                      : "#228C1D",
                  color: "white",
                }}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign-up with Google
          </button>
        </div>
      </div>
    </div>
  );
}
