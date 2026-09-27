import { useEffect, useRef, useCallback } from 'react';

/**
 * useScrollReveal — Intersection Observer hook for scroll-triggered animations.
 * Returns a ref callback to attach to any container. Children with `data-reveal`
 * will receive the `.revealed` class when they enter the viewport.
 *
 * @param threshold — fraction of element visible before triggering (default 0.12)
 * @param rootMargin — margin around viewport for early trigger (default '0px 0px -40px 0px')
 */
export function useScrollReveal(threshold = 0.12, rootMargin = '0px 0px -40px 0px') {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (!containerRef.current || !observerRef.current) return;
    const elements = containerRef.current.querySelectorAll('[data-reveal]');
    elements.forEach((el) => observerRef.current!.observe(el));

    return () => {
      elements.forEach((el) => observerRef.current?.unobserve(el));
    };
  });

  const setRef = useCallback((node: HTMLElement | null) => {
    containerRef.current = node;
  }, []);

  return setRef;
}
