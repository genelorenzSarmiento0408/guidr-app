"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email || !password) {
      setError("Please fill in both fields");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) throw signInError;

      if (data.session) {
        router.push("/browse");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign in with Google",
      );
      setLoading(false);
    }
  };

  return (
    <div className="box-border content-stretch flex min-h-screen items-center justify-between gap-20 p-20 relative w-full bg-gray-900 overflow-hidden">
      {/* Left Branding Panel */}
      <div className="content-stretch flex flex-col h-full items-start justify-between relative shrink-0 w-[425px]">
        <div className="content-stretch flex flex-col gap-20 items-start leading-[normal] relative shrink-0 w-full mb-10">
          <p className="font-['League_Spartan',_sans-serif] relative shrink-0 text-[#228c1d] text-[60.444px] text-nowrap uppercase whitespace-pre font-semibold">
            GUIDR
          </p>
          <p className="font-['Arimo',_sans-serif] min-w-full relative shrink-0 text-[#f9f9f9] text-[48px] font-normal leading-tight">
            Guided by purpose. Driven by people.
          </p>
        </div>
        <div className="bg-[rgba(255,255,255,0.08)] relative rounded-[10px] shrink-0 w-full">
          <div className="absolute border border-[rgba(13,66,10,0.58)] -inset-px pointer-events-none rounded-[11px]" />
          <div className="flex flex-row items-center justify-center size-full">
            <div className="box-border content-stretch flex gap-2.5 items-center justify-center p-[22px] relative w-full">
              <p className="basis-0 font-['Arimo',_sans-serif] grow leading-[30px] min-h-px min-w-px relative shrink-0 text-[#f9f9f9] text-[18px] font-normal">
                Simplifying the way organizations connect with mentors and
                opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="bg-[#f9f9f9] box-border content-stretch flex flex-col gap-[30px] items-start p-[50px] relative rounded-[10px] shrink-0 w-[619px]">
        <div className="absolute border border-[rgba(32,64,30,0.77)] -inset-px pointer-events-none rounded-[11px]" />

        <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0">
          <p className="font-['Arimo',_sans-serif] leading-[normal] relative shrink-0 text-[#0d110d] text-[34px] text-nowrap whitespace-pre font-normal">
            Welcome Back
          </p>
          <div className="content-stretch flex font-['Arimo',_sans-serif] gap-4 items-center leading-[25px] relative shrink-0 text-[16px] text-nowrap tracking-[0.32px] whitespace-pre font-normal">
            <p className="relative shrink-0 text-[#0d110d]">
              Don&apos;t have an account?
            </p>
            <Link
              href="/register"
              className="decoration-solid relative shrink-0 text-[#228c1d] underline hover:text-[#1a6e16] transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>

        {error && (
          <div className="w-full p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm font-['Arimo']">
            {error}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className="content-stretch flex flex-col gap-[30px] items-start relative shrink-0 w-full mt-4"
        >
          <div className="content-stretch flex flex-col gap-6 items-start relative shrink-0 w-full">
            <div className="relative rounded-[999px] shrink-0 w-full">
              <div className="absolute border border-[#bfbfbf] inset-0 pointer-events-none rounded-[999px]" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none px-6 py-4 font-['Arimo',_sans-serif] leading-[25px] text-[14px] text-[#0d110d] tracking-[0.56px] placeholder:text-[#6c6c6c] focus:ring-2 focus:ring-[#228c1d] rounded-[999px]"
              />
            </div>

            <div className="relative rounded-[999px] shrink-0 w-full mt-2">
              <div className="absolute border border-[#bfbfbf] inset-0 pointer-events-none rounded-[999px]" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none px-6 py-4 font-['Arimo',_sans-serif] leading-[25px] text-[14px] text-[#0d110d] tracking-[0.56px] placeholder:text-[#6c6c6c] focus:ring-2 focus:ring-[#228c1d] rounded-[999px]"
              />
            </div>
          </div>

          <div className="content-stretch flex flex-col gap-[22px] items-start relative shrink-0 w-full mt-4">
            <button
              type="submit"
              disabled={loading}
              className="relative rounded-[999px] shrink-0 w-full bg-[#bfbfbf] hover:bg-[#a6a6a6] transition-colors overflow-hidden group cursor-pointer disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-[#228c1d] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-row items-center justify-center size-full relative z-10">
                <div className="box-border content-stretch flex gap-[10px] items-center justify-center px-[30px] py-[14px] relative w-full">
                  <p className="font-['Arimo',_sans-serif] leading-[25px] relative shrink-0 text-[#0d110d] group-hover:text-white text-[14px] font-bold text-nowrap tracking-[0.56px] transition-colors">
                    {loading ? "Signing in..." : "Login to account"}
                  </p>
                </div>
              </div>
            </button>

            <div className="flex justify-center w-full mb-1">
              <span className="text-[#6c6c6c] text-sm font-['Arimo']">OR</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="relative rounded-[999px] shrink-0 w-full bg-white border border-[#bfbfbf] hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center px-[30px] py-[14px] gap-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#FFC107"
                  d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                />
                <path
                  fill="#FF3D00"
                  d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                />
              </svg>
              <p className="font-['Arimo',_sans-serif] leading-[25px] text-[#6c6c6c] text-[14px] font-bold text-nowrap tracking-[0.56px]">
                Sign-in with Google
              </p>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
