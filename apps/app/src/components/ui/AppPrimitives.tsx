import { Button } from '@min-egenkontroll/design-system';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

function classes(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(' ');
}

type SurfaceProps = HTMLAttributes<HTMLElement> & { children: ReactNode };

export function AppSurface({ children, className, ...props }: SurfaceProps) {
  return <section className={classes('app-surface', className)} {...props}>{children}</section>;
}

export function AppSectionCard({ children, className, ...props }: SurfaceProps) {
  return <section className={classes('app-section-card', className)} {...props}>{children}</section>;
}

type AppIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  'aria-label': string;
  children: ReactNode;
};

export function AppIconButton({ children, className, ...props }: AppIconButtonProps) {
  return <Button className={classes('app-icon-button', className)} variant="ghost" {...props}>{children}</Button>;
}

type AppStatusIndicatorProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
};

export function AppStatusIndicator({ children, className, tone = 'neutral', ...props }: AppStatusIndicatorProps) {
  return <span className={classes('app-status-indicator', `app-status-indicator--${tone}`, className)} {...props}>{children}</span>;
}

export function AppNavButton({ children, className, type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={classes('app-nav-button', className)} type={type} {...props}>{children}</button>;
}
