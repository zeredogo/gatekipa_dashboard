import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { User, Shield, AlertTriangle, Fingerprint, MailCheck, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

async function fetchUsers() {
  try {
    const [usersSnap, authUsersList] = await Promise.all([
      adminDb.collection("users").get(),
      adminAuth.listUsers(1000)
    ]);
    
    // Create a fast lookup map for auth users
    const authMap = new Map();
    authUsersList.users.forEach(u => authMap.set(u.uid, u));

    return usersSnap.docs.map((doc) => {
      const data = doc.data();
      const authUser = authMap.get(doc.id);

      return {
        id: doc.id,
        ...data,
        emailVerified: authUser?.emailVerified || false,
        disabled: authUser?.disabled || false,
        customClaims: authUser?.customClaims || {},
      };
    });
  } catch (err: any) {
    console.warn("Failed to fetch users:", err.message);
    return [];
  }
}

export default async function UsersPage() {
  const users = await fetchUsers();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 to-emerald-600">User & Account Inspector</h2>
          <p className="text-neutral-500 mt-2 text-sm max-w-xl leading-relaxed">Review KYC, Email verification, and RBAC anomalies natively with deep integration into the authentication sub-system.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold shadow-sm border border-emerald-100">
          <ShieldCheck className="w-4 h-4" /> System Verified
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md border border-neutral-200/60 rounded-2xl shadow-xl overflow-hidden">
        <ul className="divide-y divide-neutral-100/80">
          {users.map((user: any, idx: number) => {
            const hasKycWarning = !user.kycStatus || user.kycStatus !== 'verified';
            const hasEmailWarning = !user.emailVerified;

            return (
              <li key={user.id} className="p-6 transition-all duration-300 hover:bg-white hover:shadow-[0_0_20px_rgba(0,0,0,0.03)] relative group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl shadow-sm border border-emerald-100/50 group-hover:scale-105 transition-transform">
                      {user.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900 flex items-center gap-2 text-lg">
                        {user.displayName || "Unregistered Entity"}
                        {user.customClaims?.admin && (
                          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-[10px] px-2.5 py-1 rounded-full font-bold tracking-widest uppercase shadow-sm">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-1 font-medium">
                        <MailCheck className="w-3.5 h-3.5 opacity-60" /> {user.email}
                      </p>
                      <div className="mt-4 flex items-center gap-2.5">
                        <span className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border ${hasKycWarning ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm' : 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'}`}>
                          <Fingerprint className="w-3 h-3" /> KYC: {user.kycStatus || "unverified"}
                        </span>
                        <span className={`text-[11px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border shadow-sm ${hasEmailWarning ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                          Email: {hasEmailWarning ? "unverified" : "verified"}
                        </span>
                        {!user.bvn && (
                          <span className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border bg-rose-50 text-rose-700 border-rose-200 shadow-sm">
                            <AlertTriangle className="w-3 h-3" /> No BVN Linked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="px-4 py-2 text-sm font-bold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 rounded-xl transition-all hover-lift border border-emerald-200/60 shadow-sm">
                      View Accounts
                    </button>
                    <button className="px-4 py-2 text-sm font-bold text-neutral-700 bg-white hover:bg-neutral-50 rounded-xl transition-all hover-lift border border-neutral-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                      Impersonate
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
          {users.length === 0 && (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">No Users Found</h3>
              <p className="text-neutral-500 mt-1 max-w-sm">The user directory is currently empty. Waiting for sync.</p>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}
