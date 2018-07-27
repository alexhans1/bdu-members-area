import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';

class AuthenticationStore extends EventEmitter {
  constructor() {
    super();
    this.isAuthenticated = false;
    this.authenticatedUser = {};
    this.baseURL = (process.env.NODE_ENV === 'production') ? 'https://debate-now-api.herokuapp.com'
      : 'http://localhost:8080';
  }

  getAuthenticationStatus() {
    return this.isAuthenticated;
  }

  getAuthenticatedUser() {
    return this.authenticatedUser;
  }

  async checkAuthentication() {
    try {
      const response = await fetch(`${this.baseURL}/currentUser`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.status === 200) {
        this.isAuthenticated = true;
        this.authenticatedUser = await response.json();
        this.emit('authChange');
      } else console.error(response); // TODO: handle error whole login
    } catch (ex) {
      console.error(ex.message);
    }
  }

  async login(email, password) {
    if (email && password) {
      try {
        const response = await fetch(`${this.baseURL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Request-Method': 'POST',
          },
          body: JSON.stringify({ email, password }),
        });
        if (response.status === 200) {
          const user = await response.json();
          this.isAuthenticated = true;
          console.log(user);
          this.authenticatedUser = user;
          this.emit('authChange');
        } else console.error(response); // TODO: handle error whole login
      } catch (ex) {
        console.error(ex.message);
      }
    }
  }

  async logout() {
    try {
      const response = await fetch(`${this.baseURL}/logout`, {
        method: 'GET',
      });
      if (response.status === 200) {
        this.isAuthenticated = false;
        this.authenticatedUser = {};
        this.emit('authChange');
      } else console.error(response); // TODO: handle error whole login
    } catch (ex) {
      console.error(ex.message);
    }
  }

  handleAction(action) {
    switch (action.type) {
      case 'CHECK_AUTHENTICATION': {
        this.checkAuthentication();
        break;
      }
      case 'LOGIN': {
        this.login(action.email, action.password);
        break;
      }
      case 'SIGNUP': {
        this.signup(
          action.email,
          action.password,
          action.firstName,
          action.lastName,
          action.gender,
          action.food,
          action.signupPassword,
        );
        break;
      }
      case 'LOGOUT': {
        this.logout();
        break;
      }
      default: {
        // do nothing
      }
    }
  }
}

const authenticationStore = new AuthenticationStore();

dispatcher.register(authenticationStore.handleAction.bind(authenticationStore));

export default authenticationStore;
