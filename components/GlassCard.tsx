
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hoverable = false
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white/90 dark:bg-braid-dark-panel/80 backdrop-blur-xl border border-braid-primary/10 dark:border-white/5 rounded-[2.5rem] p-8 shadow-soft dark:shadow-soft-dark relative overflow-hidden transition-all duration-500
        ${hoverable ? 'hover:border-braid-primary/30 dark:hover:border-braid-primary/50 hover:shadow-gold-glow dark:hover:shadow-gold-glow-dark cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Decorative floral accent */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-braid-primary/5 dark:bg-braid-primary/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-braid-secondary/5 dark:bg-braid-secondary/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
