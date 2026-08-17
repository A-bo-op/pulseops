import { Activity } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/dashboard" className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight">
      <span className="grid size-9 place-items-center rounded-xl border border-mint/30 bg-mint/10 text-mint">
        <Activity size={19} strokeWidth={2.4} />
      </span>
      PulseOps
    </Link>
  );
}
