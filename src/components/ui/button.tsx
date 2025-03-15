import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, ElementType, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
  as?: ElementType;
  to?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', as, asChild, to, children, ...props }, ref) => {
    const Comp = as || (to ? Link : motion.button);
    
    const baseStyles = cn(
      'relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      {
        'bg-gradient-to-r from-luxury-gold to-yellow-500 text-black hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] active:scale-[0.98]': variant === 'primary',
        'bg-luxury-purple text-white hover:bg-opacity-90 active:scale-[0.98]': variant === 'secondary',
        'border-2 border-luxury-gold bg-transparent text-luxury-gold hover:bg-luxury-gold/10': variant === 'outline',
        'bg-transparent text-white hover:bg-white/10': variant === 'ghost',
        'h-9 px-4 text-sm': size === 'sm',
        'h-12 px-6 text-base': size === 'md',
        'h-14 px-8 text-lg': size === 'lg',
      },
      className
    );

    const buttonContent = (
      <>
        <span className="relative z-10">{children}</span>
        {variant === 'primary' && (
          <div className="absolute inset-0 -z-10 animate-shimmer bg-shimmer bg-[length:200%_100%] opacity-0 transition-opacity hover:opacity-100" />
        )}
      </>
    );

    if (to) {
      return (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link to={to} className={baseStyles} {...(props as any)}>
            {buttonContent}
          </Link>
        </motion.div>
      );
    }

    return (
      <Comp
        className={baseStyles}
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {buttonContent}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button };