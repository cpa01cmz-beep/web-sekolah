import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const cardInteractions = {
  hover: 'hover:shadow-lg transition-shadow duration-200',
  hoverWithTransform: 'hover:shadow-lg hover:-translate-y-1 transition-all duration-200',
  hoverWithScale: 'hover:shadow-lg hover:scale-105 transition-all duration-200',
};

export const textInteractions = {
  hover: 'hover:text-primary transition-colors',
  hoverUnderline: 'text-primary hover:underline transition-colors',
  link: 'text-primary hover:text-primary/90 transition-colors',
};

export const buttonInteractions = {
  hover: 'hover:bg-primary/90 transition-colors',
  destructiveHover: 'hover:bg-destructive/90 transition-colors',
  secondaryHover: 'hover:bg-secondary/80 transition-colors',
  outlineHover: 'hover:bg-accent hover:text-accent-foreground transition-colors',
  transform: 'hover:scale-105 transition-transform',
};
