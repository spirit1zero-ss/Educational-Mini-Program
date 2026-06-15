import { useEffect, useState } from 'react';

export default function useCrmebData(loader, fallback, deps = []) {
  const [data, setData] = useState(fallback);
  const [status, setStatus] = useState('fallback');

  useEffect(() => {
    let alive = true;
    setStatus('loading');

    loader()
      .then((nextData) => {
        if (!alive) return;
        const hasData = nextData && (!Array.isArray(nextData) || nextData.length > 0);
        setData(hasData ? nextData : fallback);
        setStatus(hasData ? 'live' : 'fallback');
      })
      .catch(() => {
        if (!alive) return;
        setData(fallback);
        setStatus('fallback');
      });

    return () => {
      alive = false;
    };
  }, deps);

  return { data, status };
}
