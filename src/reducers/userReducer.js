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
  ADD_REGISTRATION,
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
    case ADD_REGISTRATION:
      return {
        ...state,
        users: state.users.map(user => {
          if (user.id !== action.payload.registration._pivot_user_id)
            return user;
          return {
            ...user,
            tournaments: [
              ...user.tournaments,
              { ...action.payload.tournament, ...action.payload.registration },
            ],
          };
        }),
      };
    case PATCH_REGISTRATION:
      return {
        ...state,
        users: state.users.map(user => {
          if (!user.tournaments) return user;
          return {
            ...user,
            tournaments: user.tournaments.map(tournament => {
              if (
                tournament._pivot_id &&
                tournament._pivot_id === action.payload.registrationId
              )
                return {
                  ...tournament,
                  ...action.payload.registration,
                };
              return tournament;
            }),
          };
        }),
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
        expandedUserId: action.payload.userId,
      };
    default:
      return state;
  }
};

export default userReducer;
