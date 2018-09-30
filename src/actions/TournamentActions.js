import {
  SET_TOURNAMENTS_ARE_LOADING,
  GET_TOURNAMENTS,
} from '../constants/action-types';
import { BASE_URL } from '../constants/applicationConstants';

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
