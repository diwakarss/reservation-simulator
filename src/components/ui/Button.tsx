'use client';

/**
 * Button
 *
 * Reusable button component with variants for the Reservation Simulator.
 * Supports primary (gold CTA), secondary (outlined), and ghost variants.
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Make button full width */
  fullWidth?: boolean;
  /** Optional icon to show before text */
  leftIcon?: ReactNode;
  /** Optional icon to show after text */
  rightIcon?: ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Children elements */
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-br from-accent-gold to-yellow-600
    text-deep-purple font-bold
    shadow-lg shadow-accent-gold/30
    hover:shadow-xl hover:shadow-accent-gold/50
    hover:-translate-y-0.5
    active:translate-y-0
    border-0
  `,
  secondary: `
    bg-transparent
    text-accent-gold
    border-2 border-accent-gold
    hover:bg-accent-gold/10
    hover:shadow-lg hover:shadow-accent-gold/30
    hover:-translate-y-0.5
    active:translate-y-0
  `,
  ghost: `
    bg-white/5
    text-muted-text
    border border-transparent
    hover:bg-white/10
    hover:text-white
    hover:border-white/20
  `,
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-base',
  lg: 'h-13 px-8 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      loading = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center gap-2
          font-rajdhani font-semibold
          rounded-lg
          transition-all duration-200 ease-out
          uppercase tracking-wider
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-offset-2 focus:ring-offset-deep-purple
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <span className="animate-spin mr-2">
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}

        <span>{children}</span>

        {rightIcon && !loading && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
