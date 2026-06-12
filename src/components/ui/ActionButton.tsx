import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ActionVariant = 'primary' | 'secondary';

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ActionVariant;
};

export function ActionButton({ children, className = '', variant = 'primary', ...props }: ActionButtonProps) {
  const baseClass = variant === 'primary' ? 'primary-button' : 'secondary-button';
  const classes = [baseClass, className].filter(Boolean).join(' ');
  return <button className={classes} {...props}>{children}</button>;
}
