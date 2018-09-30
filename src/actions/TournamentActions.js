import {
  SET_TOURNAMENTS_ARE_LOADING,
  GET_TOURNAMENT,
  GET_TOURNAMENTS,
} from '../constants/action-types';
import { alertTypes, BASE_URL } from '../constants/applicationConstants';
import dispatchAlert from './actionHelpers';

export const getTournament = tournamentId => dispatch => fetch(`${BASE_URL}/tournament/${tournamentId}`, {
  method: 'GET',
  credentials: 'include',
}).then((response) => {
  if (response.status === 200) {
    response.json().then((body) => {
      dispatch({
        type: GET_TOURNAMENT,
        payload: {
          tournament: body,
        },
      });
    });
  }
});

export const getTournaments = (upcommingOnly = false) => (dispatch) => {
  dispatch({
    type: SET_TOURNAMENTS_ARE_LOADING,
    payload: {
      isLoading: true,
    },
  });
  fetch(`${BASE_URL}/tournament${upcommingOnly ? `?filterByMinDate=${new Date().toISOString()}` : ''}`, {
    method: 'GET',
    credentials: 'include',
  }).then((response) => {
    if (response.status === 200) {
      response.json().then((body) => {
        dispatch({
          type: GET_TOURNAMENTS,
          payload: {
            tournamentList: body,
          },
        });
      });
    }
  });
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
}) => dispatch => fetch(`${BASE_URL}/tournament`, {
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
}).then((response) => {
  response.json().then((body) => {
    if (response.status === 200) {
      dispatchAlert(dispatch, body.message, alertTypes.SUCCESS);
      dispatch(getTournaments());
    } else dispatchAlert(dispatch, body.message, alertTypes.WARNING);
  });
});

export const updateTournament = (tournamentId, {
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
}) => dispatch => fetch(`${BASE_URL}/tournament/${tournamentId}`, {
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
}).then((response) => {
  response.json().then((body) => {
    if (response.status === 200) {
      dispatchAlert(dispatch, body.message, alertTypes.SUCCESS);
      dispatch(getTournaments());
    } else dispatchAlert(dispatch, body.message, alertTypes.WARNING);
  });
});

export const deleteTournament = tournamentId => dispatch => fetch(`${BASE_URL}/tournament/${tournamentId}`, {
  method: 'DELETE',
  credentials: 'include',
}).then((response) => {
  response.json().then((body) => {
    if (response.status === 200) {
      dispatchAlert(dispatch, body.message, alertTypes.SUCCESS);
      dispatch(getTournaments());
    } else dispatchAlert(dispatch, body.message, alertTypes.WARNING);
  });
});
