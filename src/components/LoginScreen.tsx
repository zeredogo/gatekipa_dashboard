"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ShieldAlert, Loader2 } from "lucide-react";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError("");
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      setError("Invalid administrative credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "hsl(var(--bg-color))",
      color: "hsl(var(--text-main))"
    }}>
      <div className="glass-panel" style={{
        width: "100%",
        maxWidth: "400px",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <div style={{
          width: "60px",
          height: "60px",
          borderRadius: "16px",
          backgroundColor: "hsl(var(--primary-glow))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px"
        }}>
          <ShieldAlert size={30} color="hsl(var(--primary))" />
        </div>
        
        <h1 className="gk-title" style={{ textAlign: "center" }}>Gatekeeper HQ</h1>
        <p className="gk-subtitle" style={{ textAlign: "center", marginBottom: "32px" }}>
          Secure clearance required.
        </p>

        {error && (
          <div style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "hsl(var(--danger-bg))",
            color: "hsl(var(--danger))",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "24px",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "8px", color: "hsl(var(--text-muted))" }}>
              Admin Email
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid hsl(var(--border-color))",
                backgroundColor: "hsl(var(--surface-color))",
                color: "hsl(var(--text-main))",
                fontSize: "14px",
                outline: "none"
              }}
              placeholder="ops@gatekeeper.io"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "8px", color: "hsl(var(--text-muted))" }}>
              Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid hsl(var(--border-color))",
                backgroundColor: "hsl(var(--surface-color))",
                color: "hsl(var(--text-main))",
                fontSize: "14px",
                outline: "none"
              }}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="gk-button"
            disabled={loading}
            style={{ 
              marginTop: "16px", 
              padding: "14px", 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center" 
            }}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Authorize Clearance"}
          </button>
        </form>
      </div>
    </div>
  );
}
