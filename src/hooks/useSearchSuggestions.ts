import { useState, useEffect, useRef, useCallback } from 'react';
import { axiosFetch } from '@/utils';
import axios from 'axios';

export interface SuggestionItem {
  text: string;
  type: 'category' | 'gig';
  slug?: string;
  id?: string;
  [key: string]: any;
}

export interface SuggestionsResponse {
  suggestions?: string[];
  items?: SuggestionItem[];
}

interface UseSearchSuggestionsOptions {
  limit?: number;
  debounceMs?: number;
}

export function useSearchSuggestions(
  query: string,
  options: UseSearchSuggestionsOptions = {}
) {
  const { limit = 8, debounceMs = 180 } = options;

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [items, setItems] = useState<SuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Monotonic request ID counter for race-condition protection on fast typing
  const requestIdRef = useRef(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const skipNextQueryRef = useRef(false);

  const clear = useCallback(() => {
    requestIdRef.current++;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setSuggestions([]);
    setItems([]);
    setIsLoading(false);
    setIsOpen(false);
  }, []);

  const close = useCallback(() => {
    requestIdRef.current++;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    skipNextQueryRef.current = true;
    setSuggestions([]);
    setItems([]);
    setIsLoading(false);
    setIsOpen(false);
  }, []);

  useEffect(() => {
    // If query change was triggered programmatically (e.g. user selected a suggestion or searched),
    // skip reopening and querying for suggestions
    if (skipNextQueryRef.current) {
      skipNextQueryRef.current = false;
      return;
    }

    const trimmed = query.trim();

    // Step 2 - Empty input check:
    // If the user erases everything or leaves the search input blank,
    // do not make an API call; just clear and hide the dropdown.
    if (!trimmed) {
      clear();
      return;
    }

    // Immediately show dropdown with "Search for {query}" while debouncing
    setIsOpen(true);

    // Fast typing protection: invalidate prior requests
    const currentRequestId = ++requestIdRef.current;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsLoading(true);

    // Step 2 - Debounce:
    // Wait 150ms to 200ms (180ms) after the user stops typing before making the request.
    debounceTimerRef.current = setTimeout(async () => {
      try {
        // Step 1 - Where to Call:
        // Endpoint: GET /api/gigs/suggestions?q={userInput}&limit={limit}
        const response = await fetch(`/api/gigs/suggestions?q=${encodeURIComponent(trimmed)}&limit=${limit}`, {
          headers: {
            'Accept': 'application/json',
          },
        });

        // If a newer character was typed or request was closed while this request was in flight, discard response
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch suggestions: ${response.status}`);
        }

        const data: SuggestionsResponse = await response.json();

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        const rawSuggestions = Array.isArray(data?.suggestions) ? data.suggestions : [];
        const rawItems = Array.isArray(data?.items) ? data.items : [];

        const normalizedItems: SuggestionItem[] = rawItems.length > 0
          ? rawItems
          : rawSuggestions.map((text) => ({ text, type: 'gig' }));

        setSuggestions(rawSuggestions);
        setItems(normalizedItems);
        setIsOpen(true);
      } catch (err: any) {
        if (currentRequestId !== requestIdRef.current) {
          return;
        }
        console.warn('Search suggestions error:', err?.message || err);
        setSuggestions([]);
        setItems([]);
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, limit, debounceMs, clear]);

  return {
    suggestions,
    items,
    isLoading,
    isOpen,
    setIsOpen,
    clear,
    close,
  };
}

export default useSearchSuggestions;
