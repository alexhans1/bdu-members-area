import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';

class TournamentStore extends EventEmitter {
  constructor() {
    super();
    this.tournamentList = [];
    this.baseURL = (process.env.NODE_ENV === 'production') ? 'https://debate-now-api.herokuapp.com'
      : 'http://localhost:8080';
  }

  getAllTournaments() {
    return this.tournamentList;
  }

  async fetchTournaments({ minDate }) {
    try {
      const response = await fetch(`${this.baseURL}/tournament${minDate ? `?filterByMinDate=${minDate}` : ''}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.status === 200) {
        this.tournamentList = await response.json();
        this.emit('tournamentChange');
      } else console.error(response); // TODO: handle error whole login
    } catch (ex) {
      console.error(ex.message);
    }
  }

  handleAction(action) {
    switch (action.type) {
      case 'GET_CURRENT_TOURNAMENT_LIST': {
        this.fetchTournaments({ minDate: new Date().toISOString() });
        break;
      }
      case 'GET_ALL_TOURNAMENT_LIST': {
        this.fetchTournaments({});
        break;
      }
      default: {
        // do nothing
      }
    }
  }
}

const tournamentStore = new TournamentStore();

dispatcher.register(tournamentStore.handleAction.bind(tournamentStore));

export default tournamentStore;
