import { useState, useRef, useEffect, useCallback } from 'react';
import { loadingManager } from '../services/loadingManager';

/**
 * useAsyncAction
 * Standardizes async execution, duplicate-click prevention, loading status,
 * timeout protection, error states, and unmount cleanup.
 */
export function useAsyncAction(asyncFn, options = {}) {
  const { timeoutMs = 30000, onError, onSuccess } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(
    async (...args) => {
      if (isLoading) return; // Prevent duplicate rapid clicks
      setIsLoading(true);
      setError(null);
      loadingManager.start();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      let timeoutId;
      if (timeoutMs) {
        timeoutId = setTimeout(() => {
          controller.abort();
          if (isMountedRef.current) {
            const timeoutErr = new Error('Operation timed out. Please check connection and retry.');
            setError(timeoutErr.message);
            if (onError) onError(timeoutErr);
          }
        }, timeoutMs);
      }

      try {
        const result = await asyncFn(...args, { signal: controller.signal });
        if (isMountedRef.current) {
          if (onSuccess) onSuccess(result);
          return result;
        }
      } catch (err) {
        if (isMountedRef.current) {
          const message =
            err.name === 'AbortError'
              ? 'Operation cancelled.'
              : err.message || 'Action failed. Please try again.';
          setError(message);
          if (onError) onError(err);
        }
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        if (isMountedRef.current) {
          setIsLoading(false);
          loadingManager.finish();
        }
      }
    },
    [asyncFn, isLoading, timeoutMs, onError, onSuccess]
  );

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      if (isMountedRef.current) {
        setIsLoading(false);
        loadingManager.finish();
      }
    }
  }, []);

  return { execute, isLoading, error, setError, abort };
}

export default useAsyncAction;
