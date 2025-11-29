import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2 rounded-lg border-2 transition-all bg-[#124723] text-[#f8df7e] placeholder-[#68b258]',
            'focus:outline-none focus:ring-2 focus:ring-[#ffd402] focus:border-[#ffd402]',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#1d1d1b]',
            error ? 'border-[#baa115]' : 'border-[#68b258]',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
