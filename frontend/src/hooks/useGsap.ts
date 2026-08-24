import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Hook to animate elements with a stagger reveal effect using GSAP.
 */
export function useStaggerEntrance(selector: string, deps: any[] = []) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const elements = containerRef.current.querySelectorAll(selector);
    if (!elements || elements.length === 0) return;

    gsap.fromTo(
      elements,
      {
        opacity: 0,
        y: 16,
        scale: 0.98,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.45,
        stagger: 0.06,
        ease: 'power2.out',
      }
    );
  }, deps);

  return containerRef;
}

/**
 * Hook to animate a numeric counter smoothly with GSAP.
 */
export function useAnimatedNumber(value: number, duration: number = 1.0) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    if (!numberRef.current) return;

    const obj = { val: prevValue.current };
    gsap.to(obj, {
      val: value,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (numberRef.current) {
          numberRef.current.textContent = Math.round(obj.val).toString();
        }
      },
    });
    prevValue.current = value;
  }, [value, duration]);

  return numberRef;
}
