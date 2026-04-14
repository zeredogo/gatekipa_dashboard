"use client";

import { Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function TopNav() {
  const { logout } = useAuth();

  return (
    <header className="top-nav" style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', background: 'hsl(var(--surface-color))', border: '1px solid hsl(var(--border-color))', borderRadius: '8px', padding: '8px 16px', width: '300px' }}>
        <Search size={18} color="hsl(var(--text-muted))" style={{ marginRight: '8px' }} />
        <input 
          type="text" 
          placeholder="Search users, cards, refs..." 
          style={{ background: 'transparent', border: 'none', color: 'hsl(var(--text-main))', outline: 'none', width: '100%', fontSize: '14px' }} 
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button style={{ position: 'relative', color: 'hsl(var(--text-muted))' }}>
          <Bell size={20} />
          <span style={{ position: 'absolute', top: -2, right: -2, background: 'hsl(var(--danger))', width: '8px', height: '8px', borderRadius: '50%' }}></span>
        </button>
        
        <button 
          onClick={logout}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'hsl(var(--text-muted))', fontSize: '13px', fontWeight: 500 }}
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </header>
  );
}
