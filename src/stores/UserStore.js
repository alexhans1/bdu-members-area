import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';
import AlertTypes from './alertTypes';

class UserStore extends EventEmitter {
  constructor() {
    super();
    this.alertMessage = '';
    this.alertType = AlertTypes.INFO;
    this.userList = [];
    this.baseURL = (process.env.NODE_ENV === 'production') ? 'https://debate-now-api.herokuapp.com'
      : 'http://localhost:8080';
  }

  getUserList() {
    return this.userList;
  }

  async fetchAllUsers() {
    try {
      const response = await fetch(`${this.baseURL}/user`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.status === 200) {
        this.userList = await response.json();
        this.emit('userChange');
      } else console.error(response); // TODO: handle error
    } catch (ex) {
      console.error(ex.message);
    }
  }

  handleAction(action) {
    switch (action.type) {
      case 'GET_USER_LIST': {
        this.fetchAllUsers();
        break;
      }
      default: {
        // do nothing
      }
    }
  }
}

const userStore = new UserStore();

dispatcher.register(userStore.handleAction.bind(userStore));

export default userStore;
