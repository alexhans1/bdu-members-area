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
        tournament: {
          ...tournament,
          location: tournament.ort,
          startDate: tournament.startdate,
          endDate: tournament.enddate,
          speakerPrice: tournament.speakerprice,
          judgePrice: tournament.judgeprice,
          teamSpots: tournament.teamspots,
          judgeSpots: tournament.judgespots,
          rankingFactor: tournament.rankingvalue,
          comment: tournament.comments,
        },
      },
    });
  }
};

export const createTournament = ({
  location,
  startDate,
  endDate,
  rankingFactor,
  speakerPrice,
  judgePrice,
  teamSpots,
  judgeSpots,
  comment,
  ...restTournament
}) => async dispatch => {
  const response = await fetch(`${BASE_URL}/tournament`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Method': 'POST',
    },
    body: JSON.stringify({
      ...restTournament,
      ort: location,
      startdate: startDate,
      enddate: endDate,
      speakerprice: speakerPrice,
      judgeprice: judgePrice,
      teamspots: teamSpots,
      judgespots: judgeSpots,
      rankingvalue: rankingFactor,
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
    location,
    startDate,
    endDate,
    rankingFactor,
    speakerPrice,
    judgePrice,
    teamSpots,
    judgeSpots,
    comment,
    ...restTournament
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
      ...restTournament,
      ort: location,
      startdate: startDate,
      enddate: endDate,
      speakerprice: speakerPrice,
      judgeprice: judgePrice,
      teamspots: teamSpots,
      judgespots: judgeSpots,
      rankingvalue: rankingFactor,
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
