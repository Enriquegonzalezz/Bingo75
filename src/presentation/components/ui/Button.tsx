import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: 'bg-[#ffd402] text-[#124723] hover:bg-[#baa115] active:bg-[#baa115]',
      secondary: 'bg-[#68b258] text-white hover:bg-[#124723] active:bg-[#124723]',
      outline: 'border-2 border-[#ffd402] text-[#ffd402] hover:bg-[#ffd402] hover:text-[#124723]',
      destructive: 'bg-[#baa115] text-[#1d1d1b] hover:bg-[#ffd402] active:bg-[#ffd402]',
      ghost: 'text-[#f8df7e] hover:bg-[#68b258] hover:text-white',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-lg transition-all',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffd402]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
