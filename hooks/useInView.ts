import { useEffect, useRef, useState } from 'react';

/**
 * Hook to detect when an element enters the viewport.
 * Returns a ref to attach to the element and a boolean indicating visibility.
 * Resets when leaving viewport to allow animation replay on each scroll.
 */
export function useInView(options?: IntersectionObserverInit): [React.RefObject<HTMLDivElement>, boolean] {
    const ref = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                // Set true when entering, false when leaving - allows animation replay
                setIsInView(entry.isIntersecting);
            },
            {
                threshold: 0.2, // Trigger when 20% visible
                ...options
            }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [options]);

    return [ref, isInView];
}
