import { combineReducers } from 'redux';
import userReducer from './userReducer';
import tournamentReducer from './tournamentReducer';
import alertReducer from './alertReducer';

const rootReducer = combineReducers({
  user: userReducer,
  tournament: tournamentReducer,
  alert: alertReducer,
});

export default rootReducer;
