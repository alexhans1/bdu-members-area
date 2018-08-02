import dispatcher from '../dispatcher';

export function postRegistration(tournamentId, userId, role, comment, independent, funding) {
  dispatcher.dispatch({
    type: 'REGISTER',
    tournamentId,
    userId,
    role,
    comment,
    independent,
    funding,
  });
}
