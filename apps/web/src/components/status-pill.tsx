import clsx from 'clsx';

export function StatusPill({ status }: { status: 'UP' | 'DOWN' | 'PENDING' | 'OPEN' | 'RESOLVED' }) {
  const healthy = status === 'UP' || status === 'RESOLVED';
  const unhealthy = status === 'DOWN' || status === 'OPEN';

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-[0.1em]',
        healthy && 'border-mint/20 bg-mint/10 text-mint',
        unhealthy && 'border-red-400/20 bg-red-400/10 text-red-300',
        !healthy && !unhealthy && 'border-amber-300/20 bg-amber-300/10 text-amber-200',
      )}
    >
      <span
        className={clsx(
          'size-1.5 rounded-full',
          healthy && 'bg-mint',
          unhealthy && 'bg-red-300',
          !healthy && !unhealthy && 'bg-amber-200',
        )}
      />
      {status}
    </span>
  );
}
