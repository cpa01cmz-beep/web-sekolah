import { memo } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface AnimationProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

type AnimationType = 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight';

function createAnimationComponent(animationType: AnimationType) {
  return memo(function Animation({ children, delay = 0, className, style }: AnimationProps) {
    const prefersReducedMotion = useReducedMotion();
    
    return (
      <div
        className={className}
        style={{
          animation: prefersReducedMotion ? 'none' : `${animationType} 0.5s ease-out ${delay}s forwards`,
          opacity: prefersReducedMotion ? 1 : 0,
          ...style,
        }}
      >
        {children}
      </div>
    );
  });
}

export const FadeIn = createAnimationComponent('fadeIn');
export const SlideUp = createAnimationComponent('slideUp');
export const SlideLeft = createAnimationComponent('slideLeft');
export const SlideRight = createAnimationComponent('slideRight');
