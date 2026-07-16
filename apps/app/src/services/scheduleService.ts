import type { ControlType } from '../types/database';

export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const defaultWeeklyWeekday: IsoWeekday = 1;

export const weekdayLabels: Record<IsoWeekday, string> = {
  1: 'Måndag',
  2: 'Tisdag',
  3: 'Onsdag',
  4: 'Torsdag',
  5: 'Fredag',
  6: 'Lördag',
  7: 'Söndag',
};

export const weekdayOptions = (Object.entries(weekdayLabels) as Array<[`${IsoWeekday}`, string]>)
  .map(([value, label]) => ({ value: Number(value) as IsoWeekday, label }));

export function toIsoWeekday(date: Date): IsoWeekday {
  const day = date.getDay();
  return (day === 0 ? 7 : day) as IsoWeekday;
}

export function readWeeklyWeekday(frequencyConfig: Record<string, unknown> | null | undefined): IsoWeekday {
  const weekday = frequencyConfig?.weekday;
  return typeof weekday === 'number' && weekday >= 1 && weekday <= 7
    ? weekday as IsoWeekday
    : defaultWeeklyWeekday;
}

export function getFrequencyConfigWithWeekday(
  currentConfig: Record<string, unknown>,
  weekday: IsoWeekday,
): Record<string, unknown> {
  return {
    ...currentConfig,
    weekday,
  };
}

export function isControlScheduledForDate(controlType: ControlType, date: Date): boolean {
  if (controlType.frequency === 'weekly') {
    return readWeeklyWeekday(controlType.frequency_config) === toIsoWeekday(date);
  }

  return true;
}

export function formatFrequencyLabel(controlType: Pick<ControlType, 'frequency' | 'frequency_config'>): string {
  if (controlType.frequency === 'weekly') {
    return `Veckovis, ${weekdayLabels[readWeeklyWeekday(controlType.frequency_config)].toLowerCase()}`;
  }

  if (controlType.frequency === 'daily') return 'Dagligen';
  if (controlType.frequency === 'per_delivery') return 'Vid leverans';
  return 'Anpassad';
}
