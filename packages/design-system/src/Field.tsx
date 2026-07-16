import type { ReactNode } from 'react';

export type FieldControlProps = {
  'aria-describedby'?: string;
  'aria-invalid': true | undefined;
  'aria-required': true | undefined;
  id: string;
  required: boolean;
};

type FieldProps = {
  children: (controlProps: FieldControlProps) => ReactNode;
  error?: string;
  hint?: string;
  id: string;
  label: string;
  required?: boolean;
};

export function Field({ children, error, hint, id, label, required = false }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="ds-field">
      <label className="ds-field__label" htmlFor={id}>{label}{required ? <span aria-hidden="true"> *</span> : null}</label>
      {hint ? <p className="ds-field__hint" id={hintId}>{hint}</p> : null}
      {children({ 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined, 'aria-required': required || undefined, id, required })}
      {error ? <p className="ds-field__error" id={errorId}>{error}</p> : null}
    </div>
  );
}
