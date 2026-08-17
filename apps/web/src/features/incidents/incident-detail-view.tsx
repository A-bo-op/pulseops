'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ErrorState, LoadingState } from '@/components/page-state';
import { PageHeading } from '@/components/page-heading';
import { StatusPill } from '@/components/status-pill';
import { formatDate } from '@/lib/format';
import { useApiData } from '@/lib/use-api-data';
import type { Incident } from '@/types';

export function IncidentDetailView() {
  const { incidentId } = useParams<{ incidentId: string }>();
  const { data, error, loading, refetch } = useApiData<Incident>(`/incidents/${incidentId}`, 15_000);
  if (loading) return <LoadingState label="Loading incident evidence" />;
  if (error || !data) return <ErrorState message={error ?? 'Incident unavailable'} retry={refetch} />;

  const checks = data.monitor.checkResults ?? [];
  return <><Link href="/incidents" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-white"><ArrowLeft size={16} /> All incidents</Link><PageHeading eyebrow={data.monitor.project?.name ?? 'Incident'} title={data.monitor.name} description={data.failureReason} action={<StatusPill status={data.status} />} /><div className="grid gap-4 md:grid-cols-3"><article className="panel p-5"><p className="text-xs uppercase tracking-wider text-muted">Started</p><p className="mt-4 text-sm font-semibold">{formatDate(data.startedAt)}</p></article><article className="panel p-5"><p className="text-xs uppercase tracking-wider text-muted">Resolved</p><p className="mt-4 text-sm font-semibold">{data.resolvedAt ? formatDate(data.resolvedAt) : 'Still active'}</p></article><article className="panel p-5"><p className="text-xs uppercase tracking-wider text-muted">Endpoint</p><Link className="mt-4 block truncate text-sm font-semibold text-mint hover:underline" href={`/monitors/${data.monitor.id}`}>{data.monitor.url}</Link></article></div><section className="panel mt-6 overflow-hidden"><div className="border-b border-line px-5 py-4"><h2 className="font-semibold">Check evidence</h2><p className="mt-1 text-xs text-muted">Results around the most recent monitor activity</p></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-muted"><tr><th className="px-6 py-3">Result</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Latency</th><th className="px-4 py-3">Error</th><th className="px-6 py-3 text-right">Checked</th></tr></thead><tbody className="divide-y divide-line">{checks.map((check) => <tr key={check.id}><td className="px-6 py-4"><StatusPill status={check.isUp ? 'UP' : 'DOWN'} /></td><td className="px-4 py-4">{check.statusCode ?? '—'}</td><td className="px-4 py-4">{check.responseTimeMs} ms</td><td className="max-w-sm truncate px-4 py-4 text-muted">{check.errorMessage ?? '—'}</td><td className="px-6 py-4 text-right text-muted">{formatDate(check.checkedAt)}</td></tr>)}</tbody></table></div></section></>;
}
