"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Seal } from "@/components/Seal";

type Colleague = {
  id: number;
  fullName: string;
  designation: string | null;
};

export default function ColleaguesPage() {
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadColleagues() {
      const res = await fetch("/api/colleagues");
      if (res.ok) setColleagues(await res.json());
      setLoading(false);
    }
    loadColleagues();
  }, []);

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line bg-card">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-3">
          <Seal size={36} />
          <div>
            <h1 className="font-display text-xl font-semibold text-ink leading-none">Employee Register</h1>
            <p className="text-xs text-ink-soft mt-1">Colleague Directory</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link href="/dashboard" className="text-sm text-ink-soft hover:text-ink mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        <h2 className="font-display text-lg font-semibold text-ink mb-6">Colleagues</h2>

        <div className="bg-card border border-line rounded-lg overflow-hidden shadow-sm">
          {loading ? (
            <p className="text-sm text-ink-soft px-6 py-10 text-center">Loading…</p>
          ) : colleagues.length === 0 ? (
            <p className="text-sm text-ink-soft px-6 py-10 text-center">No colleagues on record yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-ink/10 text-left">
                  <th className="px-6 py-3 font-medium uppercase text-xs tracking-wide text-ink-soft w-16">S.N.</th>
                  <th className="px-6 py-3 font-medium uppercase text-xs tracking-wide text-ink-soft">Name</th>
                  <th className="px-6 py-3 font-medium uppercase text-xs tracking-wide text-ink-soft">Designation</th>
                </tr>
              </thead>
              <tbody>
                {colleagues.map((c, i) => (
                  <tr key={c.id} className={`border-b border-line last:border-0 ${i % 2 === 1 ? "bg-ledger/[0.03]" : ""}`}>
                    <td className="px-6 py-3.5 font-mono text-xs text-ink-soft">{i + 1}</td>
                    <td className="px-6 py-3.5 text-ink font-medium">{c.fullName}</td>
                    <td className="px-6 py-3.5 text-ink-soft">{c.designation || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}