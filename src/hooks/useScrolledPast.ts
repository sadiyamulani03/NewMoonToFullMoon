import { useState, useEffect } from 'react';

/**
 * useScrolledPast — returns true when user has scrolled past `threshold` pixels.
 * Used for topbar shrink/frost effect.
 */
export function useScrolledPast(threshold = 32): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > threshold);
    };
    handler(); // check initial
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [threshold]);

  return scrolled;
}
