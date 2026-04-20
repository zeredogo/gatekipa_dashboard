"use client";

import { useState, FormEvent, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { auth } from "@/lib/firebase/client";
import { signInWithCustomToken } from "firebase/auth";

export const dynamic = "force-dynamic";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // If browser has stale credentials in the URL (e.g. logout:logout@host), strip them
  useEffect(() => {
    if (window.location.href.includes("@")) {
      window.location.replace(
        window.location.pathname + window.location.search
      );
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Log into Firebase Client SDK to enable Cloud Functions
        if (data.customToken) {
          try {
            await signInWithCustomToken(auth, data.customToken);
          } catch (firebaseErr: any) {
            console.error("Firebase Client Auth failed:", firebaseErr);
            // We can still proceed to routing since server cookies are set, 
            // but interactive functions may fail.
          }
        }

        const from = searchParams.get("from") || "/users";
        router.push(from);
        router.refresh();
      } else {
        setError("Access denied. Invalid administrator credentials.");
        setPassword("");
      }
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-emerald-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-3xl" />
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '32px 32px'}} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
          
          {/* Logo + Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Gatekeeper Control</h1>
            <p className="text-neutral-400 text-sm mt-1.5 font-medium">Restricted Administrative Access</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">
                Administrator Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access credentials"
                  required
                  autoFocus
                  className="w-full pl-11 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              id="login-submit"
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-[0_8px_24px_rgba(16,185,129,0.25)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Authenticate
                </>
              )}
            </button>
          </form>

          <p className="text-center text-neutral-600 text-xs mt-8 font-medium">
            Gatekeeper Admin Portal · Secured Access Only
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
