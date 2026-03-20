
import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'embossed';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  fullWidth = false,
  ...props 
}) => {
  const baseStyles = "px-8 py-3.5 rounded-full font-medium tracking-tight transition-all border flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase text-xs";
  
  const variants = {
    primary: "bg-braid-primary text-white shadow-soft border-transparent hover:bg-braid-primary/90 dark:shadow-soft-dark",
    secondary: "bg-braid-secondary text-white shadow-soft border-transparent hover:bg-braid-secondary/90 dark:shadow-soft-dark",
    outline: "bg-transparent border border-braid-primary text-braid-primary hover:bg-braid-primary/5 dark:text-braid-primary dark:border-braid-primary/40",
    ghost: "bg-transparent border-transparent text-braid-muted hover:text-braid-text hover:bg-braid-primary/5 dark:text-braid-dark-muted dark:hover:text-braid-dark-text",
    embossed: "bg-braid-bg text-braid-primary border-transparent soft-emboss hover:scale-[1.03] active:scale-[0.98] shadow-embossed dark:bg-braid-dark-panel dark:text-braid-primary dark:shadow-embossed-dark dark:hover:bg-braid-dark-panel/80",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
