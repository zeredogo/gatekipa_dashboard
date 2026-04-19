import { adminDb } from "@/lib/firebase/admin";
import { ActivitySquare, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

async function fetchHealthLogs() {
  const logsSnap = await adminDb.collection("health_logs")
    .orderBy("timestamp", "desc")
    .limit(100)
    .get();

  return logsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export default async function HealthPage() {
  const rawLogs = await fetchHealthLogs();
  
  const logs = rawLogs.map(log => ({
    id: log.id,
    time: new Date((log as any).timestamp).toLocaleString(),
    level: (log as any).level || "INFO",
    source: `[${(log as any).source || 'System'}]`,
    message: (log as any).message || "Unknown error occurred"
  }));

  const criticalCount = logs.filter(l => l.level === "CRITICAL").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">System Health & Logs</h2>
          <p className="text-sm text-neutral-500 mt-1">Aggregated Cloud Function logs and telemetry streams.</p>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg flex flex-col font-mono text-sm max-h-[600px]">
        <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-800 flex justify-between items-center text-neutral-400">
          <div className="flex gap-2">
            <ActivitySquare className="w-5 h-5 text-emerald-500" />
            <span>firebase-functions/logger</span>
          </div>
          {criticalCount > 0 && (
            <span className="text-xs uppercase tracking-widest bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-md border border-rose-500/20">
              <AlertTriangle className="w-3 h-3 inline mr-1" /> {criticalCount} Critical
            </span>
          )}
        </div>
        <div className="p-4 space-y-3 overflow-y-auto">
          {logs.map(log => (
            <div key={log.id} className="flex gap-3">
              <span className="text-neutral-500 shrink-0">{log.time}</span>
              <span className={`shrink-0 font-bold ${
                log.level === 'CRITICAL' ? 'text-rose-500' :
                log.level === 'ERROR' ? 'text-rose-400' :
                log.level === 'WARN' ? 'text-amber-400' : 'text-blue-400'
              }`}>[{log.level}]</span>
              <span className="text-purple-400 shrink-0">{log.source}</span>
              <span className="text-neutral-300">{log.message}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <ActivitySquare className="w-8 h-8 text-neutral-800" />
              <span className="text-neutral-500">No system health logs generated yet.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
