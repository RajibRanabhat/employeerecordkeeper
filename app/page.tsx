import Link from "next/link";
import { Seal } from "@/components/Seal";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <Seal size={56} />
        </div>
        <h1 className="font-display text-4xl font-semibold text-ink tracking-tight">
          Employee Record Keeper
        </h1>
        <div className="mt-3 mb-6 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-line" />
          <p className="text-sm uppercase tracking-[0.2em] text-ink-soft">Records, Kept Well</p>
          <span className="h-px w-10 bg-line" />
        </div>
        <p className="text-ink-soft leading-relaxed mb-8">
          A centralized register for employee information — add, update, and retrieve records without the paper trail.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-ledger hover:bg-ledger-hover text-paper px-6 py-3 rounded-md font-medium transition-colors"
        >
          Enter the Register
        </Link>
      </div>
    </main>
  );
}