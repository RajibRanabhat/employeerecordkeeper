"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Seal } from "@/components/Seal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type Profile = {
  id: number;
  fullName: string;
  fatherName: string | null;
  phone: string | null;
  dob: string | null;
  designation: string | null;
  highestEducation: string | null;
  address: string | null;
  email: string | null;
  salary: number | null;
  user: { username: string };
};

function validateProfileForm(form: { phone: string; address: string; email: string; highestEducation: string }): string | null {
  if (!form.phone.trim()) return "Phone number is required.";
  if (!/^\d{10}$/.test(form.phone)) return "Phone number must be exactly 10 digits.";

  if (!form.email.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email address.";

  if (!form.highestEducation.trim()) return "Highest education is required.";

  if (!form.address.trim()) return "Address is required.";

  return null;
}

export default function EmployeeProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ phone: "", address: "", email: "", highestEducation: "" });

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  async function loadProfile() {
    setLoading(true);
    const res = await fetch("/api/profile");
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
      setForm({
        phone: data.phone || "",
        address: data.address || "",
        email: data.email || "",
        highestEducation: data.highestEducation || "",
      });
    }
    setLoading(false);
  }

  useEffect(() => { loadProfile(); }, []);

  function handleSaveSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validationError = validateProfileForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setShowSaveConfirm(true);
  }

  async function confirmSave() {
    setShowSaveConfirm(false);
    setSaving(true);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update profile. Try again.");
      setSaving(false);
      return;
    }

    setEditing(false);
    setSaving(false);
    loadProfile();
  }

  function handlePrint() {
    window.print();
  }

  function formatSalary(salary: number | null) {
    if (salary === null) return "—";
    return `Rs. ${salary.toLocaleString()}`;
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString();
  }

  const inputClass =
    "w-full border border-line rounded-md px-3 py-2 text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-ledger focus:border-ledger transition-colors";
  const labelClass = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

  if (loading) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-ink-soft">Loading your profile…</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-ink-soft">Could not load your profile.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line bg-card print:hidden">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Seal size={36} />
            <div>
              <h1 className="font-display text-xl font-semibold text-ink leading-none">Employee Register</h1>
              <p className="text-xs text-ink-soft mt-1">@{profile.user.username}</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="text-sm border border-line rounded-md px-4 py-2 text-ink-soft hover:text-ink hover:border-ink-soft transition-colors"
          >
            Print
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link href="/dashboard" className="text-sm text-ink-soft hover:text-ink mb-4 inline-block print:hidden">
          ← Back to Dashboard
        </Link>

        <div className="hidden print:block mb-6">
          <h1 className="font-display text-2xl font-semibold">Employee Profile</h1>
          <p className="text-sm text-ink-soft">Printed {new Date().toLocaleDateString()}</p>
        </div>

        <div className="flex items-center justify-between mb-6 print:hidden">
          <h2 className="font-display text-lg font-semibold text-ink">My Profile</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="bg-ledger hover:bg-ledger-hover text-paper text-sm font-medium rounded-md px-4 py-2.5 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="bg-card border border-line rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <p className={labelClass}>Full Name</p>
              <p className="text-ink">{profile.fullName}</p>
            </div>
            <div>
              <p className={labelClass}>Father&apos;s Name</p>
              <p className="text-ink">{profile.fatherName || "—"}</p>
            </div>
            <div>
              <p className={labelClass}>Date of Birth</p>
              <p className="text-ink">{formatDate(profile.dob)}</p>
            </div>
            <div>
              <p className={labelClass}>Designation</p>
              <p className="text-ink">{profile.designation || "—"}</p>
            </div>
            <div>
              <p className={labelClass}>Salary</p>
              <p className="text-ink font-mono">{formatSalary(profile.salary)}</p>
            </div>
          </div>

          <div className="border-t border-line pt-6">
            <p className="text-xs uppercase tracking-wide text-ink-soft mb-4">
              {editing ? "Editable Information" : "Contact Information"}
            </p>

            {!editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className={labelClass}>Phone</p>
                  <p className="text-ink">{profile.phone || "—"}</p>
                </div>
                <div>
                  <p className={labelClass}>Email</p>
                  <p className="text-ink">{profile.email || "—"}</p>
                </div>
                <div>
                  <p className={labelClass}>Highest Education</p>
                  <p className="text-ink">{profile.highestEducation || "—"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className={labelClass}>Address</p>
                  <p className="text-ink">{profile.address || "—"}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveSubmit} className="print:hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Phone * (10 digits)</label>
                    <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Highest Education *</label>
                    <input className={inputClass} value={form.highestEducation} onChange={(e) => setForm({ ...form, highestEducation: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Address *</label>
                    <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-md px-3 py-2 mt-4">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 mt-5">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-ledger hover:bg-ledger-hover disabled:opacity-60 text-paper text-sm font-medium rounded-md px-5 py-2.5 transition-colors"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setForm({
                        phone: profile.phone || "",
                        address: profile.address || "",
                        email: profile.email || "",
                        highestEducation: profile.highestEducation || "",
                      });
                    }}
                    className="text-sm border border-line rounded-md px-5 py-2.5 text-ink-soft hover:text-ink hover:border-ink-soft transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showSaveConfirm}
        title="Update Profile?"
        message="Save these changes to your profile?"
        confirmLabel="Update"
        onConfirm={confirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </main>
  );
}