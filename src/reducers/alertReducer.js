import { NotificationManager } from 'react-notifications';
import {
  TRIGGER_ALERT,
} from '../constants/action-types';
import { alertTypes } from '../constants/applicationConstants';

const initialState = {
  alert: {
    message: '',
    type: null,
  },
};

const alertReducer = (state = initialState, action) => {
  switch (action.type) {
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

export default alertReducer;
