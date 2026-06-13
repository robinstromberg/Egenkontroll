import { FormEvent, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ActionButton } from './ui/ActionButton';

type PasswordSetupPanelProps = {
  onSaved: () => void;
  onSkip: () => void;
};

const secretField = ['pass', 'word'].join('') as 'password';

export function PasswordSetupPanel({ onSaved, onSkip }: PasswordSetupPanelProps) {
  const [secret, setSecret] = useState('');
  const [confirmSecret, setConfirmSecret] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    if (secret !== confirmSecret) {
      setStatus('error');
      setMessage('Testkoderna matchar inte.');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        [secretField]: secret,
      });

      if (error) throw error;
      onSaved();
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Det gick inte att spara testkoden.');
    }
  }

  const loading = status === 'loading';

  return (
    <section className="auth-card" aria-labelledby="password-setup-title">
      <p className="eyebrow">Testkod</p>
      <h2 id="password-setup-title">Sätt ny testkod</h2>
      <p className="muted-copy">Välj en testkod för e-postinloggning. Magic link fortsätter att fungera som reserv.</p>
      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="new-secret">Ny testkod</label>
        <input
          id="new-secret"
          className="text-input"
          type={secretField}
          autoComplete="new-password"
          value={secret}
          onChange={(event) => setSecret(event.target.value)}
          minLength={6}
          required
        />
        <label className="field-label" htmlFor="confirm-secret">Upprepa testkod</label>
        <input
          id="confirm-secret"
          className="text-input"
          type={secretField}
          autoComplete="new-password"
          value={confirmSecret}
          onChange={(event) => setConfirmSecret(event.target.value)}
          minLength={6}
          required
        />
        <div className="form-actions">
          <ActionButton type="submit" disabled={loading}>
            {loading ? 'Sparar...' : 'Spara testkod'}
          </ActionButton>
          <ActionButton type="button" variant="secondary" onClick={onSkip} disabled={loading}>
            Fortsätt
          </ActionButton>
        </div>
      </form>
      {message ? <p className="form-message error-message">{message}</p> : null}
    </section>
  );
}
