import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';

class AuthenticationStore extends EventEmitter {
  constructor() {
    super();
    this.isAuthenticated = false;
    this.authenticatedUser = {};
    this.message = '';
    this.baseURL = (process.env.NODE_ENV === 'production') ? 'https://debate-now-api.herokuapp.com'
      : 'http://localhost:8080';
  }

  getAuthenticationStatus() {
    return this.isAuthenticated;
  }

  getAuthenticatedUser() {
    return this.authenticatedUser;
  }

  getMessage() {
    return this.message;
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
      }
    } catch (ex) {
      console.error(ex.message);
    }
  }

  async login(email, password) {
    if (email && password) {
      try {
        const response = await fetch(`${this.baseURL}/login`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Request-Method': 'POST',
          },
          body: JSON.stringify({ email, password }),
        });
        const responseBody = await response.json();
        if (response.status === 200) {
          this.authenticatedUser = responseBody;
          this.isAuthenticated = true;
          this.emit('authChange');
        } else {
          this.message = responseBody.message;
          this.emit('alertChange');
        }
      } catch (ex) {
        this.message = 'Login failed.';
        console.error(ex.message);
        this.emit('alertChange');
      }
    }
  }

  async signup(email, password, firstName, lastName, gender, food, signupPassword) {
    if (email && password && firstName && lastName && gender && signupPassword) {
      try {
        const response = await fetch(`${this.baseURL}/signup`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Request-Method': 'POST',
          },
          body: JSON.stringify({
            email,
            password,
            vorname: firstName,
            name: lastName,
            gender,
            food,
            signup_password: signupPassword,
          }),
        });
        const responseBody = await response.json();
        if (response.status === 200) {
          this.authenticatedUser = responseBody;
          this.isAuthenticated = true;
          this.emit('authChange');
        } else {
          this.message = responseBody.message;
          this.emit('alertChange');
        }
      } catch (ex) {
        this.message = 'Signup failed.';
        console.error(ex.message);
        this.emit('alertChange');
      }
    }
  }

  async logout() {
    try {
      const response = await fetch(`${this.baseURL}/logout`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.status === 200) {
        this.isAuthenticated = false;
        this.authenticatedUser = {};
        this.emit('authChange');
      } else console.error(response); // TODO: handle error
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
