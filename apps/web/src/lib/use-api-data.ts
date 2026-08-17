'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { apiRequest } from './api';

export function useApiData<T>(path: string, refreshMs?: number) {
  const { token } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!token) return;
    try {
      setError(null);
      setData(await apiRequest<T>(path, { token }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }, [path, token]);

  useEffect(() => {
    const initialLoad = setTimeout(() => void refetch(), 0);
    if (!refreshMs) return () => clearTimeout(initialLoad);
    const interval = setInterval(() => void refetch(), refreshMs);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [refetch, refreshMs]);

  return { data, error, loading, refetch };
}
