export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-brand/20 border-t-brand animate-spin absolute" />
        <img src="/logo.png" alt="Loading" className="w-8 h-8 rounded-lg object-cover" />
      </div>
      <p className="text-sm text-ink-soft animate-pulse">{label}…</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-3xl p-6 space-y-4">
      <div className="skeleton h-6 w-24 rounded-full" />
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-2/3" />
      <div className="flex gap-2 pt-2">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const refetch = useCallback(() => setReloadCount((c) => c + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fn()
      .then((result) => {
        if (active) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) setError(err.message ?? 'Something went wrong');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadCount]);

  return { data, loading, error, refetch };
}
