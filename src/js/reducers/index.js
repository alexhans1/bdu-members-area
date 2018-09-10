/* eslint-disable no-case-declarations */
import { NotificationManager } from 'react-notifications';
import {
  CHECK_AUTHENTICATION,
  LOGIN,
  SIGNUP,
  LOGOUT,
  TRIGGER_ALERT,
} from '../constants/action-types';
import { alertTypes } from '../constants/applicationConstants';

const initialState = {
  isAuthenticated: false,
  authenticatedUser: {},
  authCheckHasFinished: false,
  alert: {
    message: '',
    type: null,
  },
};

const rootReducer = (state = initialState, action) => {
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
    case TRIGGER_ALERT:
      switch (action.payload.alert.type) {
        case alertTypes.INFO:
          NotificationManager.info(action.payload.alert.message);
          break;
        case alertTypes.SUCCESS:
          NotificationManager.success(action.payload.alert.message);
          break;
        case alertTypes.WARNING:
          NotificationManager.warning(action.payload.alert.message);
          break;
        case alertTypes.DANGER:
          NotificationManager.error(action.payload.alert.message);
          break;
        default:
        // do nothing
      }
    default:
      return state;
  }
};

export default rootReducer;
