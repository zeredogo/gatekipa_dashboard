"use client";

import { useState } from "react";
import { TerminalSquare, Play, RefreshCw, XCircle } from "lucide-react";
import { executeSmokeTest } from "@/app/actions";

export default function FlowTesterPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [showTerminal, setShowTerminal] = useState(false);

  const handleExecute = async (flowCode: string) => {
    setLoading(flowCode);
    setShowTerminal(true);
    setLogs(["[SYSTEM] Initiating remote server execution environment...", "[SYSTEM] Calling executeSmokeTest action..."]);
    
    try {
      const result = await executeSmokeTest(flowCode);
      setLogs((prev) => [...prev, ...result.logs]);
    } catch (e: any) {
      setLogs((prev) => [...prev, `❌ FATAL CLIENT EXCEPTION: ${e.message}`]);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">End-to-End Flow Tester</h2>
          <p className="text-sm text-neutral-500 mt-1">Execute automated E2E simulations on isolated sandbox accounts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: "Fund Wallet Flow", code: "tx_fw_01" },
          { name: "Create Card Flow", code: "cr_virtual_01" },
          { name: "Fund Card Workflow", code: "fund_card_bridge" },
          { name: "Global Kill Switch Test", code: "auth_kill_sw" }
        ].map(flow => (
          <div key={flow.code} className="bg-white border text-center border-neutral-200 rounded-xl p-6 shadow-sm hover:ring-2 ring-indigo-500 transition cursor-pointer">
            <TerminalSquare className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
            <h3 className="font-bold text-neutral-900">{flow.name}</h3>
            <p className="font-mono text-xs text-neutral-500 mt-1">{flow.code}</p>
            <button 
              onClick={() => handleExecute(flow.code)}
              disabled={loading !== null}
              className="mt-4 px-4 py-2 w-full bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-100 transition disabled:opacity-50"
            >
              {loading === flow.code ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              {loading === flow.code ? "Executing..." : "Execute Test"}
            </button>
          </div>
        ))}
      </div>

      {showTerminal && (
        <div className="bg-neutral-950 border text-left mt-8 border-neutral-800 rounded-xl overflow-hidden shadow-2xl flex flex-col font-mono text-sm h-[400px]">
          <div className="bg-black/40 px-4 py-3 border-b border-neutral-800 flex justify-between items-center text-neutral-400">
            <div className="flex gap-2 items-center">
              <TerminalSquare className="w-4 h-4 text-indigo-400" />
              <span className="font-bold tracking-wide text-xs">E2E EXECUTION CONSOLE</span>
            </div>
            <button onClick={() => setShowTerminal(false)} className="hover:text-white transition">
              <XCircle className="w-5 h-5 text-neutral-500 hover:text-rose-400" />
            </button>
          </div>
          <div className="p-4 space-y-2 overflow-y-auto flex-1">
            {logs.map((log, i) => (
              <div key={i} className={`flex gap-3 leading-relaxed ${
                log.includes('EXCEPT') || log.includes('❌') ? 'text-rose-400 font-bold' : 
                log.includes('WARN') ? 'text-amber-400' :
                log.includes('VERIFY') || log.includes('✅') ? 'text-emerald-400 font-bold' : 
                'text-indigo-200'
              }`}>
                <span>{log}</span>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 text-neutral-500 animate-pulse mt-4">
                <span>[SYSTEM] Waiting for underlying server responses...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
