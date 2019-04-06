import { GET_TOURNAMENT, DELETE_TOURNAMENT } from '../constants/action-types';
import { alertTypes, BASE_URL } from '../constants/applicationConstants';
import triggerAlert from './actionHelpers';

export const getTournament = tournamentId => dispatch =>
  fetch(`${BASE_URL}/tournament/${tournamentId}`, {
    method: 'GET',
    credentials: 'include',
  }).then(response => {
    if (response.status === 200) {
      response.json().then(body => {
        dispatch({
          type: GET_TOURNAMENT,
          payload: {
            tournament: body,
          },
        });
      });
    }
  });

export const createTournament = ({
  name,
  location,
  accommodation,
  startDate,
  endDate,
  deadline,
  format,
  language,
  league,
  rankingFactor,
  speakerPrice,
  judgePrice,
  teamSpots,
  judgeSpots,
  link,
  comment,
}) => dispatch =>
  fetch(`${BASE_URL}/tournament`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Method': 'POST',
    },
    body: JSON.stringify({
      name,
      ort: location,
      startdate: startDate,
      enddate: endDate,
      deadline,
      language,
      format,
      league,
      accommodation,
      speakerprice: speakerPrice,
      judgeprice: judgePrice,
      teamspots: teamSpots,
      judgespots: judgeSpots,
      rankingvalue: rankingFactor,
      link,
      comments: comment,
    }),
  }).then(response => {
    response.json().then(body => {
      if (response.status === 200) {
        triggerAlert(body.message, alertTypes.SUCCESS);
      } else triggerAlert(body.message, alertTypes.WARNING);
    });
  });

export const updateTournament = (
  tournamentId,
  {
    name,
    location,
    accommodation,
    startDate,
    endDate,
    deadline,
    format,
    language,
    league,
    rankingFactor,
    speakerPrice,
    judgePrice,
    teamSpots,
    judgeSpots,
    link,
    comment,
  },
) => dispatch =>
  fetch(`${BASE_URL}/tournament/${tournamentId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Method': 'PUT',
    },
    body: JSON.stringify({
      name,
      ort: location,
      startdate: startDate,
      enddate: endDate,
      deadline,
      language,
      format,
      league,
      accommodation,
      speakerprice: speakerPrice,
      judgeprice: judgePrice,
      teamspots: teamSpots,
      judgespots: judgeSpots,
      rankingvalue: rankingFactor,
      link,
      comments: comment,
    }),
  }).then(response => {
    response.json().then(body => {
      if (response.status === 200) {
        triggerAlert(body.message, alertTypes.SUCCESS);
      } else triggerAlert(body.message, alertTypes.WARNING);
    });
  });

export const deleteTournament = tournamentId => async dispatch => {
  const response = fetch(`${BASE_URL}/tournament/${tournamentId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const body = response.json();
  if (response.status === 200) {
    triggerAlert(body.message, alertTypes.SUCCESS);
    dispatch({
      type: DELETE_TOURNAMENT,
    });
  } else triggerAlert(body.message, alertTypes.WARNING);
};
