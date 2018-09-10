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

  async updateUser(userId, email, firstName, lastName, gender, food) {
    if (email && firstName && lastName && gender) {
      try {
        const response = await fetch(`${this.baseURL}/signup/${userId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Request-Method': 'PUT',
          },
          body: JSON.stringify({
            email,
            vorname: firstName,
            name: lastName,
            gender,
            food,
          }),
        });
        const responseBody = await response.json();
        if (response.status === 200) {
          this.authenticatedUser = responseBody;
          this.isAuthenticated = true;
          this.emit('authChange');
        } else {
          this.alertMessage = responseBody.message;
          this.alertType = AlertTypes.ERROR;
          this.emit('alertChange');
        }
      } catch (ex) {
        this.alertMessage = 'Signup failed.';
        console.error(ex.message);
        this.alertType = AlertTypes.ERROR;
        this.emit('alertChange');
      }
    }
  }

  async updateUser(userId, email, firstName, lastName, gender, food) {
    try {
      const response = await fetch(`${this.baseURL}/user`, {
        method: 'PUT',
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
      case 'UPDATE': {
        this.updateUser(action.userId, action.email, action.firstName, action.lastName, action.gender, action.food);
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
