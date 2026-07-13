"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Wallet, UserPlus } from "lucide-react";
import { Seal } from "@/components/Seal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type Employee = {
  id: number;
  fullName: string;
  designation: string | null;
  salary: number | null;
};

export default function AdminOverviewPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/employees");
      if (res.ok) setEmployees(await res.json());
      setLoading(false);
    }
    load();
  }, []);

  const stats = useMemo(() => {
    const total = employees.length;

    const byDesignation: Record<string, number> = {};
    for (const emp of employees) {
      const key = emp.designation || "Unassigned";
      byDesignation[key] = (byDesignation[key] || 0) + 1;
    }

    const salaries = employees.map((e) => e.salary).filter((s): s is number => s !== null);
    const avgSalary = salaries.length > 0 ? salaries.reduce((a, b) => a + b, 0) / salaries.length : null;

    const newest = employees.length > 0 ? employees.reduce((a, b) => (a.id > b.id ? a : b)) : null;

    return { total, byDesignation, avgSalary, newest };
  }, [employees]);

  async function confirmLogout() {
    setShowLogoutConfirm(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  function formatSalary(salary: number | null) {
    if (salary === null) return "—";
    return `Rs. ${Math.round(salary).toLocaleString()}`;
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line bg-card">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Seal size={36} />
            <div>
              <h1 className="font-display text-xl font-semibold text-ink leading-none">Employee Register</h1>
              <p className="text-xs text-ink-soft mt-1">Administrator</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm font-medium text-ledger">Overview</Link>
            <Link href="/admin/employees" className="text-sm text-ink-soft hover:text-ink">Employee Register</Link>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="text-sm border border-line rounded-md px-4 py-2 text-ink-soft hover:text-ink hover:border-ink-soft transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="font-display text-lg font-semibold text-ink mb-6">Overview</h2>

        {loading ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-card border border-line rounded-lg p-5 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-ledger/10 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-ledger" strokeWidth={1.75} />
                </div>
                <p className="text-xs uppercase tracking-wide text-ink-soft mb-1">Total Employees</p>
                <p className="font-display text-3xl font-semibold text-ink">{stats.total}</p>
              </div>
              <div className="bg-card border border-line rounded-lg p-5 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-ledger/10 flex items-center justify-center mb-3">
                  <Wallet className="w-5 h-5 text-ledger" strokeWidth={1.75} />
                </div>
                <p className="text-xs uppercase tracking-wide text-ink-soft mb-1">Average Salary</p>
                <p className="font-display text-3xl font-semibold text-ink font-mono">{formatSalary(stats.avgSalary)}</p>
              </div>
              <div className="bg-card border border-line rounded-lg p-5 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-ledger/10 flex items-center justify-center mb-3">
                  <UserPlus className="w-5 h-5 text-ledger" strokeWidth={1.75} />
                </div>
                <p className="text-xs uppercase tracking-wide text-ink-soft mb-1">Most Recently Added</p>
                <p className="font-display text-lg font-semibold text-ink">{stats.newest?.fullName || "—"}</p>
                <p className="text-sm text-ink-soft">{stats.newest?.designation || ""}</p>
              </div>
            </div>

            <div className="bg-card border border-line rounded-lg p-6 shadow-sm mb-8">
              <h3 className="font-display text-base font-semibold text-ink mb-4">By Designation</h3>
              {Object.keys(stats.byDesignation).length === 0 ? (
                <p className="text-sm text-ink-soft">No employees yet.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(stats.byDesignation).map(([designation, count]) => (
                    <div key={designation} className="flex items-center gap-3">
                      <span className="text-sm text-ink w-32 shrink-0">{designation}</span>
                      <div className="flex-1 bg-paper border border-line rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-ledger h-full rounded-full"
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono text-ink-soft w-6 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Link
                href="/admin/employees"
                className="bg-ledger hover:bg-ledger-hover text-paper text-sm font-medium rounded-md px-5 py-2.5 transition-colors"
              >
                View Employee Register →
              </Link>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Log Out?"
        message="Are you sure you want to log out?"
        confirmLabel="Log Out"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        danger
      />
    </main>
  );
}