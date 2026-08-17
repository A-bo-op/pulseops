'use client';

import { AppShell } from '@/components/app-shell';
import { PageHeading } from '@/components/page-heading';
import { useAuth } from '@/features/auth/auth-provider';

export default function SettingsPage() {
  const { user } = useAuth();
  return <AppShell><PageHeading eyebrow="Account" title="Settings" description="Your PulseOps profile and current MVP configuration." /><div className="grid gap-6 xl:grid-cols-2"><section className="panel p-5 md:p-6"><h2 className="font-semibold">Profile</h2><dl className="mt-6 space-y-5 text-sm"><div><dt className="text-xs uppercase tracking-wider text-muted">Name</dt><dd className="mt-2 font-medium">{user?.name}</dd></div><div><dt className="text-xs uppercase tracking-wider text-muted">Email</dt><dd className="mt-2 font-medium">{user?.email}</dd></div></dl></section><section className="panel p-5 md:p-6"><h2 className="font-semibold">Monitoring policy</h2><dl className="mt-6 space-y-4 text-sm"><div className="flex justify-between"><dt className="text-muted">Minimum interval</dt><dd>30 seconds</dd></div><div className="flex justify-between"><dt className="text-muted">Failure threshold</dt><dd>3 consecutive checks</dd></div><div className="flex justify-between"><dt className="text-muted">Allowed methods</dt><dd>GET, HEAD</dd></div><div className="flex justify-between"><dt className="text-muted">History</dt><dd>Paginated raw results</dd></div></dl></section></div></AppShell>;
}
