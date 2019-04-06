import { SET_USER_LIST, UPDATE_USER, ADD_TO_USER_ARRAY } from '../constants/action-types';
import { alertTypes, BASE_URL } from '../constants/applicationConstants';
import triggerAlert from './actionHelpers';

// eslint-disable-next-line max-len
export const getUserByRegistrationId = registrationId => dispatch =>
  fetch(`${BASE_URL}/user/?filterByRegistrationId=${registrationId}`, {
    method: 'GET',
    credentials: 'include',
  }).then(response => {
    if (response.status === 200) {
      response.json().then(body => {
        dispatch({
          type: ADD_TO_USER_ARRAY,
          payload: {
            user: body,
          },
        });
      });
    }
  });

export const getUserList = () => dispatch =>
  fetch(`${BASE_URL}/user`, {
    method: 'GET',
    credentials: 'include',
  }).then(response => {
    response.json().then(body => {
      if (response.status === 200) {
        dispatch({
          type: SET_USER_LIST,
          payload: {
            users: body,
          },
        });
      }
    });
  });

export const updateUser = ({
  userId,
  email,
  firstName,
  lastName,
  gender,
  food,
  newTournamentCount,
}) => dispatch =>
  fetch(`${BASE_URL}/user/${userId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Method': 'PUT',
    },
    body: JSON.stringify({
      email,
      vorname: firstName,
      name: lastName,
      gender,
      food,
      new_tournament_count: newTournamentCount,
    }),
  }).then(response => {
    response.json().then(body => {
      if (response.status === 200) {
        triggerAlert(body.message, alertTypes.SUCCESS);
        dispatch({
          type: UPDATE_USER,
          payload: {
            email,
            firstName,
            lastName,
            gender,
            food,
            newTournamentCount,
          },
        });
      } else if (body.message) triggerAlert(body.message, alertTypes.WARNING);
      else triggerAlert('Error during signup.', alertTypes.WARNING);
    });
  });
