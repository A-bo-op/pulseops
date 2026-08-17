import { AlertTriangle, Inbox } from 'lucide-react';

export function LoadingState({ label = 'Loading data' }: { label?: string }) {
  return (
    <div className="panel flex min-h-56 items-center justify-center p-8 text-sm text-muted">
      <span className="mr-3 size-4 animate-spin rounded-full border-2 border-mint/20 border-t-mint" />
      {label}
    </div>
  );
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="panel flex min-h-56 flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="mb-3 text-red-300" size={24} />
      <p className="text-sm text-red-200">{message}</p>
      {retry && (
        <button className="button-secondary mt-4" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-12 text-center">
      <Inbox className="mx-auto mb-3 text-muted" size={25} />
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted">{message}</p>
    </div>
  );
}
