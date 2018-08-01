import dispatcher from '../dispatcher';

export function getCurrentTournaments() {
  dispatcher.dispatch({
    type: 'GET_CURRENT_TOURNAMENT_LIST',
  });
}

export function getAllTournaments() {
  dispatcher.dispatch({
    type: 'GET_ALL_TOURNAMENT_LIST',
  });
}
