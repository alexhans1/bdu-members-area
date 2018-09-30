/* eslint-disable no-case-declarations,camelcase */
import {
  CHECK_AUTHENTICATION,
  LOGIN,
  SIGNUP,
  LOGOUT,
  DELETE_REGISTRATION,
  SET_USER_LIST,
} from '../constants/action-types';

const initialState = {
  isAuthenticated: false,
  authenticatedUser: {},
  authCheckHasFinished: false,
  users: [],
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case CHECK_AUTHENTICATION:
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        authenticatedUser: action.payload.authenticatedUser,
        authCheckHasFinished: action.payload.authCheckHasFinished,
      };
    case LOGIN:
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        authenticatedUser: action.payload.authenticatedUser,
      };
    case SIGNUP:
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        authenticatedUser: action.payload.authenticatedUser,
      };
    case LOGOUT:
      return { ...state, isAuthenticated: false, authenticatedUser: {} };
    case SET_USER_LIST:
      return {
        ...state,
        users: action.payload.users,
      };
    case DELETE_REGISTRATION:
      return {
        ...state,
        authenticatedUser: {
          ...state.authenticatedUser,
          // eslint-disable-next-line max-len
          tournaments: state.authenticatedUser.tournaments.filter(({ _pivot_id }) => _pivot_id !== action.payload.registrationId),
        },
      };
    default:
      return state;
  }
};

export default userReducer;
