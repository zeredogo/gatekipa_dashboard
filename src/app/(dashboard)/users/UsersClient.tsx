"use client";

import React, { useState, useTransition } from "react";
import { Users, Search, Filter, Ban, CheckCircle, Loader2 } from "lucide-react";
import { toggleUserBlockStatus, sendInAppNotification } from "@/app/actions/adminActions";
import { toast } from "react-hot-toast";

export default function UsersClient({ initialUsers }: { initialUsers: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState(initialUsers);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [isSendingNotification, setIsSendingNotification] = useState(false);


  const handleSendNotification = async () => {
    if (!notificationTitle || !notificationBody) return toast.error("Title and Message are required");
    setIsSendingNotification(true);
    const result = await sendInAppNotification(selectedUser.id, notificationTitle, notificationBody);
    if (result.success) {
      toast.success("Notification sent successfully!");
      setNotificationTitle("");
      setNotificationBody("");
    } else {
      toast.error("Failed to send notification: " + result.error);
    }
    setIsSendingNotification(false);
  };

  const handleToggleBlock = (userId: string, currentStatus: string) => {
    setPendingUserId(userId);
    startTransition(async () => {
      const result = await toggleUserBlockStatus(userId, currentStatus);
      if (result.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: result.status } : u));
        toast.success(`User successfully ${result.status}`);
      } else {
        toast.error("Failed to update user block status");
      }
      setPendingUserId(null);
    });
  };

  const filteredUsers = users.filter(u => 
    (u.displayName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Users & KYC</h1>
          <p className="text-gray-400 mt-1">Manage platform users, verify identities, and review account statuses.</p>
        </div>
        <div className="flex gap-3">

          <button className="flex items-center gap-2 bg-forest-500 hover:bg-forest-600 text-white px-4 py-2 rounded-xl transition-colors font-medium">
            <Users className="w-4 h-4" />
            Export Users
          </button>
        </div>
      </div>

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
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">KYC Status</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan Tier</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-forest-500 to-indigo-500 flex items-center justify-center font-bold text-white">
                          {user.displayName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.displayName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {user.isVerified ? (
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">Verified</span>
                      ) : (
                        <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-medium">Pending</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-300 capitalize">{user.planTier}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-400">{user.createdAt}</span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="text-forest-400 hover:text-forest-300 text-sm font-medium"
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => handleToggleBlock(user.id, user.status || "active")}
                        disabled={pendingUserId === user.id}
                        className={`text-sm font-medium flex items-center gap-1 disabled:opacity-50 ${user.status === 'blocked' ? 'text-emerald-400 hover:text-emerald-300' : 'text-rose-400 hover:text-rose-300'}`}
                      >
                        {pendingUserId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          user.status === 'blocked' ? <><CheckCircle className="w-4 h-4" /> Unblock</> : <><Ban className="w-4 h-4" /> Block</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel p-8 rounded-3xl max-w-md w-full border border-white/10 shadow-2xl relative">
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">User Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">User ID</p>
                <p className="text-white font-mono text-sm">{selectedUser.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="text-white font-medium">{selectedUser.displayName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Joined</p>
                <p className="text-white">{selectedUser.createdAt}</p>
              </div>
              <div className="pt-4 border-t border-white/10 mt-4">
                <h3 className="text-lg font-bold text-white mb-3">Send Notification</h3>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Notification Title" 
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-forest-500/50"
                  />
                  <textarea 
                    placeholder="Message Body" 
                    value={notificationBody}
                    onChange={(e) => setNotificationBody(e.target.value)}
                    rows={3}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-forest-500/50"
                  />
                  <button 
                    onClick={handleSendNotification}
                    disabled={isSendingNotification}
                    className="w-full bg-forest-500 hover:bg-forest-600 text-white rounded-xl py-2 text-sm font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {isSendingNotification && <Loader2 className="w-4 h-4 animate-spin" />}
                    Send Push & In-App Alert
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
