import dispatcher from '../dispatcher';

export function getUserList() {
  dispatcher.dispatch({
    type: 'GET_USER_LIST',
  });
}

export function updateUser(userId, email, firstName, lastName, gender, food) {
  dispatcher.dispatch({
    type: 'UPDATE',
    userId,
    email,
    firstName,
    lastName,
    gender,
    food,
  });
}
