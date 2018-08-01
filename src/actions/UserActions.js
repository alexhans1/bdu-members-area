import dispatcher from '../dispatcher';

export function getUserList() {
  dispatcher.dispatch({
    type: 'GET_USER_LIST',
  });
}
