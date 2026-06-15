import type { ControlCategory } from '../types/database';

export type ControlTypeVisualInput = {
  name?: string | null;
  category?: ControlCategory | string | null;
};

export type ControlTypeVisual = {
  className: string;
  icon: string;
  imageSrc?: string;
  label: string;
};

const iconPath = '/control-icons/';

function normalize(value: string | null | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getControlTypeVisual(controlType: ControlTypeVisualInput): ControlTypeVisual {
  const name = normalize(controlType.name);
  const category = normalize(controlType.category);

  if (name.includes('datum')) {
    return { className: 'datummarkning', icon: '✓', imageSrc: `${iconPath}datummarkning.svg`, label: 'Datummärkning' };
  }

  if (name.includes('kyl') || name.includes('frys') || category.includes('temperature') || category.includes('temperatur')) {
    return { className: 'temperature', icon: '°C', imageSrc: `${iconPath}kyltemperatur.svg`, label: 'Temperatur' };
  }

  if (name.includes('server')) {
    return { className: 'servering', icon: 'S', imageSrc: `${iconPath}servering.svg`, label: 'Servering' };
  }

  if (name.includes('spar') || name.includes('spår') || category.includes('traceability')) {
    return { className: 'traceability', icon: 'SP', imageSrc: `${iconPath}sparbarhet.svg`, label: 'Spårbarhet' };
  }

  if (name.includes('stad') || name.includes('städ')) {
    return { className: 'stadning', icon: '✓', imageSrc: `${iconPath}stadning.svg`, label: 'Städning' };
  }

  if (category.includes('checklist')) {
    return { className: 'checklist', icon: '✓', label: 'Checklista' };
  }

  if (category.includes('receiving')) {
    return { className: 'receiving', icon: 'IN', label: 'Mottagning' };
  }

  if (category.includes('round')) {
    return { className: 'round', icon: 'R', label: 'Rond' };
  }

  return { className: 'custom', icon: '+', label: controlType.name ?? 'Egen' };
}
