import {
  GET_TOURNAMENT,
  DELETE_TOURNAMENT,
  ADD_TOURNAMENT,
  UPDATE_TOURNAMENT,
} from '../constants/action-types';
import { alertTypes, BASE_URL } from '../constants/applicationConstants';
import triggerAlert from './actionHelpers';

export const getTournament = tournamentId => async dispatch => {
  const response = await fetch(`${BASE_URL}/tournament/${tournamentId}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (response.status === 200) {
    const tournament = response.json();
    dispatch({
      type: GET_TOURNAMENT,
      payload: {
        tournament,
      },
    });
  }
};

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
}) => async dispatch => {
  const response = await fetch(`${BASE_URL}/tournament`, {
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
  });
  const { message, tournament } = await response.json();
  if (response.status === 200) {
    triggerAlert(message, alertTypes.SUCCESS);
    dispatch({
      type: ADD_TOURNAMENT,
      payload: {
        tournament: { ...tournament, users: [] },
      },
    });
  } else triggerAlert(message, alertTypes.WARNING);
};

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
) => async dispatch => {
  const response = await fetch(`${BASE_URL}/tournament/${tournamentId}`, {
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
  });
  const { message, tournament } = await response.json();
  if (response.status === 200) {
    dispatch({
      type: UPDATE_TOURNAMENT,
      payload: { tournament },
    });
    triggerAlert(message, alertTypes.SUCCESS);
  } else triggerAlert(message, alertTypes.WARNING);
};

export const deleteTournament = tournamentId => async dispatch => {
  const response = await fetch(`${BASE_URL}/tournament/${tournamentId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const body = await response.json();
  if (response.status === 200) {
    triggerAlert(body.message, alertTypes.SUCCESS);
    dispatch({
      type: DELETE_TOURNAMENT,
      payload: { tournamentId },
    });
  } else triggerAlert(body.message, alertTypes.WARNING);
};
