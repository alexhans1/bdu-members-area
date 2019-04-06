import {
  SET_TOURNAMENTS_ARE_LOADING,
  GET_TOURNAMENT,
  SET_TOURNAMENT_LIST,
} from '../constants/action-types';

const initialState = {
  tournamentList: [],
  isLoading: false,
};

const tournamentReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_TOURNAMENT:
      const tournamentIndex = state.tournamentList.findIndex(
        ({ id }) => id === action.payload.tournament.id,
      );
      if (tournamentIndex > -1) {
        const { tournamentList } = state;
        tournamentList[tournamentIndex] = action.payload.tournament;
        return {
          ...state,
          tournamentList,
        };
      }
      return {
        ...state,
        tournamentList: [...state.tournamentList, action.payload.tournament],
      };
    case SET_TOURNAMENT_LIST:
      return {
        ...state,
        tournamentList: action.payload.tournaments,
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
