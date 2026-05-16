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
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:py-12 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 sm:gap-8 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 sm:rounded-3xl">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-500">Account</p>
          <h1 className="mt-2 sm:mt-3 text-2xl sm:text-4xl font-semibold text-gray-900">Welcome to Jochenna</h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">
            Sign in to continue checkout faster, keep your profile up to date, and access protected account actions.
          </p>

          <div className="mt-6 sm:mt-8 flex gap-2 rounded-full bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`flex-1 rounded-full px-3 py-2 sm:px-4 text-sm font-medium transition ${
                tab === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setTab("register")}
              className={`flex-1 rounded-full px-3 py-2 sm:px-4 text-sm font-medium transition ${
                tab === "register" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">
            {tab === "register" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg sm:rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg sm:rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg sm:rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="••••••••"
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg sm:rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500"
            >
              {loading
                ? "Please wait..."
                : tab === "login"
                ? "Login"
                : "Create account"}
            </button>
          </form>
        </section>

        <aside className="rounded-2xl sm:rounded-3xl border border-gray-200 bg-linear-to-br from-slate-900 to-gray-800 p-6 text-white shadow-sm sm:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Status</p>
          {user ? (
            <>
              <h2 className="mt-2 sm:mt-3 text-xl sm:text-2xl font-semibold">You are signed in</h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-300">{user.name} · {user.email}</p>
              <Link
                href="/shop"
                className="mt-6 sm:mt-8 inline-flex rounded-lg sm:rounded-full bg-white px-4 py-2 sm:px-5 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                Continue shopping
              </Link>
            </>
          ) : (
            <>
              <h2 className="mt-3 text-2xl font-semibold">Secure auth is active</h2>
              <ul className="mt-5 space-y-3 text-sm text-gray-300">
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
