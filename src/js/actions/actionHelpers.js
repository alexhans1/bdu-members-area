import { TRIGGER_ALERT } from '../constants/action-types';

export const dispatchAlert = (dispatch, message, type) => {
  dispatch({
    type: TRIGGER_ALERT,
    payload: {
      alert: {
        message,
        type,
      },
    },
  });
};
