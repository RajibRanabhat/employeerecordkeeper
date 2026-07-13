"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Seal } from "@/components/Seal";

type Employee = {
  id: number;
  fullName: string;
  designation: string | null;
  email: string | null;
  phone: string | null;
  user: { username: string };
};

export default function DeleteEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEmployee() {
      const res = await fetch(`/api/employees/${id}`);
      if (!res.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setEmployee(await res.json());
      setLoading(false);
    }
    loadEmployee();
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    setError("");

    const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });

    if (!res.ok) {
      setError("Failed to delete employee. Try again.");
      setDeleting(false);
      return;
    }

    router.push("/admin/employees");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-ink-soft">Loading employee record…</p>
      </main>
    );
  }

  if (notFound || !employee) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink mb-4">No employee found with that ID.</p>
          <button onClick={() => router.push("/admin/employees")} className="text-ledger hover:text-ledger-hover font-medium text-sm">
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

      <div className="max-w-lg mx-auto px-6 py-8">
        <button onClick={() => router.push("/admin/employees")} className="text-sm text-ink-soft hover:text-ink mb-4 inline-block">
          ← Back to Employee Register
        </button>

        <div className="bg-card border border-danger/30 rounded-lg p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-danger mb-1">Delete Employee Record</h2>
          <p className="text-sm text-ink-soft mb-6">
            This will permanently remove this employee and their login access. This action cannot be undone.
          </p>

          <div className="border border-line rounded-md p-4 mb-6 bg-paper">
            <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
              <span className="text-ink-soft uppercase text-xs tracking-wide">Emp ID</span>
              <span className="font-mono text-ink">{employee.id}</span>

              <span className="text-ink-soft uppercase text-xs tracking-wide">Name</span>
              <span className="text-ink font-medium">{employee.fullName}</span>

              <span className="text-ink-soft uppercase text-xs tracking-wide">Username</span>
              <span className="font-mono text-ink">@{employee.user.username}</span>

              <span className="text-ink-soft uppercase text-xs tracking-wide">Designation</span>
              <span className="text-ink">{employee.designation || "—"}</span>

              <span className="text-ink-soft uppercase text-xs tracking-wide">Phone</span>
              <span className="text-ink">{employee.phone || "—"}</span>

              <span className="text-ink-soft uppercase text-xs tracking-wide">Email</span>
              <span className="text-ink">{employee.email || "—"}</span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-md px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-danger hover:bg-danger-hover disabled:opacity-60 text-paper text-sm font-medium rounded-md px-5 py-2.5 transition-colors"
            >
              {deleting ? "Deleting..." : "Confirm Delete"}
            </button>
            <button
              onClick={() => router.push("/admin/employees")}
              className="text-sm border border-line rounded-md px-5 py-2.5 text-ink-soft hover:text-ink hover:border-ink-soft transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}