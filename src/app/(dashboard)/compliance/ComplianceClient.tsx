"use client";

import React, { useState } from "react";
import { ShieldCheck, Search } from "lucide-react";

export default function ComplianceClient({ initialReviews }: { initialReviews: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReviews = initialReviews.filter(user => 
    (user.displayName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Compliance & KYC Inbox</h1>
          <p className="text-gray-400 mt-1">Review flagged accounts and manual identity verification requests.</p>
        </div>
      </div>

      {initialReviews.length === 0 ? (
        <div className="glass-panel rounded-2xl overflow-hidden p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-forest-500/10 flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-forest-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Inbox Zero</h3>
          <p className="text-gray-400 max-w-md">There are no pending manual KYC reviews. All active users have successfully completed automated identity verification via QoreID.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or UID..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-forest-500/50 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-sm font-medium text-gray-400">
                <th className="p-4 font-medium">User ID</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No matching users found.</td>
                </tr>
              ) : (
                filteredReviews.map((user: any) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-mono text-gray-300 truncate max-w-[120px]">{user.id}</p>
                    </td>
                    <td className="p-4">{user.displayName}</td>
                    <td className="p-4 text-sm text-gray-400">{user.email || "No email"}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-medium uppercase tracking-wide">
                        {user.kycStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="text-forest-400 hover:text-forest-300 text-sm font-medium">Review</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
