"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Seal } from "@/components/Seal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const emptyForm = {
  fullName: "", fatherName: "", phone: "", dob: "",
  designation: "", highestEducation: "", address: "", email: "", salary: "", newPassword: "",
};

const DESIGNATIONS = ["HR", "Sales", "Executive", "Manager", "Accountant", "IT Support", "Intern"];

function calculateAge(dobStr: string): number {
  const dob = new Date(dobStr);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function validateEditForm(form: typeof emptyForm): string | null {
  if (!form.fullName.trim()) return "Full name is required.";
  if (!/^[a-zA-Z\s]+$/.test(form.fullName)) return "Full name can only contain letters and spaces.";

  if (!form.fatherName.trim()) return "Father's name is required.";
  if (!/^[a-zA-Z\s]+$/.test(form.fatherName)) return "Father's name can only contain letters and spaces.";

  if (!form.phone.trim()) return "Phone number is required.";
  if (!/^\d{10}$/.test(form.phone)) return "Phone number must be exactly 10 digits.";

  if (!form.dob) return "Date of birth is required.";
  const dobDate = new Date(form.dob);
  if (dobDate > new Date()) return "Date of birth cannot be in the future.";
  if (calculateAge(form.dob) < 18) return "Employee must be at least 18 years old.";

  if (!form.designation) return "Designation is required.";

  if (!form.highestEducation.trim()) return "Highest education is required.";

  if (!form.address.trim()) return "Address is required.";

  if (!form.email.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email address.";

  if (!form.salary.trim()) return "Salary is required.";
  const salaryNum = parseFloat(form.salary);
  if (isNaN(salaryNum)) return "Salary must be a valid number.";
  if (salaryNum < 10000 || salaryNum > 200000) return "Salary must be between Rs. 10,000 and Rs. 200,000.";

  if (form.newPassword && form.newPassword.length < 6) {
    return "New password must be at least 6 characters.";
  }

  return null;
}

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState(emptyForm);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  useEffect(() => {
    async function loadEmployee() {
      const res = await fetch(`/api/employees/${id}`);
      if (!res.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const emp = await res.json();
      setUsername(emp.user.username);
      setForm({
        fullName: emp.fullName || "",
        fatherName: emp.fatherName || "",
        phone: emp.phone || "",
        dob: emp.dob ? emp.dob.split("T")[0] : "",
        designation: emp.designation || "",
        highestEducation: emp.highestEducation || "",
        address: emp.address || "",
        email: emp.email || "",
        salary: emp.salary?.toString() || "",
        newPassword: "",
      });
      setLoading(false);
    }
    loadEmployee();
  }, [id]);

  function handleSaveSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validationError = validateEditForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setShowSaveConfirm(true);
  }

  async function confirmSave() {
    setShowSaveConfirm(false);
    setSaving(true);

    const res = await fetch(`/api/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update employee");
      setSaving(false);
      return;
    }

    router.push("/admin/employees");
    router.refresh();
  }

  const inputClass =
    "w-full border border-line rounded-md px-3 py-2 text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-ledger focus:border-ledger transition-colors";
  const labelClass = "block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5";

  if (loading) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-ink-soft">Loading employee record…</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink mb-4">No employee found with that ID.</p>
          <button
            onClick={() => router.push("/admin/employees")}
            className="text-ledger hover:text-ledger-hover font-medium text-sm"
          >
            ← Back to Employee Register
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line bg-card">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-3">
          <Seal size={36} />
          <div>
            <h1 className="font-display text-xl font-semibold text-ink leading-none">Employee Register</h1>
            <p className="text-xs text-ink-soft mt-1">Administrator</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => router.push("/admin/employees")}
          className="text-sm text-ink-soft hover:text-ink mb-4 inline-block"
        >
          ← Back to Employee Register
        </button>

        <div className="bg-card border border-line rounded-lg p-6 shadow-sm">
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="font-display text-lg font-semibold text-ink">Update Employee Record</h2>
            <span className="font-mono text-xs text-ink-soft">ID: {id}</span>
          </div>
          <p className="text-sm text-ink-soft mb-6 font-mono">@{username}</p>

          <form onSubmit={handleSaveSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input className={inputClass} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Father&apos;s Name *</label>
                <input className={inputClass} value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Phone * (10 digits)</label>
                <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Date of Birth *</label>
                <input type="date" className={inputClass} value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Designation *</label>
                <select className={inputClass} value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}>
                  <option value="">Select designation</option>
                  {DESIGNATIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Highest Education *</label>
                <input className={inputClass} value={form.highestEducation} onChange={(e) => setForm({ ...form, highestEducation: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Address *</label>
                <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Salary * (Rs. 10,000 – 200,000)</label>
                <input type="number" className={inputClass} value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
              </div>
            </div>

            <div className="border-t border-line mt-5 pt-5">
              <label className={labelClass}>Reset Password</label>
              <input
                type="password"
                placeholder="Leave blank to keep current password"
                className={inputClass}
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              />
              <p className="text-xs text-ink-soft mt-1.5">
                Only fill this in if the employee needs their password reset. Minimum 6 characters.
              </p>
            </div>

            {error && (
              <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-md px-3 py-2 mt-4">
                {error}
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={saving}
                className="bg-ledger hover:bg-ledger-hover disabled:opacity-60 text-paper text-sm font-medium rounded-md px-5 py-2.5 transition-colors"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/employees")}
                className="text-sm border border-line rounded-md px-5 py-2.5 text-ink-soft hover:text-ink hover:border-ink-soft transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmDialog
        open={showSaveConfirm}
        title="Save Changes?"
        message={`Update the record for "${form.fullName}"?`}
        confirmLabel="Save Changes"
        onConfirm={confirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </main>
  );
}