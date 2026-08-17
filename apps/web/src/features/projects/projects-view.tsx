'use client';

import { ArrowRight, FolderKanban, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from '@/components/page-state';
import { PageHeading } from '@/components/page-heading';
import { useAuth } from '@/features/auth/auth-provider';
import { apiRequest } from '@/lib/api';
import { useApiData } from '@/lib/use-api-data';
import type { Project } from '@/types';

export function ProjectsView() {
  const { token } = useAuth();
  const { data, error, loading, refetch } = useApiData<Project[]>('/projects');
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setFormError('');
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest('/projects', { method: 'POST', token, body: JSON.stringify({ name: form.get('name'), description: form.get('description') || null }) });
      setCreating(false); await refetch();
    } catch (requestError) { setFormError(requestError instanceof Error ? requestError.message : 'Could not create project'); }
    finally { setSubmitting(false); }
  }

  if (loading) return <LoadingState label="Loading projects" />;
  if (error || !data) return <ErrorState message={error ?? 'Projects unavailable'} retry={refetch} />;

  return <>
    <PageHeading eyebrow="Workspace" title="Projects" description="Group related endpoints and understand the health of each application at a glance." action={<button className="button-primary" onClick={() => setCreating(true)}><Plus size={17} /> New project</button>} />
    {creating && <form className="panel mb-6 p-5 md:p-6" onSubmit={createProject}><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Create project</h2><p className="mt-1 text-xs text-muted">Use a clear service or application name.</p></div><button type="button" onClick={() => setCreating(false)} aria-label="Close"><X size={19} /></button></div><div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr_auto] md:items-end"><div><label className="label" htmlFor="name">Project name</label><input className="input" id="name" name="name" required maxLength={100} placeholder="Payments API" /></div><div><label className="label" htmlFor="description">Description</label><input className="input" id="description" name="description" maxLength={500} placeholder="Production payment services" /></div><button className="button-primary h-[46px]" disabled={submitting}>{submitting ? 'Creating…' : 'Create project'}</button></div>{formError && <p className="mt-3 text-sm text-red-300">{formError}</p>}</form>}
    {data.length === 0 ? <div className="panel p-5"><EmptyState title="Create your first project" message="A project is a container for related monitors, such as the endpoints that make up one application." /></div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.map((project) => <Link href={`/projects/${project.id}`} key={project.id} className="panel group p-5 transition hover:-translate-y-0.5 hover:border-mint/25"><div className="flex items-start justify-between"><span className="grid size-10 place-items-center rounded-xl bg-white/[0.04] text-mint"><FolderKanban size={20} /></span><ArrowRight className="text-muted transition group-hover:translate-x-1 group-hover:text-mint" size={18} /></div><h2 className="mt-7 text-lg font-semibold">{project.name}</h2><p className="mt-2 min-h-10 text-sm leading-5 text-muted">{project.description || 'No description provided.'}</p><div className="mt-7 grid grid-cols-3 border-t border-line pt-4 text-center"><div><p className="text-lg font-bold">{project.monitorCount}</p><p className="text-[10px] uppercase tracking-wider text-muted">Monitors</p></div><div><p className="text-lg font-bold text-mint">{project.upCount}</p><p className="text-[10px] uppercase tracking-wider text-muted">Up</p></div><div><p className="text-lg font-bold text-red-300">{project.downCount}</p><p className="text-[10px] uppercase tracking-wider text-muted">Down</p></div></div></Link>)}</div>}
  </>;
}
