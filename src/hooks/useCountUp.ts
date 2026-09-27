import { useState, useEffect, useRef } from 'react';

/**
 * useCountUp — animates a number from 0 → target with easeOutExpo.
 * Returns the current display value as a string.
 *
 * @param target — the final number to animate to
 * @param duration — animation duration in ms (default 1200)
 * @param enabled — whether the animation should start (default true)
 */
export function useCountUp(target: number, duration = 1200, enabled = true): string {
  const [value, setValue] = useState(0);
  const rafRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (!enabled || target <= 0) {
      setValue(target);
      return;
    }

    setValue(0);
    startRef.current = 0;

    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);

      setValue(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    // Small delay so the element renders first
    const timer = setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, enabled]);

  return value.toLocaleString();
}
