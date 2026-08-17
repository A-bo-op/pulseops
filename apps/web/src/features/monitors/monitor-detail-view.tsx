'use client';

import { ArrowLeft, Pause, Pencil, Play, RefreshCw, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { ErrorState, LoadingState } from '@/components/page-state';
import { PageHeading } from '@/components/page-heading';
import { StatusPill } from '@/components/status-pill';
import { useAuth } from '@/features/auth/auth-provider';
import { apiRequest } from '@/lib/api';
import { formatDate, timeAgo } from '@/lib/format';
import { useApiData } from '@/lib/use-api-data';
import type { Monitor, MonitorAnalytics } from '@/types';
import { ResponseChart } from './response-chart';

export function MonitorDetailView() {
  const { monitorId } = useParams<{ monitorId: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const monitorQuery = useApiData<Monitor>(`/monitors/${monitorId}`, 15_000);
  const summaryQuery = useApiData<MonitorAnalytics>(`/monitors/${monitorId}/summary`, 15_000);
  const [action, setAction] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [actionError, setActionError] = useState('');

  async function runAction(name: string, operation: () => Promise<unknown>) {
    setAction(name); setActionError('');
    try { await operation(); await Promise.all([monitorQuery.refetch(), summaryQuery.refetch()]); }
    catch (requestError) { setActionError(requestError instanceof Error ? requestError.message : 'Action failed'); }
    finally { setAction(''); }
  }

  async function editMonitor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await runAction('edit', async () => {
      await apiRequest(`/monitors/${monitorId}`, { method: 'PATCH', token, body: JSON.stringify({ name: form.get('name'), url: form.get('url'), httpMethod: form.get('httpMethod'), intervalSeconds: Number(form.get('intervalSeconds')), timeoutMs: Number(form.get('timeoutMs')), expectedStatusCode: Number(form.get('expectedStatusCode')) }) });
      setShowEdit(false);
    });
  }

  async function deleteMonitor() {
    if (!window.confirm('Delete this monitor, its history, and incidents?')) return;
    await runAction('delete', () => apiRequest(`/monitors/${monitorId}`, { method: 'DELETE', token }));
    if (monitorQuery.data) router.push(`/projects/${monitorQuery.data.projectId}`);
  }

  if (monitorQuery.loading || summaryQuery.loading) return <LoadingState label="Loading monitor analytics" />;
  if (monitorQuery.error || summaryQuery.error || !monitorQuery.data || !summaryQuery.data) return <ErrorState message={monitorQuery.error ?? summaryQuery.error ?? 'Monitor unavailable'} retry={() => { void monitorQuery.refetch(); void summaryQuery.refetch(); }} />;

  const monitor = monitorQuery.data; const summary = summaryQuery.data;
  return <>
    <Link href={`/projects/${monitor.projectId}`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-white"><ArrowLeft size={16} /> Back to project</Link>
    <PageHeading eyebrow={monitor.project?.name ?? 'Monitor'} title={monitor.name} description={`${monitor.httpMethod} ${monitor.url}`} action={<div className="flex flex-wrap gap-2"><button className="button-secondary" onClick={() => setShowEdit(true)}><Pencil size={15} /> Edit</button><button className="button-secondary" disabled={Boolean(action)} onClick={() => runAction('toggle', () => apiRequest(`/monitors/${monitorId}/${monitor.isActive ? 'pause' : 'resume'}`, { method: 'POST', token }))}>{monitor.isActive ? <Pause size={15} /> : <Play size={15} />}{monitor.isActive ? 'Pause' : 'Resume'}</button><button className="button-primary" disabled={Boolean(action)} onClick={() => runAction('check', () => apiRequest(`/monitors/${monitorId}/check`, { method: 'POST', token }))}><RefreshCw className={action === 'check' ? 'animate-spin' : ''} size={15} /> Check now</button></div>} />
    {actionError && <p className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{actionError}</p>}
    {showEdit && <form className="panel mb-6 p-5 md:p-6" onSubmit={editMonitor}><div className="mb-5 flex items-center justify-between"><h2 className="font-semibold">Edit monitor</h2><button type="button" onClick={() => setShowEdit(false)}><X size={19} /></button></div><div className="grid gap-4 md:grid-cols-2"><div><label className="label">Monitor name</label><input className="input" name="name" defaultValue={monitor.name} required /></div><div><label className="label">Endpoint URL</label><input className="input" name="url" type="url" defaultValue={monitor.url} required /></div><div><label className="label">Method</label><select className="input" name="httpMethod" defaultValue={monitor.httpMethod}><option>GET</option><option>HEAD</option></select></div><div><label className="label">Expected status</label><input className="input" name="expectedStatusCode" type="number" min={100} max={599} defaultValue={monitor.expectedStatusCode} /></div><div><label className="label">Interval (seconds)</label><input className="input" name="intervalSeconds" type="number" min={30} max={86400} defaultValue={monitor.intervalSeconds} /></div><div><label className="label">Timeout (milliseconds)</label><input className="input" name="timeoutMs" type="number" min={500} max={30000} defaultValue={monitor.timeoutMs} /></div></div><div className="mt-6 flex items-center justify-between"><button className="button-danger" type="button" onClick={deleteMonitor}><Trash2 size={15} /> Delete monitor</button><button className="button-primary" disabled={action === 'edit'}>{action === 'edit' ? 'Saving…' : 'Save changes'}</button></div></form>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><article className="panel p-5"><p className="text-xs uppercase tracking-wider text-muted">Current status</p><div className="mt-5"><StatusPill status={summary.currentStatus} /></div><p className="mt-3 text-xs text-muted">{monitor.isActive ? 'Scheduled checks active' : 'Monitoring paused'}</p></article><article className="panel p-5"><p className="text-xs uppercase tracking-wider text-muted">Latest response</p><p className="mt-4 text-3xl font-bold">{summary.responseTimeMs === null ? '—' : `${summary.responseTimeMs} ms`}</p><p className="mt-2 text-xs text-muted">{timeAgo(summary.lastCheckedAt)}</p></article><article className="panel p-5"><p className="text-xs uppercase tracking-wider text-muted">Uptime</p><p className="mt-4 text-3xl font-bold">{summary.uptimePercentage}%</p><p className="mt-2 text-xs text-muted">Across {summary.totalChecks} recorded checks</p></article><article className="panel p-5"><p className="text-xs uppercase tracking-wider text-muted">Average latency</p><p className="mt-4 text-3xl font-bold">{summary.averageResponseTimeMs} ms</p><p className="mt-2 text-xs text-muted">Timeout at {monitor.timeoutMs} ms</p></article></div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]"><section className="panel p-5 md:p-6"><div className="mb-5"><h2 className="font-semibold">Response time</h2><p className="mt-1 text-xs text-muted">Most recent {monitor.checkResults.length} checks</p></div>{monitor.checkResults.length ? <ResponseChart results={monitor.checkResults} /> : <div className="grid h-72 place-items-center text-sm text-muted">No check history yet</div>}</section><section className="panel p-5 md:p-6"><h2 className="font-semibold">Configuration</h2><dl className="mt-5 space-y-4 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted">Interval</dt><dd>{monitor.intervalSeconds}s</dd></div><div className="flex justify-between gap-4"><dt className="text-muted">Expected</dt><dd>HTTP {monitor.expectedStatusCode}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted">Timeout</dt><dd>{monitor.timeoutMs}ms</dd></div><div className="flex justify-between gap-4"><dt className="text-muted">Last checked</dt><dd className="text-right">{formatDate(monitor.lastCheckedAt)}</dd></div></dl></section></div>
    <section className="panel mt-6 overflow-hidden"><div className="border-b border-line px-5 py-4"><h2 className="font-semibold">Check history</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-muted"><tr><th className="px-6 py-3">Result</th><th className="px-4 py-3">HTTP</th><th className="px-4 py-3">Latency</th><th className="px-4 py-3">Failure</th><th className="px-6 py-3 text-right">Checked at</th></tr></thead><tbody className="divide-y divide-line">{monitor.checkResults.map((result) => <tr key={result.id}><td className="px-6 py-4"><StatusPill status={result.isUp ? 'UP' : 'DOWN'} /></td><td className="px-4 py-4">{result.statusCode ?? '—'}</td><td className="px-4 py-4">{result.responseTimeMs} ms</td><td className="max-w-sm truncate px-4 py-4 text-muted">{result.errorMessage ?? '—'}</td><td className="px-6 py-4 text-right text-muted">{formatDate(result.checkedAt)}</td></tr>)}</tbody></table>{monitor.checkResults.length === 0 && <p className="p-8 text-center text-sm text-muted">The scheduler has not completed a check yet.</p>}</div></section>
  </>;
}
