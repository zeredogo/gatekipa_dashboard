import Link from 'next/link';
import { LayoutDashboard, Users, CreditCard, Activity, ArrowRightLeft } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header" style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px' }}>
          Gatekeeper <span style={{ color: 'hsl(var(--primary))' }}>HQ</span>
        </h1>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Link href="/" className="sidebar-link">
          <LayoutDashboard size={20} />
          <span>Overview</span>
        </Link>
        <Link href="/users" className="sidebar-link">
          <Users size={20} />
          <span>User Manager</span>
        </Link>
        <Link href="/cards" className="sidebar-link">
          <CreditCard size={20} />
          <span>Virtual Cards</span>
        </Link>
        <Link href="/transactions" className="sidebar-link">
          <Activity size={20} />
          <span>Live Transactions</span>
        </Link>
        <Link href="/compliance" className="sidebar-link">
          <Users size={20} />
          <span>Compliance (KYC)</span>
        </Link>
        <Link href="/fraud" className="sidebar-link">
          <Activity size={20} />
          <span>Fraud & Risk</span>
        </Link>
        <Link href="/reconciliation" className="sidebar-link">
          <ArrowRightLeft size={20} />
          <span>Reconciliation</span>
        </Link>
        <div style={{ marginTop: '16px', marginBottom: '8px', paddingLeft: '16px', fontSize: '12px', fontWeight: 600, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Operations & Control
        </div>
        <Link href="/operations" className="sidebar-link">
          <Activity size={20} />
          <span>Operations Desk</span>
        </Link>
        <Link href="/queue" className="sidebar-link">
          <ArrowRightLeft size={20} />
          <span>Provider Queue</span>
        </Link>
        <Link href="/logs" className="sidebar-link">
          <Activity size={20} />
          <span>Audit Logs</span>
        </Link>
        <Link href="/settings" className="sidebar-link">
          <Activity size={20} />
          <span>Admin Settings</span>
        </Link>
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid hsl(var(--border-color))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            A
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 500 }}>Admin User</p>
            <p style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Local Dev</p>
          </div>
        </div>
      </div>
{/* Scoped CSS for Sidebar Links */}
<style>{`
  .sidebar-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    color: hsl(var(--text-muted));
    font-weight: 500;
    transition: all 0.2s ease;
  }
  .sidebar-link:hover {
    background: hsl(var(--surface-light));
    color: hsl(var(--text-main));
  }
`}</style>
    </aside>
  );
}
