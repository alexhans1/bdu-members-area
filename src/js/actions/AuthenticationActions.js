import {
  CHECK_AUTHENTICATION,
  LOGIN,
  SIGNUP,
  LOGOUT,
} from '../constants/action-types';
import { alertTypes, BASE_URL } from '../constants/applicationConstants';
import { dispatchAlert } from './actionHelpers';

export const checkAuthentication = () => dispatch => fetch(`${BASE_URL}/currentUser`, {
  method: 'GET',
  credentials: 'include',
}).then((response) => {
  if (response.status === 200) {
    response.json().then((body) => {
      dispatch({
        type: CHECK_AUTHENTICATION,
        payload: {
          isAuthenticated: true,
          authenticatedUser: body,
          authCheckHasFinished: true,
        },
      });
    });
  } else {
    dispatch({
      type: CHECK_AUTHENTICATION,
      payload: {
        isAuthenticated: false,
        authenticatedUser: {},
        authCheckHasFinished: true,
      },
    });
  }
});

export const login = (email, password) => dispatch => fetch(`${BASE_URL}/login`, {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Request-Method': 'POST',
  },
  body: JSON.stringify({ email, password }),
}).then((response) => {
  response.json().then((body) => {
    if (response.status === 200) {
      dispatch({
        type: LOGIN,
        payload: {
          isAuthenticated: true,
          authenticatedUser: body,
        },
      });
    } else if (body.message) dispatchAlert(dispatch, body.message, alertTypes.WARNING);
    else dispatchAlert(dispatch, 'Error during login.', alertTypes.WARNING);
  });
});

export const signup = (
  email,
  password,
  firstName,
  lastName,
  gender,
  food,
  signupPassword,
) => dispatch => fetch(`${BASE_URL}/signup`, {
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
}).then((response) => {
  response.json().then((body) => {
    if (response.status === 200) {
      dispatch({
        type: SIGNUP,
        payload: {
          isAuthenticated: true,
          authenticatedUser: body,
        },
      });
    } else if (body.message) dispatchAlert(dispatch, body.message, alertTypes.WARNING);
    else dispatchAlert(dispatch, 'Error during signup.', alertTypes.WARNING);
  });
});

export const logout = () => dispatch => fetch(`${BASE_URL}/logout`, {
  method: 'GET',
  credentials: 'include',
}).then((response) => {
  if (response.status === 200) {
    dispatch({
      type: LOGOUT,
      payload: {
        isAuthenticated: false,
      },
    });
  }
});