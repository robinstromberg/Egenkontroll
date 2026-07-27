import type { ControlCategory } from '../types/database';

const uiIconBase = '/ui-icons';

export type IconAsset = Readonly<{
  src: `/ui-icons/${string}.${'png' | 'svg'}`;
  fallback: string;
}>;

function defineIcon(fileName: `${string}.${'png' | 'svg'}`, fallback: string): IconAsset {
  return {
    src: `${uiIconBase}/${fileName}`,
    fallback,
  };
}

export const appUiIcons = {
  today: defineIcon('idag.svg', '□'),
  history: defineIcon('historik.png', '↺'),
  kpi: defineIcon('verifiering.png', 'KPI'),
  add: defineIcon('lagg-till.svg', '+'),
  sharing: defineIcon('delning.png', '◇'),
  menu: defineIcon('meny.svg', '≡'),
  profile: defineIcon('profil.png', 'P'),
  organization: defineIcon('installningar.png', 'V'),
  users: defineIcon('anvandare.png', 'A'),
  suppliers: defineIcon('varumottagning.png', 'L'),
  help: defineIcon('hjalp.svg', '?'),
  document: defineIcon('dokument.png', 'D'),
  export: defineIcon('export.png', 'EX'),
  photo: defineIcon('foto.png', 'F'),
  notification: defineIcon('notis.png', '!'),
  qr: defineIcon('qrkod.png', 'QR'),
  search: defineIcon('sok.png', 'S'),
  action: defineIcon('atgard.png', 'Å'),
  deviation: defineIcon('avvikelse.png', '!'),
} as const satisfies Record<string, IconAsset>;

export type AppUiIconKey = keyof typeof appUiIcons;

export const controlTypeIcons = {
  kyltemperatur: defineIcon('kyltemperatur.png', '°C'),
  stadning: defineIcon('stadning.png', 'OK'),
  sparbarhet: defineIcon('sparbarhet.png', 'SP'),
  datummarkning: defineIcon('datum.png', 'DAT'),
  varumottagning: defineIcon('varumottagning.png', 'IN'),
  allergener: defineIcon('allergener.png', 'A'),
  servering: defineIcon('servering.png', 'S'),
  egenkontrollrunda: defineIcon('egenkontrollrunda.png', 'R'),
  hygien: defineIcon('hygien.png', 'H'),
  vatten: defineIcon('vatten.png', 'V'),
  skadedjur: defineIcon('skadedjur.png', 'SK'),
  avfallshantering: defineIcon('avfallshantering.png', 'AV'),
  verifiering: defineIcon('verifiering.png', 'V'),
  dokument: defineIcon('dokument.png', 'D'),
  custom: defineIcon('verifiering.png', '+'),
} as const satisfies Record<string, IconAsset>;

export type ControlTypeIconKey = keyof typeof controlTypeIcons;

export const controlCategoryIcons: Record<ControlCategory, IconAsset> = {
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
}): IconAsset {
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
