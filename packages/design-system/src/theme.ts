import themeContractJson from '../theme-contract.json';

export const themeContract = themeContractJson;

export type ThemeName = keyof typeof themeContract.themes;
export type ThemeToken = keyof typeof themeContract.themes.light.tokens;
export type StaticThemeSurface = keyof typeof themeContract.staticSurfaces;

export function resolveStaticThemeValue(surface: StaticThemeSurface): string {
  const reference = themeContract.staticSurfaces[surface] as {
    theme: ThemeName;
    token: ThemeToken;
  };
  return themeContract.themes[reference.theme].tokens[reference.token];
}
