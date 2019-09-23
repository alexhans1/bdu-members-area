import {
  ADD_BUG,
  GET_ALL_BUGS,
  REMOVE_BUG,
  SET_BUG_STATUS,
} from '../constants/action-types';

const initialState = {
  bugList: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_ALL_BUGS:
      return {
        ...state,
        bugList: action.payload.bugList,
      };
    case SET_BUG_STATUS:
      return {
        ...state,
        bugList: state.bugList.map(bug => {
          if (bug.id === action.payload.bugId)
            return { ...bug, status: action.payload.status };
          return bug;
        }),
      };
    case ADD_BUG:
      return {
        ...state,
        bugList: [...state.bugList, action.payload.newBug],
      };
    case REMOVE_BUG:
      return {
        ...state,
        bugList: state.bugList.filter(({ id }) => id !== action.payload.bugId),
      };
    default:
      return state;
  }
};
