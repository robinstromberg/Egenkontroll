import type { HTMLAttributes, ReactNode } from 'react';
import type { StatusTone } from './Badge';

type AlertProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  live?: 'polite' | 'assertive';
  title: string;
  tone?: StatusTone;
};

export function Alert({ children, className = '', live, title, tone = 'neutral', ...props }: AlertProps) {
  const role = live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : undefined;

  return (
    <aside aria-live={live} className={`ds-alert ds-alert--${tone} ${className}`.trim()} role={role} {...props}>
      <strong className="ds-alert__title">{title}</strong>
      <div className="ds-alert__content">{children}</div>
    </aside>
  );
}
