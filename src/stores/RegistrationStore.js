import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';

class TournamentStore extends EventEmitter {
  constructor() {
    super();
    this.success = false;
    this.message = '';
    this.baseURL = (process.env.NODE_ENV === 'production') ? 'https://debate-now-api.herokuapp.com'
      : 'http://localhost:8080';
  }

  async register(tournamentId, userId, role, comment, independent, funding) {
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
        }),
      });
      if (response.status === 200) {
        this.success = true;
        this.message = await response.json().message;
        this.emit('registrationChange');
      } else {
        this.success = false;
        this.message = await response.json().message;
        this.emit('registrationChange');
      }
    } catch (ex) {
      console.error(ex.message);
      this.success = false;
      this.message = 'Registration failed.';
      this.emit('registrationChange');
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
