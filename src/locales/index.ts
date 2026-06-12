import { svSE } from './svSE';

export type LocaleKey = 'sv-SE';

const dictionaries = {
  'sv-SE': svSE,
};

export function getDictionary(locale: LocaleKey = 'sv-SE') {
  return dictionaries[locale];
}

export const t = svSE;
