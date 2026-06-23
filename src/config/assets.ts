import type { ControlCategory } from '../types/database';

export const brandAssets = {
  logo: '/brand/min-egenkontroll-logo.png',
  icon: '/brand/min-egenkontroll-icon.png',
};

const uiIconBase = '/ui-icons';

export const appUiIcons = {
  today: `${uiIconBase}/idag.svg`,
  history: `${uiIconBase}/historik.svg`,
  add: `${uiIconBase}/lagg-till.svg`,
  sharing: `${uiIconBase}/delning.svg`,
  menu: `${uiIconBase}/meny.svg`,
  profile: `${uiIconBase}/profil.svg`,
  organization: `${uiIconBase}/verksamhet.svg`,
  users: `${uiIconBase}/anvandare.svg`,
  suppliers: `${uiIconBase}/leverantorer.svg`,
  help: `${uiIconBase}/hjalp.svg`,
};

export const controlTypeIcons: Record<string, string> = {
  kyltemperatur: `${uiIconBase}/kyltemperatur.png`,
  stadning: `${uiIconBase}/stadning.png`,
  sparbarhet: `${uiIconBase}/sparbarhet.png`,
  datummarkning: `${uiIconBase}/datummarkning.png`,
  varumottagning: `${uiIconBase}/varumottagning.png`,
  allergener: `${uiIconBase}/allergener.png`,
  servering: `${uiIconBase}/servering.png`,
  egenkontrollrunda: `${uiIconBase}/egenkontrollrunda.svg`,
  custom: `${uiIconBase}/kontroll.svg`,
};

export const controlCategoryIcons: Record<ControlCategory, string> = {
  temperature: controlTypeIcons.kyltemperatur,
  checklist: controlTypeIcons.stadning,
  receiving: controlTypeIcons.varumottagning,
  traceability: controlTypeIcons.sparbarhet,
  round: controlTypeIcons.egenkontrollrunda,
  custom: controlTypeIcons.custom,
};

export function readControlTypeIcon(input: {
  category?: ControlCategory | string | null;
  name?: string | null;
}): string {
  const normalizedName = (input.name ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalizedName.includes('kyl') || normalizedName.includes('temperatur')) return controlTypeIcons.kyltemperatur;
  if (normalizedName.includes('stad') || normalizedName.includes('check')) return controlTypeIcons.stadning;
  if (normalizedName.includes('datum') || normalizedName.includes('mark')) return controlTypeIcons.datummarkning;
  if (normalizedName.includes('mottag') || normalizedName.includes('leverans')) return controlTypeIcons.varumottagning;
  if (normalizedName.includes('spar') || normalizedName.includes('trace')) return controlTypeIcons.sparbarhet;
  if (normalizedName.includes('allergen')) return controlTypeIcons.allergener;
  if (normalizedName.includes('server')) return controlTypeIcons.servering;
  if (normalizedName.includes('runda') || normalizedName.includes('rond')) return controlTypeIcons.egenkontrollrunda;

  const category = input.category as ControlCategory | undefined;
  return category && category in controlCategoryIcons ? controlCategoryIcons[category] : controlTypeIcons.custom;
}
