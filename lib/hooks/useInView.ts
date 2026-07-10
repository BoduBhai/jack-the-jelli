import { useEffect, useRef, useState } from "react";

export function useInView(
  options?: IntersectionObserverInit,
  rootMargin: string = "0px"
) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, ...options }
    );

    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const inView = rect.top <= window.innerHeight && rect.bottom >= 0;
      if (inView) {
        setIsVisible(true);
      } else {
        observer.observe(ref.current);
      }
    }

    return () => observer.disconnect();
  }, [options, rootMargin]);

  return { ref, isVisible };
}
