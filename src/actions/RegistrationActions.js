import dispatcher from '../dispatcher';

export function postRegistration(
  tournamentId,
  userId,
  role,
  comment,
  independent,
  funding,
  partner1,
  partner2,
  teamname,
) {
  dispatcher.dispatch({
    type: 'REGISTER',
    tournamentId,
    userId,
    role,
    comment,
    independent,
    funding,
    partner1,
    partner2,
    teamname,
  });
}
