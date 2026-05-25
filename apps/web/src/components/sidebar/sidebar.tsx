'use client';

import Link from 'next/link';
import { Button } from '../ui/button';
import { useLogout } from '@/features/auth/hooks/use-logout';

export function Sidebar() {
  const { logout, loading } = useLogout();

  return (
    <aside className="w-64 border-r p-4">
      <nav className="flex flex-col gap-3">
        <div className="mt-auto"></div>
        <Link href="/dashboard">Dashboard</Link>

        <Link href="/patients">Patients</Link>

        <Link href="/billing">Billing</Link>

        <Link href="/settings">Settings</Link>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={logout}
          disabled={loading}
        >
          {loading ? 'Signing out...' : 'Logout'}
        </Button>
      </nav>
    </aside>
  );
}
