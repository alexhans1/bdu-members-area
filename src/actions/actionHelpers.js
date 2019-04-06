import { NotificationManager } from 'react-notifications';
import { alertTypes } from '../constants/applicationConstants';

export default (message, type) => {
  switch (type) {
    case alertTypes.INFO:
      NotificationManager.info(message);
      break;
    case alertTypes.SUCCESS:
      NotificationManager.success(message);
      break;
    case alertTypes.WARNING:
      NotificationManager.warning(message);
      break;
    case alertTypes.DANGER:
      NotificationManager.error(message);
      break;
    default:
    // do nothing
  }
};
