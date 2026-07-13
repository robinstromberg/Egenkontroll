import { useId, type FormEvent, type InputHTMLAttributes } from 'react';
import { Button } from './Button';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };
type SearchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: string; onSearch: (value: string) => void; submitLabel?: string };

export function TextField({ className = '', invalid = false, ...props }: TextFieldProps) {
  return <input className={`ds-text-field ${invalid ? 'ds-text-field--invalid' : ''} ${className}`.trim()} {...props} />;
}

export function SearchField({ id, label, onSearch, submitLabel = 'Sök', ...props }: SearchFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSearch(String(formData.get('search') ?? '').trim());
  }

  return (
    <form className="ds-search-field" role="search" onSubmit={handleSubmit}>
      <label className="ds-field__label" htmlFor={inputId}>{label}</label>
      <div className="ds-search-field__row">
        <TextField {...props} id={inputId} name="search" type="search" />
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
