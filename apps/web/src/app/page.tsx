import { Activity, ArrowRight, BellRing, ChartNoAxesCombined, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

const features = [
  { icon: Activity, title: 'Continuous checks', text: 'Backend-owned scheduling keeps monitoring even when your browser is closed.' },
  { icon: ChartNoAxesCombined, title: 'Latency visibility', text: 'See response-time history, availability, and the latest status in one place.' },
  { icon: BellRing, title: 'Incident lifecycle', text: 'Three consecutive failures open one incident; recovery resolves it automatically.' },
  { icon: ShieldCheck, title: 'Secure by default', text: 'Ownership checks, rate limits, URL validation, and SSRF defenses protect every request.' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Logo />
        <div className="flex items-center gap-3">
          <Link className="button-secondary" href="/login">Sign in</Link>
          <Link className="button-primary" href="/register">Start monitoring</Link>
        </div>
      </nav>
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-20 md:pt-28">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-mint">API health, without the noise</p>
        <h1 className="max-w-5xl text-5xl font-bold leading-[0.98] tracking-[-0.055em] text-white md:text-7xl lg:text-8xl">
          Know when your API<br />stops keeping its promise.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-muted">
          PulseOps watches your endpoints, measures latency, records every check, and turns repeated failures into actionable incidents.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link className="button-primary" href="/register">Create free workspace <ArrowRight size={17} /></Link>
          <Link className="button-secondary" href="/login">Open dashboard</Link>
        </div>
        <div className="mt-24 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article className="panel p-5" key={feature.title}>
              <feature.icon className="mb-7 text-mint" size={22} />
              <h2 className="font-semibold text-white">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
