import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-[#060806] px-6 py-20 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#228c1d]/30 bg-[#0a0d0a] p-8 shadow-xl shadow-black/40">
        <div className="mb-4 inline-flex items-center rounded-full border border-[#228c1d]/50 bg-[#228c1d]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#8ee58a]">
          Payment Successful
        </div>
        <h1 className="text-3xl font-semibold">Premium post enabled</h1>
        <p className="mt-3 text-sm text-gray-300">
          Your payment has been received. Your opportunity post is now marked as
          premium.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/create"
            className="rounded-full bg-[#228c1d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d7518]"
          >
            Back to Opportunity Manager
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
