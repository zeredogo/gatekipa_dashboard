"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users, CreditCard, Activity, ArrowRightLeft } from "lucide-react";

export default function Home() {
  const [stats, setStats] = useState({
    users: 0,
    cards: 0,
    transactions: 0,
    activeRequests: 0,
  });

  useEffect(() => {
    // Basic real-time aggregate listeners (For production, use aggregation queries, but snapshot lengths work for prototyping)
    const unsubs = [
      onSnapshot(collection(db, "users"), (snap) => setStats(s => ({ ...s, users: snap.size }))),
      onSnapshot(collection(db, "cards"), (snap) => setStats(s => ({ ...s, cards: snap.size }))),
      onSnapshot(collection(db, "transactions"), (snap) => setStats(s => ({ ...s, transactions: snap.size }))),
      onSnapshot(collection(db, "card_funding_requests"), (snap) => {
        const active = snap.docs.filter(d => d.data().status === "processing" || d.data().status === "unknown_error").length;
        setStats(s => ({ ...s, activeRequests: active }));
      }),
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  return (
    <div>
      <h2 className="gk-title">Platform Overview</h2>
      <p className="gk-subtitle">Real-time metrics from the Gatekeeper backend.</p>

      <div className="metrics-grid">
        <MetricCard title="Total Users" value={stats.users} icon={<Users size={24} color="hsl(var(--primary))" />} />
        <MetricCard title="Issued Virtual Cards" value={stats.cards} icon={<CreditCard size={24} color="hsl(var(--primary))" />} />
        <MetricCard title="Total Transactions" value={stats.transactions} icon={<Activity size={24} color="hsl(var(--success))" />} />
        <MetricCard 
          title="Attention Needed" 
          value={stats.activeRequests} 
          icon={<ArrowRightLeft size={24} color={stats.activeRequests > 0 ? "hsl(var(--danger))" : "hsl(var(--text-muted))"} />} 
          alert={stats.activeRequests > 0}
        />
      </div>

      <div className="gk-card glass-panel">
        <h3 style={{ marginBottom: "16px", fontSize: "16px" }}>System Status</h3>
        <p style={{ color: "hsl(var(--text-muted))", fontSize: "14px" }}>
          Firebase connection established. Webhooks active. App check fully enforcing mobile traffic.
        </p>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, alert = false }: { title: string, value: number, icon: any, alert?: boolean }) {
  return (
    <div className="gk-card glass-panel" style={{ border: alert ? "1px solid hsl(var(--danger) / 0.5)" : undefined, position: "relative", overflow: "hidden" }}>
      {alert && <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: "hsl(var(--danger))" }} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ fontSize: "14px", color: "hsl(var(--text-muted))", fontWeight: 500 }}>{title}</h3>
        {icon}
      </div>
      <p style={{ fontSize: "32px", fontWeight: 700, color: alert ? "hsl(var(--danger))" : "hsl(var(--text-main))" }}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}
