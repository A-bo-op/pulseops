'use client';

import clsx from 'clsx';
import { BellRing, FolderKanban, Gauge, LogOut, Menu, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { Logo } from './logo';

const navigation = [
  { href: '/dashboard', label: 'Overview', icon: Gauge },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/incidents', label: 'Incidents', icon: BellRing },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <main className="grid min-h-screen place-items-center text-sm text-muted">
        <div className="flex items-center gap-3">
          <span className="size-4 animate-spin rounded-full border-2 border-mint/20 border-t-mint" />
          Restoring secure session
        </div>
      </main>
    );
  }

  const sidebar = (
    <>
      <div className="flex items-center justify-between px-5 py-5">
        <Logo />
        <button className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-5">
        {navigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                active ? 'bg-mint/10 text-mint' : 'text-muted hover:bg-white/[0.04] hover:text-white',
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-line p-4">
        <div className="mb-3 flex items-center gap-3 px-1">
          <div className="grid size-9 place-items-center rounded-full bg-mint/10 text-sm font-bold text-mint">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
        </div>
        <button className="button-secondary w-full" onClick={logout}>
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="hidden min-h-screen flex-col border-r border-line bg-panel/70 lg:flex">{sidebar}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden">
          <aside className="flex h-full w-[280px] flex-col border-r border-line bg-panel">{sidebar}</aside>
        </div>
      )}
      <div className="min-w-0">
        <div className="flex h-16 items-center border-b border-line px-5 lg:hidden">
          <button onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu size={22} />
          </button>
          <div className="ml-4"><Logo /></div>
        </div>
        <main className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
