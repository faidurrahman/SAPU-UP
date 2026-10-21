import React, { useEffect, useRef, useState } from 'react';

export interface ScrollRevealProps {
  children: React.ReactNode;
  /** Delay in milliseconds before animation starts once in view */
  delay?: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Distance in pixels for the slide transition */
  distance?: number;
  /** Slide direction: 'up' (default slide from bottom), 'down', 'left', 'right', or 'none' */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  /** Percentage of element visibility required to trigger animation (0.0 to 1.0) */
  threshold?: number;
  /** Root margin offset for intersection calculation */
  rootMargin?: string;
  /** Custom wrapper classes */
  className?: string;
  /** Whether the animation should stay triggered once revealed */
  triggerOnce?: boolean;
}

/**
 * ScrollReveal Component
 * Smooth scroll-triggered fade-in & slide-up reveal animation with zero external dependencies.
 * Uses high-performance native IntersectionObserver with hardware-accelerated transforms.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  duration = 650,
  distance = 32,
  direction = 'up',
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
  className = '',
  triggerOnce = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        setIsVisible(true);
        return;
      }
    }

    const node = elementRef.current;
    if (!node) return;

    // Fallback if IntersectionObserver isn't supported
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  const getInitialTransform = () => {
    switch (direction) {
      case 'up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'left':
        return `translate3d(${distance}px, 0, 0)`;
      case 'right':
        return `translate3d(-${distance}px, 0, 0)`;
      case 'none':
        return 'translate3d(0, 0, 0)';
      default:
        return `translate3d(0, ${distance}px, 0)`;
    }
  };

  const animationStyle: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translate3d(0, 0, 0)' : getInitialTransform(),
    transitionProperty: 'opacity, transform',
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)', // Smooth ease-out deceleration
    transitionDelay: `${delay}ms`,
    willChange: isVisible ? 'auto' : 'opacity, transform',
  };

  return (
    <div ref={elementRef} style={animationStyle} className={className}>
      {children}
    </div>
  );
};
