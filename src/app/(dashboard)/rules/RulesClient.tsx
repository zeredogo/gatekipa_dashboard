"use client";

import React, { useState, useTransition } from "react";
import { Sliders, Settings, Loader2, Save } from "lucide-react";
import { updateFeeConfiguration } from "@/app/actions/adminActions";

export default function RulesClient({ systemState, initialFees }: { systemState: any, initialFees: any }) {
  const [fee, setFee] = useState(initialFees?.cardCreationFee || 2.00);
  const [isPending, startTransition] = useTransition();

  const handleSaveFee = () => {
    startTransition(async () => {
      const result = await updateFeeConfiguration(Number(fee));
      if (!result.success) {
        alert("Failed to update fee: " + result.error);
      }
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">System Rules & Limits</h1>
        <p className="text-gray-400 mt-1">Configure global transaction limits, fee tiers, and platform logic.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-forest-500/10 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-forest-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Global State</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div>
                <p className="text-white font-medium">Platform Mode</p>
                <p className="text-xs text-gray-400">Current operational state.</p>
              </div>
              <span className={`px-2 py-1 ${systemState?.mode === 'LOCKDOWN' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'} border rounded-full text-xs font-medium uppercase`}>
                {systemState?.mode || "NORMAL"}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Fee Configuration</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div>
                <p className="text-white font-medium">Card Creation Fee (USD)</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-20 bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-right focus:outline-none focus:border-forest-500/50"
                />
                <button 
                  onClick={handleSaveFee}
                  disabled={isPending || Number(fee) === initialFees?.cardCreationFee}
                  className="ml-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 p-1.5 rounded transition-colors disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
