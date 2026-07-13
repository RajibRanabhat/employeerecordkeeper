"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Seal } from "@/components/Seal";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"ADMIN" | "EMPLOYEE">("ADMIN");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      if (data.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-paper">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Seal size={48} />
          <h1 className="font-display text-2xl font-semibold text-ink mt-4">Employee Record Keeper</h1>
          <p className="text-sm text-ink-soft mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-line rounded-lg p-8 shadow-sm">
          <div className="mb-4">
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5">
              Login As
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "ADMIN" | "EMPLOYEE")}
              className="w-full border border-line rounded-md px-3 py-2 text-ink bg-card focus:outline-none focus:ring-2 focus:ring-ledger focus:border-ledger transition-colors"
            >
              <option value="ADMIN">Admin</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ledger focus:border-ledger transition-colors"
              placeholder="Enter your username"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ledger focus:border-ledger transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-md px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ledger hover:bg-ledger-hover disabled:opacity-60 text-paper font-medium rounded-md py-2.5 transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}