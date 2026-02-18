import { memo, useMemo } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface AnimationProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

const buildAnimationStyle = (animation: string, prefersReducedMotion: boolean, delay: number, style?: React.CSSProperties): React.CSSProperties => {
  if (prefersReducedMotion) {
    return { opacity: 1, ...style };
  }
  return {
    animation: `${animation} 0.5s ease-out ${delay}s forwards`,
    opacity: 0,
    ...style,
  };
};

export const FadeIn = memo(function FadeIn({ children, delay = 0, className, style }: AnimationProps) {
  const prefersReducedMotion = useReducedMotion();
  const animationStyle = useMemo(
    () => buildAnimationStyle('fadeIn', prefersReducedMotion, delay, style),
    [prefersReducedMotion, delay, style]
  );
  
  return (
    <div className={className} style={animationStyle}>
      {children}
    </div>
  );
});

export const SlideUp = memo(function SlideUp({ children, delay = 0, className, style }: AnimationProps) {
  const prefersReducedMotion = useReducedMotion();
  const animationStyle = useMemo(
    () => buildAnimationStyle('slideUp', prefersReducedMotion, delay, style),
    [prefersReducedMotion, delay, style]
  );
  
  return (
    <div className={className} style={animationStyle}>
      {children}
    </div>
  );
});

export const SlideLeft = memo(function SlideLeft({ children, delay = 0, className, style }: AnimationProps) {
  const prefersReducedMotion = useReducedMotion();
  const animationStyle = useMemo(
    () => buildAnimationStyle('slideLeft', prefersReducedMotion, delay, style),
    [prefersReducedMotion, delay, style]
  );
  
  return (
    <div className={className} style={animationStyle}>
      {children}
    </div>
  );
});

export const SlideRight = memo(function SlideRight({ children, delay = 0, className, style }: AnimationProps) {
  const prefersReducedMotion = useReducedMotion();
  const animationStyle = useMemo(
    () => buildAnimationStyle('slideRight', prefersReducedMotion, delay, style),
    [prefersReducedMotion, delay, style]
  );
  
  return (
    <div className={className} style={animationStyle}>
      {children}
    </div>
  );
});
