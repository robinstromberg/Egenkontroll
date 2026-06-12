import { FormEvent, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import { sendEmailLink } from '../services/authService';

export function AuthPanel() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      await sendEmailLink(email.trim());
      setStatus('sent');
      setMessage('Kontrollera din inkorg och öppna länken för att logga in.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Det gick inte att skicka länken.');
    }
  }

  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <p className="eyebrow">Inloggning</p>
      <h2 id="auth-title">Logga in med e-post</h2>
      <p className="muted-copy">
        Ange din e-postadress så skickas en inloggningslänk via Supabase Auth.
      </p>
      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="email">E-postadress</label>
        <input
          id="email"
          className="text-input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="namn@foretag.se"
          required
        />
        <ActionButton type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Skickar...' : 'Skicka inloggningslänk'}
        </ActionButton>
      </form>
      {message ? (
        <p className={status === 'error' ? 'form-message error-message' : 'form-message success-message'}>
          {message}
        </p>
      ) : null}
    </section>
  );
}
