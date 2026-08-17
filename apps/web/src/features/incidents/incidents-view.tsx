'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { EmptyState, ErrorState, LoadingState } from '@/components/page-state';
import { PageHeading } from '@/components/page-heading';
import { StatusPill } from '@/components/status-pill';
import { formatDate } from '@/lib/format';
import { useApiData } from '@/lib/use-api-data';
import type { Incident } from '@/types';

export function IncidentsView() {
  const { data, error, loading, refetch } = useApiData<Incident[]>('/incidents', 15_000);
  if (loading) return <LoadingState label="Loading incidents" />;
  if (error || !data) return <ErrorState message={error ?? 'Incidents unavailable'} retry={refetch} />;

  const open = data.filter((item) => item.status === 'OPEN').length;
  return <><PageHeading eyebrow="Failure history" title="Incidents" description="An incident opens after three consecutive failed checks and resolves automatically when the endpoint recovers." /><div className="mb-6 grid gap-4 sm:grid-cols-3"><div className="panel p-5"><p className="text-xs uppercase tracking-wider text-muted">Open incidents</p><p className="mt-4 text-3xl font-bold text-red-300">{open}</p></div><div className="panel p-5"><p className="text-xs uppercase tracking-wider text-muted">Resolved</p><p className="mt-4 text-3xl font-bold text-mint">{data.length - open}</p></div><div className="panel p-5"><p className="text-xs uppercase tracking-wider text-muted">Total recorded</p><p className="mt-4 text-3xl font-bold">{data.length}</p></div></div><section className="panel overflow-hidden">{data.length === 0 ? <div className="p-5"><EmptyState title="No incidents recorded" message="A monitor must fail three times in a row before PulseOps creates an incident." /></div> : <div className="divide-y divide-line">{data.map((incident) => <Link key={incident.id} href={`/incidents/${incident.id}`} className="grid gap-4 px-5 py-5 transition hover:bg-white/[0.015] md:grid-cols-[1fr_auto_auto_auto] md:items-center"><div className="min-w-0"><p className="font-semibold">{incident.monitor.name}</p><p className="mt-1 truncate text-xs text-muted">{incident.monitor.project?.name} · {incident.failureReason}</p></div><StatusPill status={incident.status} /><div className="md:w-44"><p className="text-xs text-muted">Started</p><p className="mt-1 text-sm">{formatDate(incident.startedAt)}</p></div><ArrowRight className="text-muted" size={17} /></Link>)}</div>}</section></>;
}
