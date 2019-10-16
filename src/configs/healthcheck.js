export const STATS = {
  title: 'Composite Service - Health Check',
  path: '/stats',
};

export const STATUS = {
  BAD: 'bad',
  GOOD: 'good',
  WARNING: 'warning',
};

export const THRESHOLDS = {
  cpu: {
    warn: 50,
    bad: 90,
  },
  memory: {
    warn: 50,
    bad: 90,
  },
};
