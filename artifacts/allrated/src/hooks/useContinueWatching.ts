import { useEffect, useState } from 'react';
import type { Title } from '@workspace/api-client-react';

const CW_KEY = 'movietalk.continue-watching';

interface ContinueItem extends Title {
  progress: number; // 0-100
  timestamp: number;
}

export function useContinueWatching() {
  const [titles, setTitles] = useState<Title[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CW_KEY);
      if (raw) {
        const items: ContinueItem[] = JSON.parse(raw);
        setTitles(items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20));
      }
    } catch {
      // ignore
    }
  }, []);

  return { titles };
}
