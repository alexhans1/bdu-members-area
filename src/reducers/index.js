import { combineReducers } from 'redux';
import userReducer from './userReducer';
import tournamentReducer from './tournamentReducer';
import bugReducer from './bugReducer';

const rootReducer = combineReducers({
  user: userReducer,
  tournament: tournamentReducer,
  bug: bugReducer,
});

export default rootReducer;
