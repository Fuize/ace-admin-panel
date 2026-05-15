"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import webBg from "../../../assets/webbg.png";
import webIcon from "../../../assets/ACEtransparent.png";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const username = (form.elements.namedItem("username") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    setError(null);

    setLoading(true);

    try {
      const response = await fetch("/api/auth/username-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = typeof body?.error === "string" ? body.error : "Wrong username or password";
        setError(message === "Login is not available right now." || message === "Account disabled" || message === "Access denied" ? message : "Wrong username or password");
        return;
      }

      window.location.href = "/panel";
    } catch {
      setError("Wrong username or password");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "mt-1 w-full rounded-lg border border-white/15 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-100 shadow-inner shadow-black/20 transition placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-zinc-950 px-4 py-8">
      <Image src={webBg} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(14,165,233,.22),transparent_32%),linear-gradient(115deg,rgba(3,7,18,.94),rgba(3,7,18,.74)_48%,rgba(3,7,18,.92))]" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative w-[430px] max-w-full rounded-xl border border-white/12 bg-zinc-950/72 p-6 shadow-[0_24px_90px_rgba(0,0,0,.55)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <Image src={webIcon} alt="ACE" width={52} height={52} className="h-12 w-12 object-contain" priority />
          <div>
            <div className="text-xl font-semibold text-zinc-50">ACE Admin Panel</div>
            <div className="mt-1 text-sm text-zinc-300">Authorized staff access</div>
          </div>
        </div>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="username" className="text-sm font-medium text-zinc-200">Username</label>
            <input id="username" name="username" className={inputClass} placeholder="Enter username" autoComplete="username" required disabled={loading} />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-zinc-200">Password</label>
            <input id="password" name="password" type="password" className={inputClass} placeholder="Enter password" autoComplete="current-password" required disabled={loading} />
          </div>
          {error ? (
            <div className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border border-sky-300/25 bg-sky-400/18 py-3 text-sm font-semibold text-sky-50 transition hover:bg-sky-400/25 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
