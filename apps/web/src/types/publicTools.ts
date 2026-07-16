export type HazardType = '' | 'biologisk' | 'kemisk' | 'fysisk';
export type UserAssessment = '' | 'ja' | 'nej' | 'osaker';

export type HazardDraft = {
  id: number;
  name: string;
  type: HazardType;
  likelihood: string;
  severity: string;
  controlMeasure: string;
  relevant: UserAssessment;
  significant: UserAssessment;
  reasoning: string;
  followUp: string;
  deviationHandling: string;
};

export type ProcessStepDraft = {
  id: number;
  name: string;
  description: string;
  hazards: HazardDraft[];
};
