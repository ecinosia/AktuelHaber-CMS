"use client";

import { useCallback, useEffect, useState } from "react";

const ALLOWED = [10, 25, 50, 100]; // the page-size options DataTable offers
const PREFIX = "cms.pageSize.";

/**
 * A table's "rows per page" that is remembered: choose 100 once, open an article to edit it, come back through any link and the
 * list is still at 100. Kept in this browser (localStorage, one value per table), not on the server, so it never needs the
 * backend; the saved value is only accepted if it is one of the offered sizes. `ready` turns true after the saved value was read:
 * a page that fetches data should wait for it, otherwise it fetches once at the default and again at the saved size.
 */
export function usePersistedPageSize(table: string, fallback: number): readonly [number, (size: number) => void, boolean] {
  const [size, setSize] = useState(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(PREFIX + table));
      if (ALLOWED.includes(saved)) setSize(saved);
    } catch {
      /* private window or blocked storage: the default is used */
    }
    setReady(true);
  }, [table]);

  const choose = useCallback(
    (next: number) => {
      setSize(next);
      try {
        window.localStorage.setItem(PREFIX + table, String(next));
      } catch {
        /* not saved, still applied for this visit */
      }
    },
    [table],
  );

  return [size, choose, ready] as const;
}
