"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Seal } from "@/components/Seal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type Employee = {
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

const emptyForm = {
  username: "", password: "", fullName: "", fatherName: "", phone: "",
  dob: "", designation: "", highestEducation: "", address: "", email: "", salary: "",
};

const DESIGNATIONS = ["HR", "Sales", "Executive", "Manager", "Accountant", "IT Support", "Intern"];

type SortKey = "name" | "id";

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

function validateEmployeeForm(form: typeof emptyForm): string | null {
  if (!form.username.trim()) return "Username is required.";
  if (!/^[a-zA-Z0-9]+$/.test(form.username)) return "Username can only contain letters and numbers.";

  if (!form.password) return "Password is required.";
  if (form.password.length < 6) return "Password must be at least 6 characters.";

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

  return null;
}

export default function EmployeeRegisterPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  const [searchId, setSearchId] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  async function loadEmployees() {
    setLoading(true);
    const res = await fetch("/api/employees");
    if (res.ok) setEmployees(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadEmployees(); }, []);

  const visibleEmployees = useMemo(() => {
    let list = [...employees];

    if (searchId.trim()) {
      list = list.filter((emp) => emp.id.toString().includes(searchId.trim()));
    }

    list.sort((a, b) => {
      if (sortBy === "name") return a.fullName.localeCompare(b.fullName);
      if (sortBy === "id") return a.id - b.id;
      return 0;
    });

    return list;
  }, [employees, searchId, sortBy]);

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validationError = validateEmployeeForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setShowAddConfirm(true);
  }

  async function confirmAddEmployee() {
    setShowAddConfirm(false);

    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to add employee");
      return;
    }

    setForm(emptyForm);
    setShowForm(false);
    loadEmployees();
  }

  async function confirmLogout() {
    setShowLogoutConfirm(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
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

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line bg-card print:hidden">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Seal size={36} />
            <div>
              <h1 className="font-display text-xl font-semibold text-ink leading-none">Employee Register</h1>
              <p className="text-xs text-ink-soft mt-1">Administrator</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm text-ink-soft hover:text-ink">Overview</Link>
            <Link href="/admin/employees" className="text-sm font-medium text-ledger">Employee Register</Link>
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
        <div className="hidden print:block mb-6">
          <h1 className="font-display text-2xl font-semibold">Employee Register</h1>
          <p className="text-sm text-ink-soft">Printed {new Date().toLocaleDateString()}</p>
        </div>

        <div className="flex items-center justify-between mb-6 print:hidden">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">All Employees</h2>
            <p className="text-sm text-ink-soft">{employees.length} record{employees.length !== 1 ? "s" : ""} on file</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-ledger hover:bg-ledger-hover text-paper text-sm font-medium rounded-md px-4 py-2.5 transition-colors"
          >
            + Add Employee
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4 print:hidden">
          <input
            placeholder="Search by Employee ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="border border-line rounded-md px-3 py-2 text-sm bg-card w-56 focus:outline-none focus:ring-2 focus:ring-ledger focus:border-ledger"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="border border-line rounded-md px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ledger focus:border-ledger"
          >
            <option value="name">Sort by Name</option>
            <option value="id">Sort by Employee ID</option>
          </select>
          <button
            onClick={handlePrint}
            className="ml-auto text-sm border border-line rounded-md px-4 py-2 text-ink-soft hover:text-ink hover:border-ink-soft transition-colors"
          >
            Print
          </button>
        </div>

        <div className="bg-card border border-line rounded-lg overflow-hidden shadow-sm">
          {loading ? (
            <p className="text-sm text-ink-soft px-6 py-10 text-center">Loading employees…</p>
          ) : visibleEmployees.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-ink-soft">
                {employees.length === 0 ? "No employees on record yet." : "No employee matches that ID."}
              </p>
              {employees.length === 0 && (
                <p className="text-sm text-ink-soft mt-1">Add your first employee to get started.</p>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-ink/10 text-left">
                  <th className="px-6 py-3 font-medium uppercase text-xs tracking-wide text-ink-soft">ID</th>
                  <th className="px-6 py-3 font-medium uppercase text-xs tracking-wide text-ink-soft">Name</th>
                  <th className="px-6 py-3 font-medium uppercase text-xs tracking-wide text-ink-soft">Username</th>
                  <th className="px-6 py-3 font-medium uppercase text-xs tracking-wide text-ink-soft">Designation</th>
                  <th className="px-6 py-3 font-medium uppercase text-xs tracking-wide text-ink-soft">Phone</th>
                  <th className="px-6 py-3 print:hidden"></th>
                </tr>
              </thead>
              <tbody>
                {visibleEmployees.map((emp, i) => (
                  <Fragment key={emp.id}>
                    <tr className={`border-b border-line ${expandedId === emp.id ? "" : "last:border-0"} ${i % 2 === 1 ? "bg-ledger/[0.03]" : ""}`}>
                      <td className="px-6 py-3.5 font-mono text-xs text-ink-soft">{emp.id}</td>
                      <td className="px-6 py-3.5 text-ink font-medium">{emp.fullName}</td>
                      <td className="px-6 py-3.5 font-mono text-xs text-ink-soft">{emp.user.username}</td>
                      <td className="px-6 py-3.5 text-ink-soft">{emp.designation || "—"}</td>
                      <td className="px-6 py-3.5 text-ink-soft">{emp.phone || "—"}</td>
                      <td className="px-6 py-3.5 text-right print:hidden whitespace-nowrap">
                        <button
                          onClick={() => setExpandedId(expandedId === emp.id ? null : emp.id)}
                          className="text-ledger hover:text-ledger-hover text-xs font-medium mr-4"
                        >
                          {expandedId === emp.id ? "Hide" : "View"}
                        </button>
                        <Link href={`/admin/employees/${emp.id}/edit`} className="text-ledger hover:text-ledger-hover text-xs font-medium mr-4">
                          Edit
                        </Link>
                        <Link href={`/admin/employees/${emp.id}/delete`} className="text-danger hover:text-danger-hover text-xs font-medium">
                          Delete
                        </Link>
                      </td>
                    </tr>
                    {expandedId === emp.id && (
                      <tr className="border-b border-line last:border-0 bg-ledger/[0.04] print:hidden">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-ink-soft">Father&apos;s Name</p>
                              <p className="text-ink">{emp.fatherName || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-ink-soft">Date of Birth</p>
                              <p className="text-ink">{formatDate(emp.dob)}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-ink-soft">Highest Education</p>
                              <p className="text-ink">{emp.highestEducation || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-ink-soft">Email</p>
                              <p className="text-ink">{emp.email || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-ink-soft">Salary</p>
                              <p className="text-ink font-mono">{formatSalary(emp.salary)}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <p className="text-xs uppercase tracking-wide text-ink-soft">Address</p>
                              <p className="text-ink">{emp.address || "—"}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-ink/40 flex items-start justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-card border border-line rounded-lg p-6 max-w-2xl w-full shadow-lg my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-semibold text-ink">New Employee Record</h3>
              <button
                onClick={() => { setShowForm(false); setError(""); }}
                className="text-ink-soft hover:text-ink text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Username *</label>
                  <input className={inputClass} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Password * (min 6 characters)</label>
                  <input type="password" className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
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

              {error && (
                <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-md px-3 py-2 mt-4">
                  {error}
                </p>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  type="submit"
                  className="bg-ledger hover:bg-ledger-hover text-paper text-sm font-medium rounded-md px-5 py-2.5 transition-colors"
                >
                  Save Employee
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(""); }}
                  className="text-sm border border-line rounded-md px-5 py-2.5 text-ink-soft hover:text-ink hover:border-ink-soft transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showAddConfirm}
        title="Add Employee?"
        message={`Add "${form.fullName}" as a new employee record?`}
        confirmLabel="Add Employee"
        onConfirm={confirmAddEmployee}
        onCancel={() => setShowAddConfirm(false)}
      />

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