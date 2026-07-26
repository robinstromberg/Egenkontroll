export type ReportPalette = Readonly<{
  canvas: string;
  paper: string;
  surfaceSubtle: string;
  text: string;
  muted: string;
  border: string;
  borderStrong: string;
  brand: string;
  brandOn: string;
  brandPale: string;
  highlight: string;
  warning: string;
  warningText: string;
  warningBorder: string;
  danger: string;
  dangerText: string;
  success: string;
  successText: string;
  neutral: string;
  neutralText: string;
  shadow: string;
  category: Readonly<{
    temperature: string;
    checklist: string;
    receiving: string;
    traceability: string;
    round: string;
    custom: string;
  }>;
}>;

export const reportPalette: ReportPalette;
