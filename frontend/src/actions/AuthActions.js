import { alertTypes, BASE_URL } from '../constants/applicationConstants';
import {
  ADD_TO_USER_ARRAY,
  CHECK_AUTHENTICATION,
  LOGOUT,
  SET_TOURNAMENT_LIST,
  SET_USER_LIST,
} from '../constants/action-types';
import triggerAlert from './actionHelpers';
import { renameTournamentFields, renameUserFields } from '../helpers';

export const getAppData = () => async dispatch => {
  const response = await fetch(`${BASE_URL}/currentUser`, {
    method: 'GET',
    credentials: 'include',
  });
  if (response.status === 200) {
    const currentUser = await response.json();
    const responses = await Promise.all([
      fetch(`${BASE_URL}/tournament`, {
        method: 'GET',
        credentials: 'include',
      }),
      fetch(`${BASE_URL}/user`, {
        method: 'GET',
        credentials: 'include',
      }),
    ]);
    const [tournaments, users] = await Promise.all(
      responses.map(res => res.json()),
    );
    dispatch({
      type: SET_USER_LIST,
      payload: {
        users: users.map(renameUserFields),
      },
    });
    dispatch({
      type: ADD_TO_USER_ARRAY,
      payload: { user: [currentUser].map(renameUserFields)[0] },
    });
    dispatch({
      type: SET_TOURNAMENT_LIST,
      payload: {
        tournaments: tournaments.map(renameTournamentFields),
      },
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

export const login = (email, password) => async dispatch => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Method': 'POST',
    },
    body: JSON.stringify({ email, password }),
  });
  const body = response.json();
  if (response.status === 200) {
    dispatch(getAppData());
  } else if (body.message) triggerAlert(body.message, alertTypes.WARNING);
  else triggerAlert('Error during login.', alertTypes.WARNING);
};

export const signup = ({
  email,
  password,
  firstName,
  lastName,
  gender,
  food,
  signupPassword,
}) => async dispatch => {
  const response = await fetch(`${BASE_URL}/signup`, {
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
  });
  const body = response.json();
  if (response.status === 200) {
    dispatch(getAppData());
  } else if (body.message) triggerAlert(body.message, alertTypes.WARNING);
  else triggerAlert('Error during signup.', alertTypes.WARNING);
};

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
