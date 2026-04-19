"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import LoginScreen from "./LoginScreen";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "hsl(var(--bg-color))"
      }}>
        <Loader2 className="animate-spin" size={40} color="hsl(var(--primary))" />
      </div>
    );
  }

  // If no user is logged in, or the user lacks the custom adminRole claim
  if (!user || !isAdmin) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}
