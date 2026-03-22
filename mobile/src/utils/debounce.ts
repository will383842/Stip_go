import { useRef, useCallback } from 'react';

// Prevents double-tap / triple-tap from firing multiple actions
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delayMs: number = 500,
): T {
  const lastCall = useRef<number>(0);

  return useCallback((...args: any[]) => {
    const now = Date.now();
    if (now - lastCall.current < delayMs) return;
    lastCall.current = now;
    return callback(...args);
  }, [callback, delayMs]) as unknown as T;
}
