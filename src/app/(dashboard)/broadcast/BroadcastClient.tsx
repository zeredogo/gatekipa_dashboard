"use client";

import React, { useState, useTransition } from "react";
import { MessageSquare, Users, Loader2, Send } from "lucide-react";
import { sendBroadcastNotification } from "@/app/actions/adminActions";

export default function BroadcastClient({ initialUsers }: { initialUsers: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [kycFilter, setKycFilter] = useState("ALL");
  const [planFilter, setPlanFilter] = useState("ALL");
  
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  
  const [channelPush, setChannelPush] = useState(true);
  const [channelInApp, setChannelInApp] = useState(true);
  const [channelWhatsapp, setChannelWhatsapp] = useState(false);
  
  const [isSending, startTransition] = useTransition();

  // Filter users
  const filteredUsers = initialUsers.filter(u => {
    // Search
    const matchesSearch = 
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.displayName || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    // Country
    const uCountry = u.country || "NG"; // Defaulting mostly to NG for Gatekipa
    const matchesCountry = countryFilter === "ALL" || uCountry === countryFilter;
    
    // KYC
    const matchesKyc = kycFilter === "ALL" || 
      (kycFilter === "VERIFIED" && u.isVerified) || 
      (kycFilter === "PENDING" && !u.isVerified);
      
    // Plan
    const matchesPlan = planFilter === "ALL" || u.planTier === planFilter;

    return matchesSearch && matchesCountry && matchesKyc && matchesPlan;
  });

  const handleSend = () => {
    if (!title || !message) {
      alert("Title and message are required.");
      return;
    }
    if (filteredUsers.length === 0) {
      alert("No users match the current filters.");
      return;
    }
    if (!channelPush && !channelInApp && !channelWhatsapp) {
      alert("Select at least one delivery channel.");
      return;
    }

    const confirmMsg = `You are about to send this message to ${filteredUsers.length} users. Proceed?`;
    if (!window.confirm(confirmMsg)) return;

    startTransition(async () => {
      const userIds = filteredUsers.map(u => u.id);
      const result = await sendBroadcastNotification(userIds, title, message, {
        push: channelPush,
        inApp: channelInApp,
        whatsapp: channelWhatsapp
      });

      if (result.success) {
        alert(`Successfully dispatched to ${result.count} users!`);
        setTitle("");
        setMessage("");
      } else {
        alert("Broadcast failed: " + result.error);
      }
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Broadcast Center</h1>
        <p className="text-gray-400 mt-1">Send targeted push notifications, in-app alerts, and WhatsApp messages.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Filters */}
        <div className="glass-panel rounded-2xl p-6 lg:col-span-1 h-fit space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-forest-400" />
            Target Audience
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Search Email / Name</label>
              <input 
                type="text" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-forest-500/50"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 block mb-1">Country</label>
              <select 
                value={countryFilter}
                onChange={e => setCountryFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-forest-500/50"
              >
                <option value="ALL" className="bg-black text-white">All Countries</option>
                <option value="NG" className="bg-black text-white">Nigeria</option>
                <option value="GH" className="bg-black text-white">Ghana</option>
                <option value="US" className="bg-black text-white">United States</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">KYC Status</label>
              <select 
                value={kycFilter}
                onChange={e => setKycFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-forest-500/50"
              >
                <option value="ALL" className="bg-black text-white">All Statuses</option>
                <option value="VERIFIED" className="bg-black text-white">Verified</option>
                <option value="PENDING" className="bg-black text-white">Unverified / Pending</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Plan Tier</label>
              <select 
                value={planFilter}
                onChange={e => setPlanFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-forest-500/50"
              >
                <option value="ALL" className="bg-black text-white">All Plans</option>
                <option value="instant" className="bg-black text-white">Instant (Free)</option>
                <option value="premium" className="bg-black text-white">Premium</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="flex justify-between items-center bg-forest-500/10 border border-forest-500/20 p-4 rounded-xl">
              <span className="text-sm font-medium text-forest-400">Target Users</span>
              <span className="text-2xl font-bold text-white">{filteredUsers.length}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Composer */}
        <div className="glass-panel rounded-2xl p-6 lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Message Composer
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Delivery Channels</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 bg-white/5 px-4 py-3 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                  <input type="checkbox" checked={channelPush} onChange={e => setChannelPush(e.target.checked)} className="rounded bg-black border-white/20 text-forest-500 focus:ring-forest-500/50" />
                  <span className="text-sm text-white font-medium">Push Notification</span>
                </label>
                <label className="flex items-center gap-2 bg-white/5 px-4 py-3 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                  <input type="checkbox" checked={channelInApp} onChange={e => setChannelInApp(e.target.checked)} className="rounded bg-black border-white/20 text-forest-500 focus:ring-forest-500/50" />
                  <span className="text-sm text-white font-medium">In-App Alert</span>
                </label>
                <label className="flex items-center gap-2 bg-[#25D366]/10 px-4 py-3 rounded-xl border border-[#25D366]/30 cursor-pointer hover:bg-[#25D366]/20 transition-colors">
                  <input type="checkbox" checked={channelWhatsapp} onChange={e => setChannelWhatsapp(e.target.checked)} className="rounded bg-black border-white/20 text-[#25D366] focus:ring-[#25D366]/50" />
                  <span className="text-sm text-[#25D366] font-medium">WhatsApp (tabi.africa)</span>
                </label>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Message Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. System Maintenance Update"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-forest-500/50 transition-all text-lg font-medium"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Message Body</label>
                <textarea 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-forest-500/50 transition-all resize-none"
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={handleSend}
                disabled={isSending || filteredUsers.length === 0}
                className="w-full bg-forest-500 hover:bg-forest-600 text-white rounded-xl py-4 font-bold text-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isSending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Dispatching...</>
                ) : (
                  <><Send className="w-5 h-5" /> Send to {filteredUsers.length} Users</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
