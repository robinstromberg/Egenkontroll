import themeContract from '@min-egenkontroll/design-system/theme-contract.json' with { type: 'json' };

const lightTokens = themeContract.themes.light.tokens;

/**
 * Concrete colors for static reports. Browser print documents and PDFKit do
 * not inherit the app theme, so every value comes from the design system's
 * light theme contract and remains light regardless of the app preference.
 */
export const reportPalette = Object.freeze({
  canvas: lightTokens.canvas,
  paper: lightTokens.surface,
  surfaceSubtle: lightTokens['surface-subtle'],
  text: lightTokens.text,
  muted: lightTokens['text-secondary'],
  border: lightTokens.border,
  borderStrong: lightTokens['border-strong'],
  brand: lightTokens['action-primary'],
  brandOn: lightTokens['action-on-primary'],
  brandPale: lightTokens['action-secondary'],
  highlight: lightTokens['highlight-surface'],
  warning: lightTokens['status-warning-bg'],
  warningText: lightTokens['status-warning-fg'],
  warningBorder: lightTokens['status-warning-border'],
  danger: lightTokens['status-danger-bg'],
  dangerText: lightTokens['status-danger-fg'],
  success: lightTokens['status-success-bg'],
  successText: lightTokens['status-success-fg'],
  neutral: lightTokens['status-neutral-bg'],
  neutralText: lightTokens['status-neutral-fg'],
  shadow: lightTokens['shadow-md'],
  category: Object.freeze({
    temperature: lightTokens['status-success-border'],
    checklist: lightTokens.focus,
    receiving: lightTokens['status-warning-border'],
    traceability: lightTokens['action-primary'],
    round: lightTokens['highlight-border'],
    custom: lightTokens['status-neutral-border'],
  }),
});
