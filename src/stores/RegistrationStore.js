import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';

class TournamentStore extends EventEmitter {
  constructor() {
    super();
    this.message = '';
    this.baseURL = (process.env.NODE_ENV === 'production') ? 'https://debate-now-api.herokuapp.com'
      : 'http://localhost:8080';
  }

  getMessage() {
    return this.message;
  }

  async register(tournamentId, userId, role, comment, independent, funding, partner1, partner2, teamname) {
    try {
      const response = await fetch(`${this.baseURL}/registration`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Method': 'POST',
        },
        body: JSON.stringify({
          tournament_id: tournamentId,
          user_id: userId,
          role,
          comment,
          is_independent: independent,
          funding,
          partner1,
          partner2,
          teamname,
        }),
      });
      const body = await response.json();
      if (response.status === 200) {
        this.message = body.message;
        this.emit('alertChange');
      } else {
        this.message = body.message;
        this.emit('alertChange');
      }
    } catch (ex) {
      console.error(ex.message);
      this.message = 'Registration failed.';
      this.emit('alertChange');
    }
  }

  handleAction(action) {
    switch (action.type) {
      case 'REGISTER': {
        this.register(
          action.tournamentId,
          action.userId,
          action.role,
          action.comment,
          action.independent,
          action.funding,
          action.partner1,
          action.partner2,
          action.teamname,
        );
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
