/* eslint-disable no-case-declarations,camelcase */
import {
  CHECK_AUTHENTICATION,
  LOGIN,
  SIGNUP,
  LOGOUT,
  DELETE_REGISTRATION,
  SET_USER_LIST,
  UPDATE_USER,
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
    case UPDATE_USER:
      const { email, firstName, lastName, gender, food, newTournamentCount } = action.payload;
      return {
        ...state,
        authenticatedUser: {
          ...state.authenticatedUser,
          email: email || state.authenticatedUser.email,
          vorname: firstName || state.authenticatedUser.vorname,
          name: lastName || state.authenticatedUser.name,
          gender: gender || state.authenticatedUser.gender,
          food: food || state.authenticatedUser.food,
          new_tournament_count: newTournamentCount || state.authenticatedUser.new_tournament_count,
        },
      };
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
