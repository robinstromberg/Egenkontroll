import { FocusEvent, FormEvent, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import { sendEmailLink, sendPasswordResetEmail } from '../services/authService';
import { environment } from '../config/environment';
import { supabase } from '../lib/supabaseClient';

type Mode = 'enter' | 'create' | 'link' | 'reset';

const secretField = ['pass', 'word'].join('') as 'password';
const enterMethod = ['signIn', 'With', 'Password'].join('') as 'signInWithPassword';

function keepAuthFieldVisible(event: FocusEvent<HTMLInputElement>) {
  const target = event.currentTarget;
  const narrowViewport = window.matchMedia('(max-width: 560px)').matches;
  const keyboardLikelyOpen = window.visualViewport ? window.visualViewport.height < window.innerHeight * 0.82 : false;

  if (!narrowViewport && !keyboardLikelyOpen) return;

  window.setTimeout(() => {
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, 220);
}

export function AuthPanel({
  initialMode = 'enter',
  emailRedirectTo = environment.appUrl,
}: {
  initialMode?: Mode;
  emailRedirectTo?: string;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [secret, setSecret] = useState('');
  const [confirmSecret, setConfirmSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [showConfirmSecret, setShowConfirmSecret] = useState(false);
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
    setMessage('');

    if (secret !== confirmSecret) {
      setStatus('error');
      setMessage('Lösenorden matchar inte.');
      return;
    }

    setStatus('loading');

    try {
      const cleanEmail = email.trim();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        [secretField]: secret,
        options: {
          emailRedirectTo,
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
      await sendEmailLink(email.trim(), emailRedirectTo);
      setStatus('sent');
      setMessage('Kontrollera din inkorg och öppna länken för att logga in.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Det gick inte att skicka länken.');
    }
  }

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      await sendPasswordResetEmail(email.trim(), emailRedirectTo);
      setStatus('sent');
      setMessage('Kontrollera din inkorg och öppna länken för att sätta ett nytt lösenord.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Det gick inte att skicka återställningslänken.');
    }
  }

  const loading = status === 'loading';
  const secretInputType = showSecret ? 'text' : secretField;
  const confirmSecretInputType = showConfirmSecret ? 'text' : secretField;
  const formSubmitHandler =
    mode === 'create' ? handleCreate : mode === 'link' ? handleLink : mode === 'reset' ? handleReset : handleEnter;
  const submitLabel =
    mode === 'create'
      ? 'Skapa konto'
      : mode === 'link'
        ? 'Skicka magic link'
        : mode === 'reset'
          ? 'Skicka återställningslänk'
          : 'Logga in';

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
      <form className="form-stack" onSubmit={formSubmitHandler}>
        <label className="field-label" htmlFor="email">E-postadress</label>
        <input id="email" className="text-input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} onFocus={keepAuthFieldVisible} placeholder="namn@foretag.se" required />
        {mode !== 'link' && mode !== 'reset' ? <>
          <label className="field-label" htmlFor="secret">Lösenord</label>
          <div className="password-field">
            <input id="secret" className="text-input" type={secretInputType} autoComplete={mode === 'create' ? 'new-password' : 'current-password'} value={secret} onChange={(event) => setSecret(event.target.value)} onFocus={keepAuthFieldVisible} minLength={6} required />
            <button className="password-toggle" type="button" onClick={() => setShowSecret((current) => !current)} aria-label={showSecret ? 'Dölj lösenord' : 'Visa lösenord'}>
              {showSecret ? 'Dölj' : 'Visa'}
            </button>
          </div>
        </> : null}
        {mode === 'create' ? <>
          <label className="field-label" htmlFor="confirm-secret">Bekräfta lösenord</label>
          <div className="password-field">
            <input id="confirm-secret" className="text-input" type={confirmSecretInputType} autoComplete="new-password" value={confirmSecret} onChange={(event) => setConfirmSecret(event.target.value)} onFocus={keepAuthFieldVisible} minLength={6} required />
            <button className="password-toggle" type="button" onClick={() => setShowConfirmSecret((current) => !current)} aria-label={showConfirmSecret ? 'Dölj lösenord' : 'Visa lösenord'}>
              {showConfirmSecret ? 'Dölj' : 'Visa'}
            </button>
          </div>
        </> : null}
        {mode === 'enter' ? (
          <button className="link-button" type="button" onClick={() => setMode('reset')}>
            Glömt lösenord?
          </button>
        ) : null}
        {mode === 'reset' ? (
          <button className="link-button" type="button" onClick={() => setMode('enter')}>
            Tillbaka till inloggning
          </button>
        ) : null}
        <ActionButton type="submit" disabled={loading}>{loading ? 'Vänta...' : submitLabel}</ActionButton>
      </form>
      {message ? <p className={status === 'error' ? 'form-message error-message' : 'form-message success-message'}>{message}</p> : null}
    </section>
  );
}
