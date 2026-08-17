'use client';

import { Activity, AlertTriangle, Clock3, Gauge, Radio, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { EmptyState, ErrorState, LoadingState } from '@/components/page-state';
import { PageHeading } from '@/components/page-heading';
import { StatusPill } from '@/components/status-pill';
import { timeAgo } from '@/lib/format';
import { useApiData } from '@/lib/use-api-data';
import type { DashboardData } from '@/types';

const metricIcons = [Radio, ShieldCheck, AlertTriangle, Clock3];

export function DashboardView() {
  const { data, error, loading, refetch } = useApiData<DashboardData>('/dashboard', 15_000);
  if (loading) return <LoadingState label="Loading live monitor health" />;
  if (error || !data) return <ErrorState message={error ?? 'Dashboard unavailable'} retry={refetch} />;

  const metrics = [
    { label: 'Total monitors', value: data.metrics.totalMonitors, helper: `${data.metrics.pendingMonitors} awaiting first check` },
    { label: 'Currently up', value: data.metrics.monitorsUp, helper: 'Latest check succeeded' },
    { label: 'Open incidents', value: data.metrics.openIncidents, helper: `${data.metrics.monitorsDown} monitors down` },
    { label: 'Average latency', value: `${data.metrics.averageResponseTimeMs} ms`, helper: 'Across recorded checks' },
  ];

  return (
    <>
      <PageHeading eyebrow="Operations overview" title="System pulse" description="A current view of endpoint health, response time, and active incidents. Data refreshes every 15 seconds." action={<Link className="button-primary" href="/projects">Manage monitors</Link>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metricIcons[index] ?? Gauge;
          return <article className="panel p-5" key={metric.label}><div className="mb-8 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.13em] text-muted">{metric.label}</p><Icon className="text-mint" size={18} /></div><p className="text-3xl font-bold tracking-[-0.04em]">{metric.value}</p><p className="mt-2 text-xs text-muted">{metric.helper}</p></article>;
        })}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="panel p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Monitor health</h2><p className="mt-1 text-xs text-muted">Latest result for each endpoint</p></div><Activity className="text-muted" size={19} /></div>
          {data.monitors.length === 0 ? <EmptyState title="No monitors yet" message="Create a project, then add your first HTTP endpoint to begin collecting health data." /> : <div className="divide-y divide-line">{data.monitors.slice(0, 8).map((monitor) => { const latest = monitor.checkResults[0]; const status = latest ? (latest.isUp ? 'UP' : 'DOWN') : 'PENDING'; return <Link key={monitor.id} href={`/monitors/${monitor.id}`} className="grid gap-3 py-4 transition hover:bg-white/[0.015] sm:grid-cols-[1fr_auto_auto] sm:items-center"><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{monitor.name}</p><p className="mt-1 truncate text-xs text-muted">{monitor.project?.name} · {monitor.url}</p></div><StatusPill status={status} /><div className="text-left sm:w-24 sm:text-right"><p className="text-sm font-semibold">{latest ? `${latest.responseTimeMs} ms` : '—'}</p><p className="text-xs text-muted">{timeAgo(latest?.checkedAt)}</p></div></Link>; })}</div>}
        </section>
        <section className="panel p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Recent incidents</h2><p className="mt-1 text-xs text-muted">Newest service interruptions</p></div><Link className="text-xs font-semibold text-mint hover:underline" href="/incidents">View all</Link></div>
          {data.recentIncidents.length === 0 ? <EmptyState title="No incidents" message="When a monitor fails three consecutive times, the incident will appear here." /> : <div className="space-y-3">{data.recentIncidents.map((incident) => <Link key={incident.id} href={`/incidents/${incident.id}`} className="block rounded-xl border border-line p-4 transition hover:border-mint/20"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-semibold">{incident.monitor.name}</p><StatusPill status={incident.status} /></div><p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{incident.failureReason}</p><p className="mt-3 text-[11px] uppercase tracking-[0.1em] text-muted">Started {timeAgo(incident.startedAt)}</p></Link>)}</div>}
        </section>
      </div>
      <section className="panel mt-6 overflow-hidden">
        <div className="border-b border-line px-5 py-4 md:px-6"><h2 className="font-semibold">Recent checks</h2></div>
        {data.recentChecks.length === 0 ? <div className="p-5"><EmptyState title="Waiting for check data" message="Scheduled and manual checks will be listed here." /></div> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.1em] text-muted"><tr><th className="px-6 py-3 font-semibold">Monitor</th><th className="px-4 py-3 font-semibold">Result</th><th className="px-4 py-3 font-semibold">HTTP</th><th className="px-4 py-3 font-semibold">Latency</th><th className="px-6 py-3 text-right font-semibold">Checked</th></tr></thead><tbody className="divide-y divide-line">{data.recentChecks.map((check) => <tr key={check.id}><td className="px-6 py-4 font-medium">{check.monitor?.name}</td><td className="px-4 py-4"><StatusPill status={check.isUp ? 'UP' : 'DOWN'} /></td><td className="px-4 py-4 text-muted">{check.statusCode ?? '—'}</td><td className="px-4 py-4">{check.responseTimeMs} ms</td><td className="px-6 py-4 text-right text-muted">{timeAgo(check.checkedAt)}</td></tr>)}</tbody></table></div>}
      </section>
    </>
  );
}
