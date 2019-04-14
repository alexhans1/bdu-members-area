/* eslint-disable no-case-declarations,camelcase */
import {
  CHECK_AUTHENTICATION,
  LOGOUT,
  DELETE_REGISTRATION,
  SET_USER_LIST,
  UPDATE_USER,
  ADD_TO_USER_ARRAY,
  PATCH_REGISTRATION,
  SET_EXPANDED_USER_ID,
} from '../constants/action-types';

const initialState = {
  isAuthenticated: false,
  authenticatedUserId: null,
  authCheckHasFinished: false,
  users: [],
  expandedUserId: null,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case CHECK_AUTHENTICATION:
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        authenticatedUserId: action.payload.authenticatedUserId,
        authCheckHasFinished: action.payload.authCheckHasFinished,
      };
    case LOGOUT:
      return { ...state, isAuthenticated: false, authenticatedUser: {} };
    case UPDATE_USER:
      return {
        ...state,
        users: state.users.map(user => {
          if (user.id !== action.payload.user.id) return user;
          return {
            ...action.payload.user,
            tournaments: user.tournaments,
          };
        }),
      };
    case SET_USER_LIST:
      return {
        ...state,
        users: action.payload.users,
      };
    case DELETE_REGISTRATION:
      return {
        ...state,
        users: state.users.map(user => {
          return {
            ...user,
            tournaments: user.tournaments.filter(
              ({ _pivot_id }) => _pivot_id !== action.payload.registrationId,
            ),
          };
        }),
      };
    case PATCH_REGISTRATION:
      return {
        ...state,
        authenticatedUser: {
          ...state.authenticatedUser,
          tournaments: state.authenticatedUser.tournaments.filter(
            ({ _pivot_id }) => _pivot_id !== action.payload.registrationId,
          ),
        },
      };
    case ADD_TO_USER_ARRAY:
      const userAlreadyExists =
        state.users.findIndex(({ id }) => id === action.payload.user.id) > -1;
      if (userAlreadyExists) return state;
      return {
        ...state,
        users: [...state.users, action.payload.user],
      };
    case SET_EXPANDED_USER_ID:
      return {
        ...state,
        expandedUserId:
          action.payload.userId === state.expandedUserId ? null : action.payload.userId,
      };
    default:
      return state;
  }
};

export default userReducer;
