"use client";

import { useState } from "react";
import { ShieldAlert, Play, CheckCircle2, XCircle, Code2, ShieldCheck, TerminalSquare } from "lucide-react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/client";

export default function RuleEngineDebuggerPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSimulate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      card_id: formData.get("card_id"),
      amount: formData.get("amount"),
      merchant_name: formData.get("merchant_name"),
      currency: formData.get("currency"),
      channel: formData.get("channel"),
    };

    try {
      const simulateFn = httpsCallable(functions, "adminSimulateRuleEngine");
      const res = await simulateFn(payload);
      setResult(res.data);
    } catch (err: any) {
      console.error(err);
      setResult({
        decision: "ERROR",
        reason: err.message,
        evaluations: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 to-emerald-600 flex items-center gap-3">
            <TerminalSquare className="w-8 h-8 text-emerald-700" /> Rule Engine Debugger
          </h2>
          <p className="text-neutral-500 mt-2 text-sm max-w-xl leading-relaxed">Audit hidden policy evaluations and transaction triggers natively. Ensure compliance before live deployment.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <form onSubmit={handleSimulate} className="bg-white/70 backdrop-blur-xl border border-neutral-200/60 rounded-2xl shadow-xl p-8 space-y-6">
          <h3 className="font-bold text-lg text-neutral-900 border-b border-neutral-200/60 pb-4 mb-6 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-600" /> Simulate Payload
          </h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Target Card ID</label>
              <input type="text" name="card_id" placeholder="e.g. card_xyz123" required className="w-full px-5 py-3 bg-white/50 border border-neutral-200/80 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none shadow-sm" />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Amount</label>
                <input type="number" name="amount" placeholder="5000" required className="w-full px-5 py-3 bg-white/50 border border-neutral-200/80 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none shadow-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Currency</label>
                <input type="text" name="currency" defaultValue="NGN" className="w-full px-5 py-3 bg-neutral-100/50 border border-neutral-200/50 rounded-xl outline-none text-neutral-500 font-medium" readOnly />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Merchant Name</label>
              <input type="text" name="merchant_name" placeholder="e.g. Amazon US" required className="w-full px-5 py-3 bg-white/50 border border-neutral-200/80 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none shadow-sm" />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Transaction Time (WAT)</label>
                <input type="time" name="time" defaultValue="03:00" className="w-full px-5 py-3 bg-white/50 border border-neutral-200/80 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none shadow-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Channel</label>
                <select name="channel" className="w-full px-5 py-3 bg-white/50 border border-neutral-200/80 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none shadow-sm appearance-none cursor-pointer">
                  <option value="POS">POS Terminal</option>
                  <option value="WEB">Online / Web</option>
                  <option value="ATM">ATM Withdrawal</option>
                </select>
              </div>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full mt-6 flex justify-center items-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all hover-lift disabled:opacity-50 disabled:hover-lift-none shadow-[0_8px_20px_rgba(16,185,129,0.25)]">
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <><Play className="w-4 h-4" /> Inject Simulation</>
            )}
          </button>
        </form>

        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 text-neutral-50 flex flex-col font-mono relative overflow-hidden h-full min-h-[500px]">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <ShieldAlert className="w-48 h-48 text-emerald-500" />
          </div>
          
          <div className="flex justify-between items-center border-b border-neutral-800/80 pb-4 mb-6 z-10">
            <h3 className="font-bold text-lg text-emerald-400 flex items-center gap-2 tracking-tight">
              <TerminalSquare className="w-5 h-5" /> Execution Trace
            </h3>
            {result && (
              <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,0,0,0.5)] ${result.decision === 'BLOCKED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                {result.decision}
              </span>
            )}
          </div>

          <div className="flex-1 space-y-4 z-10 overflow-auto custom-scrollbar">
            {!result && !loading && (
              <div className="text-neutral-600 flex flex-col items-center justify-center h-full space-y-4 py-20">
                <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                  <TerminalIcon className="w-6 h-6 opacity-30" />
                </div>
                <p className="text-sm tracking-widest uppercase">System Standby</p>
              </div>
            )}
            {loading && (
              <div className="text-emerald-400/80 animate-pulse-slow space-y-3 text-sm">
                <p className="flex gap-2"><span className="text-neutral-600">❯</span> Initializing Gatekeeper Rule Engine...</p>
                <p className="flex gap-2"><span className="text-neutral-600">❯</span> Authenticating administrative override...</p>
                <p className="flex gap-2"><span className="text-neutral-600">❯</span> Building isolated execution context...</p>
                <p className="flex gap-2"><span className="text-neutral-600">❯</span> Evaluating /rules deterministic matrices...</p>
              </div>
            )}
            {result && !loading && (
              <div className="space-y-6 text-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-emerald-500/60 font-medium tracking-wider uppercase text-xs">Evaluation Output</p>
                <ul className="space-y-3">
                  {result.evaluations?.map((ev: any, idx: number) => {
                    const isPass = ev.result.startsWith('PASS');
                    return (
                      <li key={idx} className="flex gap-4 bg-neutral-900/50 p-4 rounded-xl border border-neutral-800/80 backdrop-blur-sm transition-all hover:bg-neutral-900 hover:border-neutral-700">
                        {isPass ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 shadow-emerald-500/20" /> : <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                        <div className="flex-1">
                          <div className="text-neutral-300 font-bold mb-1">{ev.rule}</div>
                          <div className={`text-xs ${isPass ? "text-emerald-400/80" : "text-rose-400/80"}`}>{ev.result}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                
                <div className="mt-8 pt-6 border-t border-neutral-800/80 bg-neutral-900/30 -mx-8 px-8 -mb-8 pb-8">
                  <p className="text-neutral-500 mb-2 text-xs tracking-widest uppercase">Resolution Signal</p>
                  {result.decision === 'BLOCKED' ? (
                    <>
                      <p className="text-rose-400 font-bold text-lg tracking-tight flex items-center gap-2">
                         ACTION: PAYLOAD REJECTED
                      </p>
                      <p className="text-rose-300/80 font-medium ml-2 border-l-2 border-rose-500/50 pl-4 my-3 py-1 bg-rose-950/20 rounded-r-lg text-sm">{result.reason}</p>
                    </>
                  ) : (
                    <p className="text-emerald-400 font-bold text-lg tracking-tight flex items-center gap-2">
                       ACTION: PAYLOAD APPROVED
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TerminalIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" x2="20" y1="19" y2="19" />
    </svg>
  );
}
