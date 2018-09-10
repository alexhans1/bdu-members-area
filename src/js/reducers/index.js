import { combineReducers } from 'redux';
import authenticationReducer from './authenticationReducer';
import tournamentReducer from './tournamentReducer';

const rootReducer = combineReducers({
  authentication: authenticationReducer,
  tournament: tournamentReducer,
});

export default rootReducer;
