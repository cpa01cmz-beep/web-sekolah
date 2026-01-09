import { describe, it, expect } from 'vitest';
import { cn, cardInteractions, textInteractions, buttonInteractions } from '../utils';
import type { ClassValue } from 'clsx';

describe('cn() - Class Name Utility', () => {
  describe('Happy Path - Valid Inputs', () => {
    it('should merge single class name correctly', () => {
      // Arrange
      const input = 'text-primary';
      // Act
      const result = cn(input);
      // Assert
      expect(result).toBe('text-primary');
    });

    it('should merge multiple class names correctly', () => {
      // Arrange
      const inputs = ['text-primary', 'font-bold', 'bg-blue-500'];
      // Act
      const result = cn(...inputs);
      // Assert
      expect(result).toBe('text-primary font-bold bg-blue-500');
    });

    it('should handle conditional class names with boolean values', () => {
      // Arrange
      const condition = true;
      const input = ['text-primary', condition && 'font-bold', !condition && 'italic'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('text-primary font-bold');
    });

    it('should handle conditional class names with false values', () => {
      // Arrange
      const condition = false;
      const input = ['text-primary', condition && 'font-bold', !condition && 'italic'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('text-primary italic');
    });

    it('should merge arrays of class names', () => {
      // Arrange
      const input = [['text-primary', 'font-bold'], ['bg-blue-500', 'p-4']];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('text-primary font-bold bg-blue-500 p-4');
    });

    it('should handle objects with boolean values', () => {
      // Arrange
      const input = {
        'text-primary': true,
        'font-bold': true,
        'italic': false
      };
      // Act
      const result = cn(input);
      // Assert
      expect(result).toBe('text-primary font-bold');
    });

    it('should handle mixed input types (strings, arrays, objects)', () => {
      // Arrange
      const input = [
        'text-primary',
        ['font-bold', { 'bg-blue-500': true, 'italic': false }],
        { 'p-4': true }
      ];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('text-primary font-bold bg-blue-500 p-4');
    });
  });

  describe('Tailwind CSS Merge - Conflict Resolution', () => {
    it('should remove duplicate class names', () => {
      // Arrange
      const input = ['text-primary', 'text-primary', 'font-bold'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('text-primary font-bold');
    });

    it('should handle Tailwind conflicting classes - padding', () => {
      // Arrange
      const input = ['p-4', 'p-8'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('p-8'); // Last one wins
    });

    it('should handle Tailwind conflicting classes - margin', () => {
      // Arrange
      const input = ['m-4', 'm-2'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('m-2'); // Last one wins
    });

    it('should handle Tailwind conflicting classes - colors', () => {
      // Arrange
      const input = ['text-red-500', 'text-blue-500'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('text-blue-500'); // Last one wins
    });

    it('should handle Tailwind conflicting classes - background', () => {
      // Arrange
      const input = ['bg-red-500', 'bg-blue-500'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('bg-blue-500'); // Last one wins
    });

    it('should handle Tailwind conflicting classes - font size', () => {
      // Arrange
      const input = ['text-sm', 'text-lg'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('text-lg'); // Last one wins
    });

    it('should preserve non-conflicting Tailwind classes', () => {
      // Arrange
      const input = ['p-4', 'text-primary', 'm-2', 'bg-blue-500'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('p-4 text-primary m-2 bg-blue-500');
    });

    it('should handle complex Tailwind class combinations', () => {
      // Arrange
      const input = ['hover:bg-blue-600', 'active:bg-blue-700', 'focus:ring-2'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('hover:bg-blue-600 active:bg-blue-700 focus:ring-2');
    });

    it('should handle arbitrary values', () => {
      // Arrange
      const input = ['w-[500px]', 'h-[300px]'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('w-[500px] h-[300px]');
    });
  });

  describe('Edge Cases - Empty and Null Inputs', () => {
    it('should handle empty string', () => {
      // Arrange
      const input = '';
      // Act
      const result = cn(input);
      // Assert
      expect(result).toBe('');
    });

    it('should handle empty array', () => {
      // Arrange
      const input: string[] = [];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('');
    });

    it('should handle null values', () => {
      // Arrange
      const input = ['text-primary', null, 'font-bold'];
      // Act
      const result = cn(input as any);
      // Assert
      expect(result).toBe('text-primary font-bold');
    });

    it('should handle undefined values', () => {
      // Arrange
      const input = ['text-primary', undefined, 'font-bold'];
      // Act
      const result = cn(input as any);
      // Assert
      expect(result).toBe('text-primary font-bold');
    });

    it('should handle multiple empty strings', () => {
      // Arrange
      const input = ['', '', ''];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('');
    });

    it('should handle mix of empty and valid class names', () => {
      // Arrange
      const input = ['', 'text-primary', '', 'font-bold', ''];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('text-primary font-bold');
    });

    it('should handle no arguments', () => {
      // Arrange & Act
      const result = cn();
      // Assert
      expect(result).toBe('');
    });

    it('should handle objects with all false values', () => {
      // Arrange
      const input = {
        'text-primary': false,
        'font-bold': false
      };
      // Act
      const result = cn(input);
      // Assert
      expect(result).toBe('');
    });
  });

  describe('Special Characters and Spaces', () => {
    it('should handle class names with underscores', () => {
      // Arrange
      const input = ['text_primary', 'font_bold'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('text_primary font_bold');
    });

    it('should handle class names with dashes', () => {
      // Arrange
      const input = ['text-primary', 'bg-blue-500', 'font-bold'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('text-primary bg-blue-500 font-bold');
    });

    it('should handle class names with colons (modifiers)', () => {
      // Arrange
      const input = ['hover:text-primary', 'focus:ring-2', 'md:text-lg'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('hover:text-primary focus:ring-2 md:text-lg');
    });

    it('should handle class names with slashes', () => {
      // Arrange
      const input = ['w-1/2', 'h-1/3', 'bg-blue-500/80'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('w-1/2 h-1/3 bg-blue-500/80');
    });

    it('should handle class names with brackets (arbitrary values)', () => {
      // Arrange
      const input = ['w-[100px]', 'h-[50px]', 'bg-[#ff0000]'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('w-[100px] h-[50px] bg-[#ff0000]');
    });

    it('should handle class names with exclamation marks (important)', () => {
      // Arrange
      const input = ['!text-primary', '!font-bold'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('!text-primary !font-bold');
    });

    it('should handle class names with square brackets', () => {
      // Arrange
      const input = ['group-hover:text-primary', 'peer-focus:ring-2'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('group-hover:text-primary peer-focus:ring-2');
    });
  });

  describe('Long and Complex Inputs', () => {
    it('should handle many class names (50+)', () => {
      // Arrange
      const classes = Array.from({ length: 50 }, (_, i) => `class-${i}`);
      // Act
      const result = cn(...classes);
      // Assert
      expect(result).toBe(classes.join(' '));
    });

    it('should handle very long class names', () => {
      // Arrange
      const longClassName = 'a'.repeat(100);
      const input = [longClassName, 'text-primary'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe(`${longClassName} text-primary`);
    });

    it('should handle deeply nested arrays', () => {
      // Arrange
      const input = [[['text-primary'], ['font-bold']], [['bg-blue-500'], ['p-4']]];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('text-primary font-bold bg-blue-500 p-4');
    });

    it('should handle mixed nesting levels', () => {
      // Arrange
      const input = [
        'text-primary',
        [['font-bold', 'bg-blue-500']],
        { 'p-4': true, 'm-2': true }
      ];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('text-primary font-bold bg-blue-500 p-4 m-2');
    });
  });

  describe('Real-World Usage Patterns', () => {
    it('should handle conditional rendering pattern', () => {
      // Arrange
      const isActive = true;
      const isLoading = false;
      const input = [
        'base-class',
        isActive && 'active-class',
        isLoading && 'loading-class'
      ];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('base-class active-class');
    });

    it('should handle responsive design pattern', () => {
      // Arrange
      const input = [
        'text-sm',
        'md:text-base',
        'lg:text-lg',
        'xl:text-xl'
      ];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('text-sm md:text-base lg:text-lg xl:text-xl');
    });

    it('should handle state-based styling pattern', () => {
      // Arrange
      const isError = true;
      const isSuccess = false;
      const input = {
        'text-primary': !isError && !isSuccess,
        'text-red-500': isError,
        'text-green-500': isSuccess,
        'font-bold': true
      };
      // Act
      const result = cn(input);
      // Assert
      expect(result).toBe('text-red-500 font-bold');
    });

    it('should handle component variant pattern', () => {
      // Arrange
      let variant: string = 'primary';
      let size: string = 'lg';
      const input = [
        'base-class',
        variant === 'primary' && 'bg-blue-500',
        variant === 'secondary' && 'bg-gray-500',
        size === 'sm' && 'text-sm',
        size === 'lg' && 'text-lg'
      ];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('base-class bg-blue-500 text-lg');
    });

    it('should handle modifier pattern (hover, focus, active)', () => {
      // Arrange
      const input = [
        'bg-blue-500',
        'hover:bg-blue-600',
        'focus:ring-2',
        'focus:ring-blue-300',
        'active:bg-blue-700'
      ];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 active:bg-blue-700');
    });
  });

  describe('Interaction Style Constants', () => {
    describe('cardInteractions', () => {
      it('should have hover interaction', () => {
        // Act & Assert
        expect(cardInteractions.hover).toBe('hover:shadow-lg transition-shadow duration-200');
      });

      it('should have hover with transform interaction', () => {
        // Act & Assert
        expect(cardInteractions.hoverWithTransform).toBe('hover:shadow-lg hover:-translate-y-1 transition-all duration-200');
      });

      it('should have hover with scale interaction', () => {
        // Act & Assert
        expect(cardInteractions.hoverWithScale).toBe('hover:shadow-lg hover:scale-105 transition-all duration-200');
      });
    });

    describe('textInteractions', () => {
      it('should have hover interaction', () => {
        // Act & Assert
        expect(textInteractions.hover).toBe('hover:text-primary transition-colors');
      });

      it('should have hover underline interaction', () => {
        // Act & Assert
        expect(textInteractions.hoverUnderline).toBe('text-primary hover:underline transition-colors');
      });

      it('should have link interaction', () => {
        // Act & Assert
        expect(textInteractions.link).toBe('text-primary hover:text-primary/90 transition-colors');
      });
    });

    describe('buttonInteractions', () => {
      it('should have hover interaction', () => {
        // Act & Assert
        expect(buttonInteractions.hover).toBe('hover:bg-primary/90 transition-colors');
      });

      it('should have destructive hover interaction', () => {
        // Act & Assert
        expect(buttonInteractions.destructiveHover).toBe('hover:bg-destructive/90 transition-colors');
      });

      it('should have secondary hover interaction', () => {
        // Act & Assert
        expect(buttonInteractions.secondaryHover).toBe('hover:bg-secondary/80 transition-colors');
      });

      it('should have outline hover interaction', () => {
        // Act & Assert
        expect(buttonInteractions.outlineHover).toBe('hover:bg-accent hover:text-accent-foreground transition-colors');
      });

      it('should have transform interaction', () => {
        // Act & Assert
        expect(buttonInteractions.transform).toBe('hover:scale-105 transition-transform');
      });
    });

    describe('Integration with cn()', () => {
      it('should combine cn() with cardInteractions', () => {
        // Arrange
        const baseClasses = ['card', 'p-4'];
        const interaction = cardInteractions.hover;
        // Act
        const result = cn(...baseClasses, interaction);
        // Assert
        expect(result).toBe('card p-4 hover:shadow-lg transition-shadow duration-200');
      });

      it('should combine cn() with textInteractions', () => {
        // Arrange
        const baseClasses = ['text-base', 'font-medium'];
        const interaction = textInteractions.hoverUnderline;
        // Act
        const result = cn(...baseClasses, interaction);
        // Assert
        expect(result).toBe('text-base font-medium text-primary hover:underline transition-colors');
      });

      it('should combine cn() with buttonInteractions', () => {
        // Arrange
        const baseClasses = ['px-4', 'py-2', 'rounded', 'text-white'];
        const interaction = buttonInteractions.transform;
        // Act
        const result = cn(...baseClasses, interaction);
        // Assert
        expect(result).toBe('px-4 py-2 rounded text-white hover:scale-105 transition-transform');
      });
    });
  });

  describe('Performance Considerations', () => {
    it('should handle repeated calls without performance degradation', () => {
      // Arrange
      const input = ['text-primary', 'font-bold', 'bg-blue-500'];
      const iterations = 100;
      
      // Act
      const startTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        cn(...input);
      }
      const endTime = performance.now();
      
      // Assert
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(100); // Should complete in < 100ms
    });

    it('should produce consistent output for same inputs', () => {
      // Arrange
      const input = ['text-primary', 'font-bold', 'bg-blue-500'];
      
      // Act
      const result1 = cn(...input);
      const result2 = cn(...input);
      const result3 = cn(...input);
      
      // Assert
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('should handle large class name sets efficiently', () => {
      // Arrange
      const input = Array.from({ length: 100 }, (_, i) => `class-${i}`);
      
      // Act
      const startTime = performance.now();
      const result = cn(...input);
      const endTime = performance.now();
      
      // Assert
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(50); // Should complete in < 50ms
      expect(result).toBe(input.join(' '));
    });
  });

  describe('TypeScript Type Safety', () => {
    it('should accept ClassValue type from clsx', () => {
      // Arrange
      const input: ClassValue[] = ['text-primary', { 'font-bold': true }];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('text-primary font-bold');
    });

    it('should accept string type', () => {
      // Arrange
      const input: string = 'text-primary';
      // Act
      const result = cn(input);
      // Assert
      expect(result).toBe('text-primary');
    });

    it('should accept array type', () => {
      // Arrange
      const input: string[] = ['text-primary', 'font-bold'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('text-primary font-bold');
    });

    it('should accept object type', () => {
      // Arrange
      const input: Record<string, boolean> = { 'text-primary': true, 'font-bold': true };
      // Act
      const result = cn(input);
      // Assert
      expect(result).toBe('text-primary font-bold');
    });
  });

  describe('Integration with clsx and tailwind-merge', () => {
    it('should properly merge conditional classes from clsx', () => {
      // Arrange
      const isActive = true;
      const isDisabled = false;
      const input = [
        'base-class',
        isActive && 'active',
        isDisabled && 'disabled'
      ];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('base-class active');
    });

    it('should properly resolve conflicts using tailwind-merge', () => {
      // Arrange
      const input = ['p-4', 'p-2', 'm-4', 'm-8'];
      // Act
      const result = cn(...input);
      // Assert
      expect(result).toBe('p-2 m-8'); // Last classes win for each type
    });

    it('should handle complex clsx patterns with tailwind-merge', () => {
      // Arrange
      const input = [
        'text-sm p-4',
        'md:text-base md:p-6',
        'lg:text-lg lg:p-8',
        'p-2', // Conflicts with p-4 (base padding)
      ];
      // Act
      const result = cn(...input);
      // Assert
      // p-2 wins over p-4 (base), but responsive modifiers (md:p-6, lg:p-8) remain
      // tailwind-merge preserves responsive modifiers as they apply at different breakpoints
      expect(result).toBe('text-sm md:text-base md:p-6 lg:text-lg lg:p-8 p-2');
    });
  });
});
