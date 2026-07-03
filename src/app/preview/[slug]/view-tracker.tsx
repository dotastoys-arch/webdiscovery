'use client';

import { useEffect } from 'react';

// Pingt één keer de view-tracker als een echte bezoeker de preview opent.
export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `wd_viewed_${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    fetch(`/api/track/view?slug=${encodeURIComponent(slug)}`, { method: 'POST' }).catch(() => {});
  }, [slug]);
  return null;
}
