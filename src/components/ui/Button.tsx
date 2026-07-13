import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  loading?: boolean;
  loadingText?: string;
  variant?: ButtonVariant;
};

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  disabled?: boolean;
  variant?: Exclude<ButtonVariant, 'danger'>;
};

export function Button({ children, className = '', disabled = false, loading = false, loadingText = 'Laddar', type = 'button', variant = 'primary', ...props }: ButtonProps) {
  return (
    <button aria-busy={loading || undefined} className={`ds-button ds-button--${variant} ${className}`.trim()} disabled={disabled || loading} type={type} {...props}>
      {loading ? loadingText : children}
    </button>
  );
}

export function LinkButton({ children, className = '', disabled = false, href, variant = 'primary', ...props }: LinkButtonProps) {
  return (
    <a aria-disabled={disabled || undefined} className={`ds-button ds-button--${variant} ${disabled ? 'ds-button--disabled' : ''} ${className}`.trim()} href={disabled ? undefined : href} tabIndex={disabled ? -1 : undefined} {...props}>
      {children}
    </a>
  );
}
