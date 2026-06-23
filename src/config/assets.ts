import type { ControlCategory } from '../types/database';

export const brandAssets = {
  logo: '/brand/min-egenkontroll-logo.png',
  icon: '/brand/min-egenkontroll-icon.png',
};

const uiIconBase = '/ui-icons';

export const appUiIcons = {
  today: `${uiIconBase}/idag.svg`,
  history: `${uiIconBase}/historik.png`,
  kpi: `${uiIconBase}/verifiering.png`,
  add: `${uiIconBase}/lagg-till.svg`,
  sharing: `${uiIconBase}/delning.png`,
  menu: `${uiIconBase}/meny.svg`,
  profile: `${uiIconBase}/Profil.png`,
  organization: `${uiIconBase}/installningar.png`,
  users: `${uiIconBase}/anvandare.png`,
  suppliers: `${uiIconBase}/leverantorer.svg`,
  help: `${uiIconBase}/hjalp.svg`,
  document: `${uiIconBase}/dokument.png`,
  export: `${uiIconBase}/export.png`,
  photo: `${uiIconBase}/foto.png`,
  notification: `${uiIconBase}/notis.png`,
  qr: `${uiIconBase}/qrkod.png`,
  search: `${uiIconBase}/sok.png`,
  action: `${uiIconBase}/atgard.png`,
  deviation: `${uiIconBase}/avvikelse.png`,
};

export const controlTypeIcons: Record<string, string> = {
  kyltemperatur: `${uiIconBase}/kyltemperatur.png`,
  stadning: `${uiIconBase}/stadning.png`,
  sparbarhet: `${uiIconBase}/sparbarhet.png`,
  datummarkning: `${uiIconBase}/datum.png`,
  varumottagning: `${uiIconBase}/varumottagning.png`,
  allergener: `${uiIconBase}/allergener.png`,
  servering: `${uiIconBase}/servering.png`,
  egenkontrollrunda: `${uiIconBase}/Egenkontrollrunda.png`,
  hygien: `${uiIconBase}/hygien.png`,
  vatten: `${uiIconBase}/vatten.png`,
  skadedjur: `${uiIconBase}/skadedjur.png`,
  avfallshantering: `${uiIconBase}/avfallshantering.png`,
  verifiering: `${uiIconBase}/verifiering.png`,
  dokument: `${uiIconBase}/dokument.png`,
  custom: `${uiIconBase}/verifiering.png`,
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
  if (normalizedName.includes('hygien')) return controlTypeIcons.hygien;
  if (normalizedName.includes('stad') || normalizedName.includes('check')) return controlTypeIcons.stadning;
  if (normalizedName.includes('datum') || normalizedName.includes('mark')) return controlTypeIcons.datummarkning;
  if (normalizedName.includes('mottag') || normalizedName.includes('leverans')) return controlTypeIcons.varumottagning;
  if (normalizedName.includes('spar') || normalizedName.includes('trace')) return controlTypeIcons.sparbarhet;
  if (normalizedName.includes('allergen')) return controlTypeIcons.allergener;
  if (normalizedName.includes('server')) return controlTypeIcons.servering;
  if (normalizedName.includes('vatten')) return controlTypeIcons.vatten;
  if (normalizedName.includes('skadedjur')) return controlTypeIcons.skadedjur;
  if (normalizedName.includes('avfall')) return controlTypeIcons.avfallshantering;
  if (normalizedName.includes('dokument')) return controlTypeIcons.dokument;
  if (normalizedName.includes('verifier')) return controlTypeIcons.verifiering;
  if (normalizedName.includes('runda') || normalizedName.includes('rond')) return controlTypeIcons.egenkontrollrunda;

  const category = input.category as ControlCategory | undefined;
  return category && category in controlCategoryIcons ? controlCategoryIcons[category] : controlTypeIcons.custom;
}
