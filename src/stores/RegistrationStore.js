import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';
import AlertTypes from './alertTypes';

class TournamentStore extends EventEmitter {
  constructor() {
    super();
    this.alertMessage = '';
    this.alertType = AlertTypes.INFO;
    this.baseURL = (process.env.NODE_ENV === 'production') ? 'https://debate-now-api.herokuapp.com'
      : 'http://localhost:8080';
  }

  getAlertMessage() {
    return this.alertMessage;
  }

  getAlertType() {
    return this.alertType;
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
        this.alertMessage = body.message;
        this.alertType = AlertTypes.SUCCESS;
        this.emit('alertChange');
      } else {
        this.alertMessage = body.message;
        this.alertType = AlertTypes.ERROR;
        this.emit('alertChange');
      }
    } catch (ex) {
      console.error(ex.message);
      this.alertMessage = 'Registration failed.';
      this.alertType = AlertTypes.ERROR;
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
