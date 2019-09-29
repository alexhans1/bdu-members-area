import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { User, DollarSign, LogOut } from 'react-feather';
import 'react-confirm-alert/src/react-confirm-alert.css';

import './Home.scss';
import UserTournamentList from './UserTournamentList';
import { logout } from '../../../actions/AuthActions';

const Home = ({ history }) => {
  const dispatch = useDispatch();
  const user = useSelector(state =>
    state.user.users.find(({ id }) => state.user.authenticatedUserId === id),
  );
  const tournaments = user.tournaments || [];

  async function fetchTransactionPurpose() {
    const response = await fetch(
      `https://kouqz3b0rd.execute-api.us-east-1.amazonaws.com/prod/gettransactionpurpose?userId=${user.id}`,
    );
    if (response.status === 200) {
      const transactionPurpose = await response.json();
    }
  }

  return (
    <div id="home" className="container-fluid">
      <div className="side-bar">
        <div className="page-content d-flex align-items-center">
          <div className="name-circle">
            {user.firstName.substring(0, 1)}
            {user.lastName.substring(0, 1)}
          </div>
          <span className="d-flex flex-column welcome-message">
            <span>Hi,</span>
            <b>
              {user.firstName} {user.lastName}
            </b>
          </span>
        </div>
        <div className="d-flex align-items-center page-content">
          <Link to="edit">
            <User className="mr-3" />
            <span>Edit profile</span>
          </Link>
        </div>
        <div className="d-flex align-items-center page-content">
          <a
            className="d-flex align-items-center"
            role="button"
            onClick={fetchTransactionPurpose}
          >
            <DollarSign className="mr-3" />
            <span>Get transaction purpose</span>
          </a>
        </div>
        <div className="d-flex align-items-center page-content mt-4">
          <a
            className="d-flex align-items-center"
            role="button"
            onClick={() => {
              dispatch(logout());
            }}
          >
            <LogOut className="mr-3" />
            <span>Logout</span>
          </a>
        </div>
      </div>
      <div className="page-content">
        <h2 className="py-3"> My Tournaments</h2>
        {tournaments.length ? (
          <UserTournamentList tournaments={tournaments} history={history} />
        ) : (
          <h4>Your registered tournaments will be listed here.</h4>
        )}
      </div>
    </div>
  );
};

export default Home;
