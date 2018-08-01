import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';

class UserStore extends EventEmitter {
  constructor() {
    super();
    this.userList = [];
    this.baseURL = (process.env.NODE_ENV === 'production') ? 'https://debate-now-api.herokuapp.com'
      : 'http://localhost:8080';
  }

  async getAllUsers() {
    try {
      const response = await fetch(`${this.baseURL}/user`, {
        method: 'GET',
      });
      if (response.status === 200) {
        this.userList = await response.json();
        this.emit('userChange');
      } else console.error(response); // TODO: handle error whole login
    } catch (ex) {
      console.error(ex.message);
    }
  }

  handleAction(action) {
    switch (action.type) {
      case 'GET_USER_LIST': {
        this.getAllUsers();
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
