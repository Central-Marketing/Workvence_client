import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any value.
 * Delays updating the debounced value until after delay milliseconds
 * have elapsed since the last time the value was changed.
 *
 * @param value The value to debounce
 * @param delay The delay in milliseconds (default: 350ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 350): T {
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

export default useDebounce;
