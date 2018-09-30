import { TRIGGER_ALERT } from '../constants/action-types';

export default (dispatch, message, type) => {
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
