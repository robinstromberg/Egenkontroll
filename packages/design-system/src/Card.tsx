import type { HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  elevated?: boolean;
};

export function Card({ children, className = '', elevated = false, ...props }: CardProps) {
  return <section className={`ds-card ${elevated ? 'ds-card--elevated' : ''} ${className}`.trim()} {...props}>{children}</section>;
}
