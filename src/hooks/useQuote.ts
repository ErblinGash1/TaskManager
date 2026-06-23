// useQuote — fetches the Motivational Quote of the Day.
//
// Quotable is a free, no-auth public API. We pick a random quote (good enough
// for "of the day" UX on a local-only app) and cache it for 12h in AsyncStorage
// so the hero card paints instantly on subsequent launches.
//
// WHY a separate hook: keeps network concerns out of UI components, and lets
// us swap the quote provider later without touching screens.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export interface Quote {
  content: string;
  author: string;
}

const CACHE_KEY = "@lumina/quote/v1";
const TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

interface Cached {
  quote: Quote;
  cachedAt: number;
}

// Fallback quote — guarantees the hero card is never empty even if the device
// is offline on first launch.
const FALLBACK: Quote = {
  content:
    "Discipline is choosing between what you want now and what you want most.",
  author: "Abraham Lincoln",
};

interface UseQuoteResult {
  quote: Quote;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useQuote = (): UseQuoteResult => {
  const [quote, setQuote] = useState<Quote>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFresh = useCallback(async (): Promise<Quote> => {
    // Quotable's /random endpoint is the canonical "any quote" path.
    // We give it 8s — long enough for slow networks, short enough that we fall
    // back to the cache/default before the user notices a stall.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch("https://api.quotable.io/random", {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { content?: string; author?: string };
      if (!json.content || !json.author) throw new Error("Malformed response");
      return { content: json.content, author: json.author };
    } finally {
      clearTimeout(timer);
    }
  }, []);

  const load = useCallback(
    async (force = false) => {
      setLoading(true);
      setError(null);
      try {
        if (!force) {
          const raw = await AsyncStorage.getItem(CACHE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as Cached;
            if (Date.now() - parsed.cachedAt < TTL_MS) {
              setQuote(parsed.quote);
              setLoading(false);
              return;
            }
          }
        }
        const fresh = await fetchFresh();
        setQuote(fresh);
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ quote: fresh, cachedAt: Date.now() } as Cached),
        );
      } catch (e) {
        // Network failed — try the cache one more time even if expired,
        // otherwise stay on the fallback we already have on state.
        try {
          const raw = await AsyncStorage.getItem(CACHE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as Cached;
            setQuote(parsed.quote);
          }
        } catch {
          // swallow — fallback already in state.
        }
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [fetchFresh],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  return {
    quote,
    loading,
    error,
    refresh: () => load(true),
  };
};
