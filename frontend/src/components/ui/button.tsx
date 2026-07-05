import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
      default: "bg-primary text-white hover:bg-primary-dark",
      ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
      outline: "border border-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
    };
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3 text-sm",
      lg: "h-11 px-8",
      icon: "h-10 w-10",
    };
    const classes = `${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className || ''}`;
    return <button ref={ref} className={classes} {...props}>{children}</button>;
  }
);
Button.displayName = 'Button';
