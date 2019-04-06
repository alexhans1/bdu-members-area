import { combineReducers } from 'redux';
import userReducer from './userReducer';
import tournamentReducer from './tournamentReducer';

const rootReducer = combineReducers({
  user: userReducer,
  tournament: tournamentReducer,
});

export default rootReducer;
