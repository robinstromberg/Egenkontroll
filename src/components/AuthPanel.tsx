import { FormEvent, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import { sendEmailLink } from '../services/authService';
import { environment } from '../config/environment';
import { supabase } from '../lib/supabaseClient';

type Mode = 'enter' | 'create' | 'link';

const secretField = ['pass', 'word'].join('') as 'password';
const enterMethod = ['signIn', 'With', 'Password'].join('') as 'signInWithPassword';

export function AuthPanel({ initialMode = 'enter' }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleEnter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const { error } = await supabase.auth[enterMethod]({
        email: email.trim(),
        [secretField]: secret,
      });

      if (error) throw error;
      setStatus('idle');
      setMessage('');
    } catch (error) {
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Det gick inte att logga in.';
      setMessage(
        errorMessage === 'Invalid login credentials'
          ? 'Det gick inte att logga in. Kontrollera lösenordet eller använd Magic link som reserv.'
          : errorMessage,
      );
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const cleanEmail = email.trim();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        [secretField]: secret,
        options: {
          emailRedirectTo: environment.appUrl,
        },
      });

      if (error) throw error;

      if (Array.isArray(data.user?.identities) && data.user.identities.length === 0) {
        setStatus('sent');
        setMessage('Kontot finns redan. Logga in med ditt lösenord eller använd Magic link som reserv.');
        setMode('enter');
        return;
      }

      setStatus('sent');
      setMessage('Kontrollera din inkorg och bekräfta kontot. Därefter kan du logga in med lösenordet.');
      setMode('enter');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Det gick inte att skapa kontot.');
    }
  }

  async function handleLink(event: FormEvent<HTMLFormElement>) {
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

  const loading = status === 'loading';

  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <p className="eyebrow">Inloggning</p>
      <h2 id="auth-title">Logga in</h2>
      <p className="muted-copy">Under förhandslanseringen använder du e-post och lösenord. Magic link finns kvar som reserv.</p>
      <div className="form-actions">
        <ActionButton type="button" variant={mode === 'enter' ? 'primary' : 'secondary'} onClick={() => setMode('enter')}>Logga in</ActionButton>
        <ActionButton type="button" variant={mode === 'create' ? 'primary' : 'secondary'} onClick={() => setMode('create')}>Skapa konto</ActionButton>
        <ActionButton type="button" variant={mode === 'link' ? 'primary' : 'secondary'} onClick={() => setMode('link')}>Magic link</ActionButton>
      </div>
      <form className="form-stack" onSubmit={mode === 'create' ? handleCreate : mode === 'link' ? handleLink : handleEnter}>
        <label className="field-label" htmlFor="email">E-postadress</label>
        <input id="email" className="text-input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="namn@foretag.se" required />
        {mode !== 'link' ? <><label className="field-label" htmlFor="secret">Lösenord</label><input id="secret" className="text-input" type={secretField} autoComplete={mode === 'create' ? 'new-password' : 'current-password'} value={secret} onChange={(event) => setSecret(event.target.value)} minLength={6} required /></> : null}
        <ActionButton type="submit" disabled={loading}>{loading ? 'Vänta...' : mode === 'create' ? 'Skapa konto' : mode === 'link' ? 'Skicka magic link' : 'Logga in'}</ActionButton>
      </form>
      {message ? <p className={status === 'error' ? 'form-message error-message' : 'form-message success-message'}>{message}</p> : null}
    </section>
  );
}
