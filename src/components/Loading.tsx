export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-2 border-cyber-accent/20 border-t-cyber-accent animate-spin cyber-chamfer" />
        <div className="absolute inset-3 border border-cyber-secondary/20 border-b-cyber-secondary animate-spin cyber-chamfer" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <p className="text-xs text-cyber-accent font-mono uppercase tracking-[0.2em] animate-pulse">
        {label}<span className="animate-blink">_</span>
      </p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="cyber-card cyber-chamfer p-6 space-y-4">
      <div className="cyber-skeleton h-6 w-24" />
      <div className="cyber-skeleton h-5 w-3/4" />
      <div className="cyber-skeleton h-4 w-full" />
      <div className="cyber-skeleton h-4 w-2/3" />
      <div className="flex gap-2 pt-2">
        <div className="cyber-skeleton h-6 w-16" />
        <div className="cyber-skeleton h-6 w-16" />
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
        if (active) { setData(result); setError(null); }
      })
      .catch((err) => {
        if (active) setError(err.message ?? 'Something went wrong');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadCount]);

  return { data, loading, error, refetch };
}
