"use client";

import { useState } from "react";
import { ShieldCheck, Play, UserX, Database } from "lucide-react";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import app from "@/lib/firebase/client";

export default function SecurityRulesTesterPage() {
  const [result, setResult] = useState<any>(null);

  const testRules = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const path = formData.get("path") as string || "/transactions/user1029_mock_tx";
    const operation = formData.get("operation");
    
    // Using standard CLIENT SDK - Not Admin DB! This natively respects security rules.
    const standardDb = getFirestore(app);
    const start = performance.now();

    try {
      if (operation === "READ") {
        await getDoc(doc(standardDb, path));
      } else {
        await setDoc(doc(standardDb, path), { mock: true });
      }

      const time = Math.round(performance.now() - start);
      setResult({
        status: "ALLOWED",
        path,
        reason: "Operation succeeded. The rule engine permitted the query.",
        time: `${time} ms`
      });

    } catch (err: any) {
      const time = Math.round(performance.now() - start);
      
      let failReason = err.message;
      if (err.code === "permission-denied") {
        failReason = "FirebaseError: Missing or insufficient permissions. (Access explicitly denied by firestore.rules)";
      }

      setResult({
        status: "DENIED",
        path,
        reason: failReason,
        time: `${time} ms`
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Security Rules Tester</h2>
          <p className="text-sm text-neutral-500 mt-1">Simulate Firestore security rules without mutating production data.</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm space-y-6">
        <form onSubmit={testRules} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Authenticated UID</label>
            <div className="flex gap-2">
              <input type="text" defaultValue="unauth_user_1029" className="w-full border rounded-lg px-3 py-2 text-sm bg-neutral-50 font-mono" />
              <button disabled className="bg-neutral-100 p-2 rounded-lg border text-neutral-400"><UserX className="w-4 h-4" /></button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Document Path</label>
            <div className="flex gap-2">
              <input type="text" name="path" defaultValue="transactions/user1029_mock_tx" className="w-full border rounded-lg px-3 py-2 text-sm bg-neutral-50 font-mono" />
              <button disabled className="bg-neutral-100 p-2 rounded-lg border text-neutral-400"><Database className="w-4 h-4" /></button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Operation</label>
            <select name="operation" className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
              <option value="WRITE">WRITE (Set/Create)</option>
              <option value="READ">READ (Get)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex justify-center items-center gap-2 font-medium">
              <Play className="w-4 h-4" /> Run Simulation
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-6 border border-rose-200 bg-rose-50 rounded-lg p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-600" />
                <h4 className="font-bold text-rose-900">SIMULATION RESULT: <span className="text-xl bg-rose-600 text-white px-2 py-0.5 rounded ml-2">{result.status}</span></h4>
              </div>
              <span className="text-xs font-mono text-rose-400 bg-rose-100 px-2 py-1 rounded">{result.time}</span>
            </div>
            
            <div className="space-y-2 text-sm font-mono text-rose-800">
              <p><span className="opacity-60">Path Evaluated:</span> {result.path}</p>
              <p><span className="opacity-60">Failing Condition:</span> {result.reason}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
