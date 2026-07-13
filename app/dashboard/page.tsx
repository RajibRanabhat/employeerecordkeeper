"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Users, Printer } from "lucide-react";
import { Seal } from "@/components/Seal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type Profile = {
  fullName: string;
  designation: string | null;
  highestEducation: string | null;
  user: { username: string };
};

export default function EmployeeLandingPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch("/api/profile");
      if (res.ok) setProfile(await res.json());
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function confirmLogout() {
    setShowLogoutConfirm(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line bg-card">
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Seal size={40} />
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink leading-none">Employee Register</h1>
              <p className="text-sm text-ink-soft mt-1.5">@{profile?.user.username || "…"}</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="text-sm border border-line rounded-md px-5 py-2.5 text-ink-soft hover:text-ink hover:border-ink-soft transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-12">
        {loading ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : (
          <>
            <div className="mb-10">
              <h2 className="font-display text-3xl font-semibold text-ink">Welcome, {profile?.fullName}</h2>
              <p className="text-base text-ink-soft mt-2">
                {profile?.designation || "Employee"}
                {profile?.highestEducation ? ` · ${profile.highestEducation}` : ""}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Link
                href="/dashboard/profile"
                className="bg-card border border-line rounded-xl p-8 shadow-sm hover:border-ledger hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-ledger/10 flex items-center justify-center mb-5">
                  <User className="w-6 h-6 text-ledger" strokeWidth={1.75} />
                </div>
                <p className="text-lg font-medium text-ink mb-1.5">My Profile</p>
                <p className="text-sm text-ink-soft">View and update your details</p>
              </Link>

              <Link
                href="/dashboard/colleagues"
                className="bg-card border border-line rounded-xl p-8 shadow-sm hover:border-ledger hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-ledger/10 flex items-center justify-center mb-5">
                  <Users className="w-6 h-6 text-ledger" strokeWidth={1.75} />
                </div>
                <p className="text-lg font-medium text-ink mb-1.5">Colleagues</p>
                <p className="text-sm text-ink-soft">Browse the employee directory</p>
              </Link>

              <Link
                href="/dashboard/profile"
                className="bg-card border border-line rounded-xl p-8 shadow-sm hover:border-ledger hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-ledger/10 flex items-center justify-center mb-5">
                  <Printer className="w-6 h-6 text-ledger" strokeWidth={1.75} />
                </div>
                <p className="text-lg font-medium text-ink mb-1.5">Print Profile</p>
                <p className="text-sm text-ink-soft">Get a printable copy of your details</p>
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