"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("Incorrect email or password.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 block text-center font-serif text-xl font-semibold text-moss-700"
        >
          Ledgerleaf
        </Link>
        <div className="panel p-7">
          <h1 className="font-serif text-2xl text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-muted">Log in to your dashboard.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            No account?{" "}
            <Link href="/register" className="font-medium text-moss-600 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
