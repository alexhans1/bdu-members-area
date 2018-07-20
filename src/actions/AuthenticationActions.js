import dispatcher from '../dispatcher';

export function login(email, password) {
  dispatcher.dispatch({
    type: 'LOGIN',
    email,
    password,
  });
}

export function signup(email, password, firstName, lastName, gender, food, signupPassword) {
  dispatcher.dispatch({
    type: 'SIGNUP',
    email,
    password,
    firstName,
    lastName,
    gender,
    food,
    signupPassword,
  });
}

export function logout() {
  dispatcher.dispatch({
    type: 'LOGOUT',
  });
}
