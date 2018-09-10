import {
  SET_TOURNAMENTS_ARE_LOADING,
  GET_TOURNAMENTS,
} from '../constants/action-types';

const initialState = {
  tournamentList: [],
  isLoading: false,
};

const tournamentReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_TOURNAMENTS:
      return {
        ...state,
        tournamentList: action.payload.tournamentList,
        isLoading: false,
      };
    case SET_TOURNAMENTS_ARE_LOADING:
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };
    default:
      return state;
  }
};

export default tournamentReducer;
