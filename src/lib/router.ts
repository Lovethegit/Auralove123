import { useEffect, useState } from 'react';

type Route = {
  path: string;
  query: Record<string, string>;
};

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  const [path, qs] = hash.split('?');
  const query: Record<string, string> = {};
  if (qs) {
    new URLSearchParams(qs).forEach((v, k) => {
      query[k] = v;
    });
  }
  return { path: path || '/', query };
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const handler = () => setRoute(parseHash());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return route;
}

export function navigate(to: string) {
  if (window.location.hash === `#${to}`) return;
  window.location.hash = to;
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
