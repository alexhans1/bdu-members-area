import { alertTypes, BASE_URL } from '../constants/applicationConstants';
import triggerAlert from './actionHelpers';
import { DELETE_REGISTRATION, PATCH_REGISTRATION } from '../constants/action-types';
import { getAppData } from './AuthActions';

export const register = ({
  tournament,
  userId,
  role,
  comment,
  independent,
  funding,
  partner1,
  partner2,
  teamName,
}) => dispatch => {
  fetch(`${BASE_URL}/registration`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Method': 'POST',
    },
    body: JSON.stringify({
      tournament_id: tournament.id,
      user_id: userId,
      role,
      comment,
      is_independent: independent,
      funding,
      partner1,
      partner2,
      teamname: teamName,
    }),
  }).then(response => {
    response.json().then(body => {
      if (response.status === 200) {
        triggerAlert(body.message, alertTypes.SUCCESS);
        dispatch(getAppData());
      } else triggerAlert(body.message, alertTypes.WARNING);
    });
  });
};

export const deleteRegistration = registrationId => async dispatch => {
  const response = await fetch(`${BASE_URL}/registration/${registrationId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const body = await response.json();
  if (response.status === 200) {
    triggerAlert(body.message, alertTypes.SUCCESS);
    dispatch({
      type: DELETE_REGISTRATION,
      payload: {
        registrationId,
      },
    });
  } else triggerAlert(body.message, alertTypes.WARNING);
};

export const patchRegistration = (registrationId, patchedRegistration) => async dispatch => {
  const response = await fetch(`${BASE_URL}/registration/${registrationId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Method': 'POST',
    },
    body: JSON.stringify(patchedRegistration),
  });
  const body = await response.json();
  if (response.status === 200) {
    triggerAlert(body.message, alertTypes.SUCCESS);
    dispatch({
      type: PATCH_REGISTRATION,
      payload: {
        registrationId,
        registration: Object.keys(body.registration).reduce(
          (newFields, key) => ({
            ...newFields,
            [`_pivot_${key}`]: body.registration[key],
          }),
          {},
        ),
      },
    });
  } else triggerAlert(body.message, alertTypes.WARNING);
};
