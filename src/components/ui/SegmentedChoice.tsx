export type SegmentedChoiceOption = {
  label: string;
  tone: 'good' | 'bad' | 'neutral';
  value: string;
};

export type SegmentedChoiceProps = {
  id: string;
  label: string;
  options: SegmentedChoiceOption[];
  value: string;
  onChange: (value: string) => void;
};

export function SegmentedChoice({ id, label, options, value, onChange }: SegmentedChoiceProps) {
  return (
    <div className="segmented-choice" role="radiogroup" aria-labelledby={`${id}-label`}>
      <span className="field-label" id={`${id}-label`}>{label}</span>
      <div className="segmented-choice-options">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              type="button"
              className={`choice-button ${option.tone}${selected ? ' selected' : ''}`}
              aria-checked={selected}
              key={option.value}
              onClick={() => onChange(option.value)}
              role="radio"
            >
              <span className="choice-dot" aria-hidden="true" />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
