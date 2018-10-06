export const BASE_URL = (process.env.NODE_ENV === 'production')
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
  }, {
    id: 1,
    label: 'Went',
  }, {
    id: 2,
    label: 'Can Go',
  }, {
    id: 3,
    label: 'Didn´t Go',
  },
];

export const registrationRoles = {
  SPEAKER: 'speaker',
  JUDGE: 'judge',
};
