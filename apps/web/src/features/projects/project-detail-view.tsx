'use client';

import { ArrowLeft, ExternalLink, Pause, Play, Plus, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from '@/components/page-state';
import { PageHeading } from '@/components/page-heading';
import { StatusPill } from '@/components/status-pill';
import { useAuth } from '@/features/auth/auth-provider';
import { apiRequest } from '@/lib/api';
import { timeAgo } from '@/lib/format';
import { useApiData } from '@/lib/use-api-data';
import type { Project } from '@/types';

export function ProjectDetailView() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const { data, error, loading, refetch } = useApiData<Project>(`/projects/${projectId}`);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  async function createMonitor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setFormError('');
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest(`/projects/${projectId}/monitors`, { method: 'POST', token, body: JSON.stringify({ name: form.get('name'), url: form.get('url'), httpMethod: form.get('httpMethod'), intervalSeconds: Number(form.get('intervalSeconds')), timeoutMs: Number(form.get('timeoutMs')), expectedStatusCode: Number(form.get('expectedStatusCode')) }) });
      setShowForm(false); await refetch();
    } catch (requestError) { setFormError(requestError instanceof Error ? requestError.message : 'Could not create monitor'); }
    finally { setSubmitting(false); }
  }

  async function setActive(monitorId: string, active: boolean) {
    await apiRequest(`/monitors/${monitorId}/${active ? 'resume' : 'pause'}`, { method: 'POST', token });
    await refetch();
  }

  async function deleteProject() {
    if (!window.confirm('Delete this project and all monitor history? This cannot be undone.')) return;
    await apiRequest(`/projects/${projectId}`, { method: 'DELETE', token });
    router.push('/projects');
  }

  if (loading) return <LoadingState label="Loading project monitors" />;
  if (error || !data) return <ErrorState message={error ?? 'Project unavailable'} retry={refetch} />;

  return <>
    <Link href="/projects" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-white"><ArrowLeft size={16} /> All projects</Link>
    <PageHeading eyebrow="Project health" title={data.name} description={data.description || 'Monitor and manage the endpoints that belong to this application.'} action={<div className="flex gap-2"><button className="button-danger" onClick={deleteProject}><Trash2 size={16} /> Delete</button><button className="button-primary" onClick={() => setShowForm(true)}><Plus size={17} /> Add monitor</button></div>} />
    <div className="mb-6 grid gap-4 sm:grid-cols-3"><div className="panel p-5"><p className="text-xs uppercase tracking-wider text-muted">Total monitors</p><p className="mt-4 text-3xl font-bold">{data.monitorCount}</p></div><div className="panel p-5"><p className="text-xs uppercase tracking-wider text-muted">Currently up</p><p className="mt-4 text-3xl font-bold text-mint">{data.upCount}</p></div><div className="panel p-5"><p className="text-xs uppercase tracking-wider text-muted">Currently down</p><p className="mt-4 text-3xl font-bold text-red-300">{data.downCount}</p></div></div>
    {showForm && <form className="panel mb-6 p-5 md:p-6" onSubmit={createMonitor}><div className="mb-6 flex items-center justify-between"><div><h2 className="font-semibold">New HTTP monitor</h2><p className="mt-1 text-xs text-muted">Public HTTP/HTTPS destinations only. Internal and private network addresses are blocked.</p></div><button type="button" onClick={() => setShowForm(false)}><X size={19} /></button></div><div className="grid gap-4 md:grid-cols-2"><div><label className="label" htmlFor="name">Monitor name</label><input className="input" id="name" name="name" required maxLength={100} placeholder="Production health endpoint" /></div><div><label className="label" htmlFor="url">Endpoint URL</label><input className="input" id="url" name="url" type="url" required maxLength={2048} placeholder="https://api.example.com/health" /></div><div><label className="label" htmlFor="httpMethod">Method</label><select className="input" id="httpMethod" name="httpMethod" defaultValue="GET"><option>GET</option><option>HEAD</option></select></div><div><label className="label" htmlFor="expectedStatusCode">Expected status</label><input className="input" id="expectedStatusCode" name="expectedStatusCode" type="number" min={100} max={599} defaultValue={200} required /></div><div><label className="label" htmlFor="intervalSeconds">Interval (seconds)</label><input className="input" id="intervalSeconds" name="intervalSeconds" type="number" min={30} max={86400} defaultValue={60} required /></div><div><label className="label" htmlFor="timeoutMs">Timeout (milliseconds)</label><input className="input" id="timeoutMs" name="timeoutMs" type="number" min={500} max={30000} defaultValue={5000} required /></div></div>{formError && <p className="mt-4 text-sm text-red-300">{formError}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" className="button-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="button-primary" disabled={submitting}>{submitting ? 'Creating…' : 'Create monitor'}</button></div></form>}
    <section className="panel overflow-hidden"><div className="border-b border-line px-5 py-4"><h2 className="font-semibold">Endpoints</h2></div>{data.monitors.length === 0 ? <div className="p-5"><EmptyState title="No endpoints monitored" message="Add a public health or API endpoint. PulseOps will begin checking it from the backend scheduler." /></div> : <div className="divide-y divide-line">{data.monitors.map((monitor) => { const latest = monitor.checkResults[0]; const status = latest ? (latest.isUp ? 'UP' : 'DOWN') : 'PENDING'; return <div key={monitor.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center"><Link className="min-w-0 group" href={`/monitors/${monitor.id}`}><div className="flex items-center gap-2"><p className="truncate font-semibold group-hover:text-mint">{monitor.name}</p><ExternalLink className="shrink-0 text-muted" size={14} /></div><p className="mt-1 truncate text-xs text-muted">{monitor.httpMethod} {monitor.url}</p></Link><StatusPill status={status} /><div className="lg:w-32"><p className="text-sm font-semibold">{latest ? `${latest.responseTimeMs} ms` : 'No data'}</p><p className="text-xs text-muted">{timeAgo(latest?.checkedAt)}</p></div><button className="button-secondary" onClick={() => setActive(monitor.id, !monitor.isActive)}>{monitor.isActive ? <Pause size={15} /> : <Play size={15} />}{monitor.isActive ? 'Pause' : 'Resume'}</button></div>; })}</div>}</section>
  </>;
}
