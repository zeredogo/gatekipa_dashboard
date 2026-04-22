"use client";

import { useState, useEffect } from "react";
import { PowerOff, AlertTriangle, ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";

export default function KillSwitchPage() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<string>("LOADING");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchMode();
  }, []);

  const fetchMode = async () => {
    try {
      const res = await fetch("/api/kill-switch");
      const data = await res.json();
      if (data.success) {
        setMode(data.mode);
      } else {
        setMode("ERROR");
      }
    } catch (e) {
      setMode("ERROR");
    }
  };

  const toggleMode = async (targetMode: string) => {
    const action = targetMode === "LOCKDOWN" ? "ENGAGE" : "DISENGAGE";
    const code = window.prompt(`Type 'CONFIRM_${action}' to proceed:`);
    if (code !== `CONFIRM_${action}`) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/kill-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: targetMode }),
      });
      const payload = await res.json();

      if (!res.ok || !payload.success) {
        setResult({
          success: false,
          message: payload.error || "Server error occurred.",
        });
        return;
      }

      setMode(payload.mode);
      setResult({
        success: true,
        message: payload.message,
      });
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-rose-700 tracking-tight flex items-center gap-2">
            <PowerOff className="w-6 h-6" /> Emergency Interventions
          </h2>
          <p className="text-sm text-neutral-500 mt-1">Global administrative kill-switches and network-wide locks.</p>
        </div>
        <button onClick={fetchMode} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition font-bold">
          <RefreshCw className={`w-4 h-4 ${mode === 'LOADING' ? 'animate-spin' : ''}`} /> Refresh Status
        </button>
      </div>

      <div className={`border rounded-xl p-8 shadow-sm text-center space-y-6 transition-colors ${
        mode === "LOCKDOWN" 
          ? "bg-rose-50 border-rose-200" 
          : "bg-emerald-50 border-emerald-200"
      }`}>
        <div className="flex justify-center">
          {mode === "LOCKDOWN" ? (
            <ShieldAlert className="w-16 h-16 text-rose-600 animate-pulse" />
          ) : (
            <CheckCircle2 className="w-16 h-16 text-emerald-600" />
          )}
        </div>
        <div className="max-w-xl mx-auto space-y-3">
          <h3 className={`text-2xl font-black tracking-tight ${mode === "LOCKDOWN" ? "text-rose-900" : "text-emerald-900"}`}>
            {mode === "LOCKDOWN" ? "NETWORK IS LOCKED DOWN" : "SYSTEM IS HEALTHY"}
          </h3>
          <p className={`font-medium ${mode === "LOCKDOWN" ? "text-rose-700" : "text-emerald-700"}`}>
            {mode === "LOCKDOWN" 
              ? "All incoming Bridgecard and Paystack webhooks are currently being rejected. The network is frozen." 
              : "All systems are operating normally. Webhooks and transactions are being processed."}
          </p>
        </div>
        
        <div className="pt-4 flex justify-center gap-4">
          {mode === "NORMAL" ? (
            <button 
              onClick={() => toggleMode("LOCKDOWN")}
              disabled={loading}
              className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-lg uppercase tracking-widest shadow-xl shadow-rose-600/30 transition disabled:opacity-50 ring-4 ring-rose-200"
            >
              {loading ? "EXECUTING OVERRIDE..." : "ENGAGE KILL SWITCH"}
            </button>
          ) : (
            <button 
              onClick={() => toggleMode("NORMAL")}
              disabled={loading}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-lg uppercase tracking-widest shadow-xl shadow-emerald-600/30 transition disabled:opacity-50 ring-4 ring-emerald-200"
            >
              {loading ? "RESTORING..." : "RESTORE NETWORK"}
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className={`mt-8 border-2 rounded-xl p-6 ${result.success ? 'border-neutral-200 bg-white' : 'border-amber-500 bg-amber-50'}`}>
          <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${result.success ? 'text-neutral-800' : 'text-amber-800'}`}>
            {result.success ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />}
            {result.success ? 'OPERATION SUCCESSFUL' : 'OPERATION FAILED'}
          </h3>
          <p className="text-neutral-600 font-medium">{result.message}</p>
        </div>
      )}
    </div>
  );
}
