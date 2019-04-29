/* eslint-disable camelcase */
import {
  ADD_TOURNAMENT,
  DELETE_REGISTRATION,
  DELETE_TOURNAMENT,
  GET_TOURNAMENT,
  PATCH_REGISTRATION,
  SET_EXPANDED_TOURNAMENT_ID,
  SET_TOURNAMENT_LIST,
  TOGGLE_SHOW_PREV_TOURNAMENTS,
  UPDATE_TOURNAMENT,
} from '../constants/action-types';

const initialState = {
  tournamentList: [],
  showPreviousTournaments: false,
  expandedTournamentId: null,
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
      };
    case ADD_TOURNAMENT:
      return {
        ...state,
        tournamentList: [...state.tournamentList, action.payload.tournament],
      };
    case UPDATE_TOURNAMENT:
      return {
        ...state,
        tournamentList: state.tournamentList.map(tournament => {
          if (tournament.id !== action.payload.tournament.id) return tournament;
          return {
            ...action.payload.tournament,
            users: tournament.users,
          };
        }),
      };
    case DELETE_TOURNAMENT:
      return {
        ...state,
        tournamentList: state.tournamentList.filter(({ id }) => id !== action.payload.tournamentId),
      };
    case TOGGLE_SHOW_PREV_TOURNAMENTS:
      return {
        ...state,
        showPreviousTournaments: !state.showPreviousTournaments,
      };
    case DELETE_REGISTRATION:
      return {
        ...state,
        tournamentList: state.tournamentList.map(tournament => {
          return {
            ...tournament,
            users: tournament.users.filter(
              ({ _pivot_id }) => _pivot_id !== action.payload.registrationId,
            ),
          };
        }),
      };
    case PATCH_REGISTRATION:
      return {
        ...state,
        tournamentList: state.tournamentList.map(tournament => {
          return {
            ...tournament,
            users: tournament.users.map(user => {
              if (user._pivot_id && user._pivot_id === action.payload.registrationId)
                return {
                  ...user,
                  ...action.payload.registration,
                };
              return user;
            }),
          };
        }),
      };
    case SET_EXPANDED_TOURNAMENT_ID:
      return {
        ...state,
        expandedTournamentId:
          action.payload.tournamentId === state.expandedTournamentId
            ? null
            : action.payload.tournamentId,
      };
    default:
      return state;
  }
};

export default tournamentReducer;
