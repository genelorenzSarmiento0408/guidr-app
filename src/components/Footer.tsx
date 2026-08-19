import Link from "next/link";

interface FooterProps {
  year?: number;
}

export default function Footer({ year = 2025 }: FooterProps) {
  return (
    <footer
      className="w-full mt-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-10 overflow-hidden"
      style={{
        background:
          "linear-gradient(to top, rgba(23, 55, 21, 0.4) 0%, rgba(23, 55, 21, 0.24) 50%, rgba(23, 55, 21, 0) 100%), radial-gradient(130% 185% at 50% 100%, rgba(39, 61, 32, 0.4) 0%, rgba(23, 55, 21, 0.28) 46%, rgba(23, 55, 21, 0.14) 68%, rgba(23, 55, 21, 0) 100%)",
        borderTopLeftRadius: "50% 22%",
        borderTopRightRadius: "50% 22%",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-[3.75rem] sm:text-[4rem] leading-none font-spartan font-bold text-white">
            GUIDR
          </h2>
        </div>

        <div className="flex justify-center flex-wrap gap-x-10 gap-y-4 mb-12 text-white text-[1rem] font-semibold">
          <Link
            href="/support"
            className="hover:text-white/80 transition-colors"
          >
            Support
          </Link>
          <Link href="/terms" className="hover:text-white/80 transition-colors">
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="hover:text-white/80 transition-colors"
          >
            Privacy Policy
          </Link>
        </div>

        <div className="text-center text-white/80 text-[0.95rem]">
          Copyright © {year} GUIDR®. All Rights Reserved
        </div>
      </div>
    </footer>
  );
}
