"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Users, Wallet, CreditCard, Activity, ShieldAlert, PowerOff, ShieldCheck, ActivitySquare, TerminalSquare, Shield } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navigation = [
    { name: "Users & Accounts", href: "/users", icon: Users },
    { name: "Wallet & Ledger", href: "/wallet", icon: Wallet },
    { name: "Cards Control", href: "/cards", icon: CreditCard },
    { name: "Webhooks Viewer", href: "/webhooks", icon: Activity },
    { name: "Rule Engine", href: "/rules", icon: ShieldAlert },
    { name: "Kill Switch", href: "/kill-switch", icon: PowerOff },
    { name: "Security Simulator", href: "/security", icon: ShieldCheck },
    { name: "System Logs", href: "/health", icon: ActivitySquare },
    { name: "Flow Tester", href: "/e2e", icon: TerminalSquare },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-white selection:bg-emerald-500/20">
      {/* Premium Light Sidebar */}
      <div className="w-72 bg-white/95 backdrop-blur-xl border-r border-neutral-200/60 flex flex-col relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Subtle top glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
        
        <div className="h-20 flex items-center px-8 border-b border-neutral-100 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <Image src="/logo.png" alt="Gatekeeper Logo" width={40} height={40} className="object-contain" priority />
            </div>
            <h1 className="font-bold text-lg text-neutral-900 tracking-tight">
              Gatekeeper
              <span className="text-emerald-600 font-medium ml-1 text-sm">Control</span>
            </h1>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar relative z-10">
          <div className="px-6 mb-3">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Platform Admin</p>
          </div>
          <ul className="space-y-1.5 px-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative ${
                      isActive 
                        ? "text-emerald-800 bg-emerald-50/80 shadow-sm border border-emerald-100/50" 
                        : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                    )}
                    <item.icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? "text-emerald-600" : "text-neutral-400 group-hover:text-emerald-500"}`} />
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* User profile section at bottom */}
        <div className="p-4 border-t border-neutral-100 bg-white/50">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-100 transition-colors hover:bg-neutral-100 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-800 shadow-sm border border-emerald-200">
              SU
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-neutral-900 truncate">Super Admin</p>
              <p className="text-xs text-neutral-500 truncate font-medium">System Authority</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with subtle noise background */}
      <main className="flex-1 overflow-y-auto bg-[#fafafa] relative">
        {/* Decorative background gradient */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100 rounded-full blur-[120px] opacity-40 pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[150px] opacity-60 pointer-events-none transform -translate-x-1/2 translate-y-1/2" />
        
        <div className="relative z-10 p-10 pb-32 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
