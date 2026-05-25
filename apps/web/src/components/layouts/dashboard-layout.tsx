'use client';

import { Sidebar } from '@/components/sidebar/sidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
