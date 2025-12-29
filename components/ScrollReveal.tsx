import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
    children: React.ReactNode;
    width?: "fit-content" | "100%";
    delay?: number; // Delay in seconds
    className?: string; // Additional classes for the wrapper
}

export const ScrollReveal = ({ children, width = "fit-content", delay = 0, className = "" }: ScrollRevealProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // If it's intersecting, set visible. 
                // We add a small threshold (0.1) so it doesn't trigger until slightly visible.
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Once visible, we can stop observing if we only want it to animate once
                    if (ref.current) {
                        observer.unobserve(ref.current);
                    }
                }
            },
            {
                threshold: 0.1,
                rootMargin: "0px 0px -50px 0px" // Start animating slightly before it fully enters
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    const transitionStyle = {
        transitionDuration: '1000ms',
        transitionDelay: `${delay * 1000}ms`,
        transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)', // Smooth ease out
    };

    return (
        <div
            ref={ref}
            style={{ width, ...transitionStyle }}
            className={`
                transform transition-all will-change-transform
                ${isVisible ? 'opacity-100 translate-y-0 translate-x-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}
                ${className}
            `}
        >
            {children}
        </div>
    );
};
