export const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://debate-now-api.herokuapp.com'
    : 'http://localhost:8080';

export const alertTypes = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  DANGER: 'DANGER',
};

export const attendanceStatuses = [
  {
    id: 0,
    label: 'Registered',
  },
  {
    id: 1,
    label: 'Went',
  },
  {
    id: 2,
    label: 'Can Go',
  },
  {
    id: 3,
    label: 'Didn´t Go',
  },
];

export const successTypes = [
  {
    id: 'none',
    label: 'none',
  },
  {
    id: 'judge',
    label: 'judge',
  },
  {
    id: 'break',
    label: 'break',
  },
  {
    id: 'final',
    label: 'final',
  },
  {
    id: 'win',
    label: 'win',
  },
  {
    id: 'judge2',
    label: 'judge for different institution',
  },
  {
    id: 'break2',
    label: 'break for different institution',
  },
  {
    id: 'final2',
    label: 'final for different institution',
  },
  {
    id: 'win2',
    label: 'win for different institution',
  },
  {
    id: 'breakESL',
    label: 'break ESL',
  },
  {
    id: 'finalESL',
    label: 'final ESL',
  },
  {
    id: 'winESL',
    label: 'win ESL',
  },
  {
    id: 'break2ESL',
    label: 'break ESL for different institution',
  },
  {
    id: 'final2ESL',
    label: 'final ESL for different institution',
  },
  {
    id: 'win2ESL',
    label: 'win ESL for different institution',
  },
];

export const registrationRoles = {
  SPEAKER: 'speaker',
  JUDGE: 'judge',
};

export const DATE_FORMAT = 'MMM DD, YYYY';

export const DATE_TIME_FORMAT = 'LLL';
