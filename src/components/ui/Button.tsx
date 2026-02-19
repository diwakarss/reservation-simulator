"use client";

import React, { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles =
      "inline-flex items-center justify-center font-orbitron font-bold tracking-wider transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-deep-purple disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";

    // Size styles
    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 rounded-sm",
      md: "text-sm px-6 py-3 rounded",
      lg: "text-base px-8 py-4 rounded-md",
    };

    // Variant styles
    const variantStyles = {
      primary:
        "bg-accent-gold text-deep-purple hover:bg-yellow-400 focus:ring-accent-gold shadow-[0_0_15px_rgba(226,183,20,0.3)] hover:shadow-[0_0_25px_rgba(226,183,20,0.6)] border border-transparent",
      secondary:
        "bg-class-noble text-deep-purple hover:bg-teal-300 focus:ring-class-noble shadow-[0_0_10px_rgba(45,212,191,0.3)] hover:shadow-[0_0_20px_rgba(45,212,191,0.5)] border border-transparent",
      outline:
        "bg-transparent text-accent-gold border border-accent-gold hover:bg-accent-gold/10 focus:ring-accent-gold shadow-[0_0_10px_rgba(226,183,20,0.1)]",
      ghost:
        "bg-transparent text-muted-text hover:text-white hover:bg-white/5 focus:ring-gray-500",
      danger:
        "bg-highlight-red text-white hover:bg-red-600 focus:ring-highlight-red shadow-[0_0_15px_rgba(233,69,96,0.4)]",
    };

    const classes = [
      baseStyles,
      sizeStyles[size],
      variantStyles[variant],
      className
    ].join(" ");

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";


