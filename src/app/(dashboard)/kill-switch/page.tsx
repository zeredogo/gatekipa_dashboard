"use client";

import { useState } from "react";
import { PowerOff, AlertTriangle, ShieldAlert } from "lucide-react";

export default function KillSwitchPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGlobalKillSwitch = async () => {
    const code = window.prompt("Type 'CONFIRM_GLOBAL_LOCK' to execute network-wide kill switch:");
    if (code !== "CONFIRM_GLOBAL_LOCK") return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/kill-switch", { method: "POST" });
      const payload = await res.json();

      if (!res.ok) {
        setResult({
          success: false,
          message: payload.error || "Server error occurred.",
          totalProcessed: "—", frozen: "—", failed: "—",
        });
        return;
      }

      setResult({
        success: true,
        message: "All active cards were successfully frozen globally.",
        totalProcessed: payload.processed,
        frozen: payload.frozen,
        failed: payload.failed,
      });
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || "Unknown error occurred",
        totalProcessed: "—", frozen: "—", failed: "—",
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
      </div>

      <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 shadow-sm text-center space-y-6">
        <div className="flex justify-center">
          <ShieldAlert className="w-16 h-16 text-rose-600" />
        </div>
        <div className="max-w-xl mx-auto space-y-3">
          <h3 className="text-2xl font-black text-rose-900 tracking-tight">GLOBAL NETWORK KILL SWITCH</h3>
          <p className="text-rose-700 font-medium">Use this ONLY in the event of an active, system-wide exploit. This will immediately freeze EVERY active virtual card on the Gateway and block all Wallet transactions.</p>
        </div>
        
        <div className="pt-4">
          <button 
            onClick={handleGlobalKillSwitch}
            disabled={loading}
            className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-lg uppercase tracking-widest shadow-xl shadow-rose-600/30 transition disabled:opacity-50 ring-4 ring-rose-200"
          >
            {loading ? "EXECUTING OVERRIDE..." : "ENGAGE KILL SWITCH"}
          </button>
        </div>
      </div>

      {result && (
        <div className={`mt-8 border-2 rounded-xl p-6 ${result.success ? 'border-emerald-500 bg-emerald-50' : 'border-amber-500 bg-amber-50'}`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${result.success ? 'text-emerald-800' : 'text-amber-800'}`}>
            {result.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />}
            {result.success ? 'NETWORK LOCKED SECURELY' : 'PARTIAL FAILURE DETECTED'}
          </h3>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm text-center">
              <div className="text-3xl font-black text-neutral-800">{result.totalProcessed}</div>
              <div className="text-xs text-neutral-500 uppercase tracking-widest font-bold mt-1">Cards Targeted</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-sm text-center">
              <div className="text-3xl font-black text-emerald-600">{result.frozen}</div>
              <div className="text-xs text-emerald-600 uppercase tracking-widest font-bold mt-1">Successfully Frozen</div>
            </div>
            <div className={`bg-white p-4 rounded-lg border shadow-sm text-center ${result.failed > 0 ? 'border-rose-300 ring-2 ring-rose-100' : 'border-neutral-200'}`}>
              <div className={`text-3xl font-black ${result.failed > 0 ? 'text-rose-600' : 'text-neutral-500'}`}>{result.failed}</div>
              <div className={`text-xs uppercase tracking-widest font-bold mt-1 ${result.failed > 0 ? 'text-rose-600' : 'text-neutral-500'}`}>API Failures</div>
            </div>
          </div>

          {!result.success && (
            <div className="bg-white border border-rose-200 rounded-lg p-4 font-mono text-sm text-rose-800 shadow-sm">
              <span className="font-bold mr-2 text-rose-600">&gt; RUNTIME EXCEPTION:</span>
              {result.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CheckCircle2(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
}
