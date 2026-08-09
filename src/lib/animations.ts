import { Variants } from 'framer-motion';

// Page entrance transition
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.25, ease: 'easeIn' } },
};

// Container stagger animation for grids
export const containerStagger: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// Item reveal animation
export const itemFadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// Lightbox modal scale entrance
export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } },
};
