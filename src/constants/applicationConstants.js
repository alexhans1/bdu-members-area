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
    canHavePartner: false,
  },
  {
    id: 'judge',
    label: 'judge',
    canHavePartner: false,
  },
  {
    id: 'break',
    label: 'break',
    canHavePartner: true,
  },
  {
    id: 'final',
    label: 'final',
    canHavePartner: true,
  },
  {
    id: 'win',
    label: 'win',
    canHavePartner: true,
  },
  {
    id: 'judge2',
    label: 'judge for different institution',
    canHavePartner: false,
  },
  {
    id: 'break2',
    label: 'break for different institution',
    canHavePartner: true,
  },
  {
    id: 'final2',
    label: 'final for different institution',
    canHavePartner: true,
  },
  {
    id: 'win2',
    label: 'win for different institution',
    canHavePartner: true,
  },
  {
    id: 'breakESL',
    label: 'break ESL',
    canHavePartner: true,
  },
  {
    id: 'finalESL',
    label: 'final ESL',
    canHavePartner: true,
  },
  {
    id: 'winESL',
    label: 'win ESL',
    canHavePartner: true,
  },
  {
    id: 'break2ESL',
    label: 'break ESL for different institution',
    canHavePartner: true,
  },
  {
    id: 'final2ESL',
    label: 'final ESL for different institution',
    canHavePartner: true,
  },
  {
    id: 'win2ESL',
    label: 'win ESL for different institution',
    canHavePartner: true,
  },
];

export const registrationRoles = {
  SPEAKER: 'speaker',
  JUDGE: 'judge',
};

export const DATE_FORMAT = 'MMM DD, YYYY';

export const DATE_TIME_FORMAT = 'LLL';
