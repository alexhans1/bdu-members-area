import { alertTypes, BASE_URL } from '../constants/applicationConstants';
import {
  ADD_TO_USER_ARRAY,
  CHECK_AUTHENTICATION,
  LOGIN,
  LOGOUT,
  SET_TOURNAMENT_LIST,
  SET_USER_LIST,
  SIGNUP,
} from '../constants/action-types';
import triggerAlert from './actionHelpers';

export const getAppData = () => async dispatch => {
  const responses = await Promise.all([
    fetch(`${BASE_URL}/currentUser`, {
      method: 'GET',
      credentials: 'include',
    }),
    fetch(`${BASE_URL}/user`, {
      method: 'GET',
      credentials: 'include',
    }),
    fetch(`${BASE_URL}/tournament`, {
      method: 'GET',
      credentials: 'include',
    }),
  ]);
  if (responses.reduce((success, { status }) => success || status === 200, true)) {
    const [currentUser, users, tournaments] = await Promise.all(
      responses.map(response => response.json()),
    );
    dispatch({
      type: SET_USER_LIST,
      payload: { users },
    });
    dispatch({
      type: SET_TOURNAMENT_LIST,
      payload: { tournaments },
    });
    dispatch({
      type: CHECK_AUTHENTICATION,
      payload: {
        isAuthenticated: true,
        authenticatedUserId: currentUser.id,
        authCheckHasFinished: true,
      },
    });
  } else {
    dispatch({
      type: CHECK_AUTHENTICATION,
      payload: {
        isAuthenticated: false,
        authenticatedUserId: null,
        authCheckHasFinished: true,
      },
    });
  }
};

export const login = (email, password) => dispatch =>
  fetch(`${BASE_URL}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Method': 'POST',
    },
    body: JSON.stringify({ email, password }),
  }).then(response => {
    response.json().then(body => {
      if (response.status === 200) {
        dispatch({
          type: LOGIN,
          payload: {
            isAuthenticated: true,
            authenticatedUser: body,
          },
        });
        dispatch({
          type: ADD_TO_USER_ARRAY,
          payload: {
            user: body,
          },
        });
      } else if (body.message) triggerAlert(body.message, alertTypes.WARNING);
      else triggerAlert('Error during login.', alertTypes.WARNING);
    });
  });

export const signup = ({
  email,
  password,
  firstName,
  lastName,
  gender,
  food,
  signupPassword,
}) => dispatch =>
  fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Method': 'POST',
    },
    body: JSON.stringify({
      email,
      password,
      vorname: firstName,
      name: lastName,
      gender,
      food,
      signup_password: signupPassword,
    }),
  }).then(response => {
    response.json().then(body => {
      if (response.status === 200) {
        dispatch({
          type: SIGNUP,
          payload: {
            isAuthenticated: true,
            authenticatedUser: body,
          },
        });
        dispatch({
          type: ADD_TO_USER_ARRAY,
          payload: {
            user: body,
          },
        });
      } else if (body.message) triggerAlert(body.message, alertTypes.WARNING);
      else triggerAlert('Error during signup.', alertTypes.WARNING);
    });
  });

export const logout = () => dispatch =>
  fetch(`${BASE_URL}/logout`, {
    method: 'GET',
    credentials: 'include',
  }).then(response => {
    if (response.status === 200) {
      dispatch({
        type: LOGOUT,
        payload: {
          isAuthenticated: false,
        },
      });
    }
  });
