import { ActionButton } from './ActionButton';

type BackButtonProps = {
  onClick: () => void;
  label?: string;
};

export function BackButton({ onClick, label = 'Tillbaka' }: BackButtonProps) {
  return (
    <ActionButton className="nav-back-button" type="button" variant="secondary" onClick={onClick}>
      <span aria-hidden="true">←</span>
      {label}
    </ActionButton>
  );
}
