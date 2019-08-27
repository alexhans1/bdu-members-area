import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import './Home.scss';
import 'react-confirm-alert/src/react-confirm-alert.css';
import UserTournamentList from './UserTournamentList';
import { logout } from '../../../actions/AuthActions';

const Home = ({ history }) => {
  const dispatch = useDispatch();
  const user = useSelector(state =>
    state.user.users.find(({ id }) => state.user.authenticatedUserId === id),
  );
  const tournaments = user.tournaments || [];

  return (
    <div id="home" className="container-fluid">
      <div className="side-bar">
        <div className="page-content d-flex align-items-center">
          <div className="name-circle">
            {user.vorname.substring(0, 1)}
            {user.name.substring(0, 1)}
          </div>
          <span className="d-flex flex-column welcome-message">
            <span>Hi,</span>
            <b>
              {user.vorname} {user.name}
            </b>
          </span>
        </div>
        <div className="d-flex align-items-center page-content">
          <Link to="edit">
            <i className="fas fa-user mr-3" />
            <span>Edit profile</span>
          </Link>
        </div>
        <div className="d-flex align-items-center page-content">
          <a role="button" onClick={() => {}}>
            <i className="fas fa-money-check-alt mr-3" />
            <span>Get transaction purpose</span>
          </a>
        </div>
        <div className="d-flex align-items-center page-content mt-4">
          <a
            role="button"
            onClick={() => {
              dispatch(logout());
            }}
          >
            <i className="fas fa-sign-out-alt mr-3" />
            <span>Logout</span>
          </a>
        </div>
      </div>
      <div className="page-content">
        <h1 className="py-3"> My Tournaments</h1>
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
