"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/shore/authStore";
import { useFeedbackStore } from "@/shore/feedbackStore";

type AuthTab = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<AuthTab>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);
  const user = useAuthStore((state) => state.user);
  const pushToast = useFeedbackStore((state) => state.pushToast);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password.trim()) {
      pushToast("Email and password are required.");
      return;
    }

    if (tab === "register" && !name.trim()) {
      pushToast("Name is required for registration.");
      return;
    }

    const result =
      tab === "login"
        ? await login(normalizedEmail, password)
        : await register(name.trim(), normalizedEmail, password);

    pushToast(result.message);

    if (result.ok) {
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen bg-paper px-4 py-8 sm:py-12 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 sm:gap-8 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-2xl border border-hairline bg-white p-6 shadow-sm sm:p-8 sm:rounded-3xl">
          <p className="text-xs uppercase tracking-[0.28em] text-ink-soft">Account</p>
          <h1 className="mt-2 sm:mt-3 text-2xl sm:text-4xl font-semibold text-ink">Welcome to Jochenna</h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-ink-soft">
            Sign in to continue checkout faster, keep your profile up to date, and access protected account actions.
          </p>

          <div className="mt-6 sm:mt-8 flex gap-2 rounded-full bg-paper p-1">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`flex-1 rounded-full px-3 py-2 sm:px-4 text-sm font-medium transition ${
                tab === "login" ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setTab("register")}
              className={`flex-1 rounded-full px-3 py-2 sm:px-4 text-sm font-medium transition ${
                tab === "register" ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">
            {tab === "register" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-ink">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg sm:rounded-xl border border-hairline px-4 py-3 text-ink outline-none transition focus:ring-2 focus:ring-ink focus:border-transparent"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-ink">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg sm:rounded-xl border border-hairline px-4 py-3 text-ink outline-none transition focus:ring-2 focus:ring-ink focus:border-transparent"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg sm:rounded-xl border border-hairline px-4 py-3 text-ink outline-none transition focus:ring-2 focus:ring-ink focus:border-transparent"
                placeholder="••••••••"
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg sm:rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:bg-ink-soft"
            >
              {loading
                ? "Please wait..."
                : tab === "login"
                ? "Login"
                : "Create account"}
            </button>
          </form>
        </section>

        <aside className="rounded-2xl sm:rounded-3xl border border-hairline bg-linear-to-br from-ink to-ink p-6 text-white shadow-sm sm:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-ink-soft">Status</p>
          {user ? (
            <>
              <h2 className="mt-2 sm:mt-3 text-xl sm:text-2xl font-semibold">You are signed in</h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-ink-soft">{user.name} · {user.email}</p>
              <Link
                href="/shop"
                className="mt-6 sm:mt-8 inline-flex rounded-lg sm:rounded-full bg-white px-4 py-2 sm:px-5 text-sm font-semibold text-ink transition hover:bg-paper"
              >
                Continue shopping
              </Link>
            </>
          ) : (
            <>
              <h2 className="mt-3 text-2xl font-semibold">Secure auth is active</h2>
              <ul className="mt-5 space-y-3 text-sm text-ink-soft">
                <li>POST /api/auth/register</li>
                <li>POST /api/auth/login</li>
                <li>GET /api/auth/me</li>
                <li>POST /api/auth/seed</li>
              </ul>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
