import React from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface AnimationProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function FadeIn({ children, delay = 0, className, style }: AnimationProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={className}
      style={{
        animation: prefersReducedMotion ? 'none' : `fadeIn 0.5s ease-out ${delay}s forwards`,
        opacity: prefersReducedMotion ? 1 : 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SlideUp({ children, delay = 0, className, style }: AnimationProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={className}
      style={{
        animation: prefersReducedMotion ? 'none' : `slideUp 0.5s ease-out ${delay}s forwards`,
        opacity: prefersReducedMotion ? 1 : 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SlideLeft({ children, delay = 0, className, style }: AnimationProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={className}
      style={{
        animation: prefersReducedMotion ? 'none' : `slideLeft 0.5s ease-out ${delay}s forwards`,
        opacity: prefersReducedMotion ? 1 : 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SlideRight({ children, delay = 0, className, style }: AnimationProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={className}
      style={{
        animation: prefersReducedMotion ? 'none' : `slideRight 0.5s ease-out ${delay}s forwards`,
        opacity: prefersReducedMotion ? 1 : 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
