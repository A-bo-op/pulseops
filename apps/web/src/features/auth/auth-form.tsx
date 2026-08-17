'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { Logo } from '@/components/logo';
import { useAuth } from './auth-provider';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const data = new FormData(event.currentTarget);

    try {
      const email = String(data.get('email'));
      const password = String(data.get('password'));
      if (mode === 'register') await register(String(data.get('name')), email, password);
      else await login(email, password);
      router.push('/dashboard');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  }

  const registering = mode === 'register';
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
      <section className="hidden border-r border-line p-12 lg:flex lg:flex-col">
        <Logo />
        <div className="my-auto max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint">Monitor with context</p>
          <h1 className="mt-5 text-6xl font-bold leading-[1.02] tracking-[-0.05em]">Your APIs tell a story. PulseOps catches the bad chapters.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted">Durable checks, clear incident rules, and just enough data to understand what changed.</p>
        </div>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-12 lg:hidden"><Logo /></div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">{registering ? 'Create account' : 'Welcome back'}</p>
          <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em]">{registering ? 'Start watching your APIs.' : 'Continue monitoring.'}</h2>
          <form className="mt-9 space-y-5" onSubmit={handleSubmit}>
            {registering && <div><label className="label" htmlFor="name">Name</label><input className="input" id="name" name="name" minLength={2} maxLength={100} required placeholder="Mohamed Ashik" /></div>}
            <div><label className="label" htmlFor="email">Email</label><input className="input" id="email" name="email" type="email" required placeholder="you@example.com" /></div>
            <div><label className="label" htmlFor="password">Password</label><input className="input" id="password" name="password" type="password" minLength={registering ? 8 : 1} maxLength={72} required placeholder="At least 8 characters" /></div>
            {error && <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
            <button className="button-primary w-full" disabled={submitting}>{submitting ? 'Please wait…' : registering ? 'Create account' : 'Sign in'} <ArrowRight size={17} /></button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            {registering ? 'Already have an account?' : 'New to PulseOps?'}{' '}
            <Link className="font-semibold text-mint hover:underline" href={registering ? '/login' : '/register'}>{registering ? 'Sign in' : 'Create account'}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
