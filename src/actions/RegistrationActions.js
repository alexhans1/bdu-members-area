import { alertTypes, BASE_URL } from '../constants/applicationConstants';
import triggerAlert from './actionHelpers';
import { DELETE_REGISTRATION } from '../constants/action-types';
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

export const deleteRegistration = registrationId => dispatch =>
  fetch(`${BASE_URL}/registration/${registrationId}`, {
    method: 'DELETE',
    credentials: 'include',
  }).then(response => {
    response.json().then(body => {
      if (response.status === 200) {
        triggerAlert(body.message, alertTypes.SUCCESS);
        dispatch({
          type: DELETE_REGISTRATION,
          payload: {
            registrationId,
          },
        });
      } else triggerAlert(body.message, alertTypes.WARNING);
    });
  });

export const patchRegistration = (registrationId, patchedRegistration) => dispatch =>
  fetch(`${BASE_URL}/registration/${registrationId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Method': 'POST',
    },
    body: JSON.stringify({
      role: patchedRegistration.role || null,
      is_independent: patchedRegistration.is_independent || null,
      teamname: patchedRegistration.teamname || null,
      comment: patchedRegistration.comment || null,
      funding: patchedRegistration.funding || null,
      price_paid: patchedRegistration.price_paid || null,
      price_owed: patchedRegistration.price_owed || null,
      transaction_date: patchedRegistration.transaction_date || null,
      transaction_from: patchedRegistration.transaction_from || null,
    }),
  }).then(response => {
    response.json().then(body => {
      if (response.status === 200) {
        triggerAlert(body.message, alertTypes.SUCCESS);
        dispatch({
          type: DELETE_REGISTRATION,
          payload: {
            registrationId,
          },
        });
      } else triggerAlert(body.message, alertTypes.WARNING);
    });
  });
