import { useState, useEffect } from 'react';

interface UseAsyncResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook for managing async operations with loading and error states
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
): UseAsyncResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]); // Only run on mount

  return { data, loading, error, execute, reset };
}

interface UseDebounceOptions {
  delay?: number;
}

/**
 * Hook for debouncing values
 */
export function useDebounce<T>(value: T, options?: UseDebounceOptions): T {
  const { delay = 300 } = options || {};
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface UseRetryOptions {
  maxRetries?: number;
  delay?: number;
}

/**
 * Hook for retrying failed async operations
 */
export function useRetry<T>(
  asyncFunction: () => Promise<T>,
  options?: UseRetryOptions
): UseAsyncResult<T> {
  const { maxRetries = 3, delay = 1000 } = options || {};

  const { data, loading, error, execute, reset: baseReset } = useAsync(asyncFunction, false);

  const executeWithRetry = async () => {
    let lastError: Error | null = null;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        await execute();
        return;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('An error occurred');

        if (i < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }

    // If all retries failed, throw the last error
    throw lastError;
  };

  const reset = () => {
    baseReset();
  };

  return {
    data,
    loading,
    error,
    execute: executeWithRetry,
    reset,
  };
}
