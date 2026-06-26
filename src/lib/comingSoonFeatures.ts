export const COMING_SOON_FEATURES = [
  'reports',
  'reflection-logs',
  'surveys',
  'stage-closure',
  'value-mirror',
] as const;

export type ComingSoonFeature = (typeof COMING_SOON_FEATURES)[number];
