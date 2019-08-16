import React from 'react';
import { useSelector } from 'react-redux';
import './Home.scss';
import 'react-confirm-alert/src/react-confirm-alert.css';
import UserTournamentList from './UserTournamentList';

const Home = history => {
  console.log('history', history);
  const user = useSelector(state =>
    state.user.users.find(({ id }) => state.user.authenticatedUserId === id),
  );
  const tournaments = user.tournaments || [];

  return (
    <div id="home" className="container page-content">
      <div className="row d-flex justify-content-center">
        <div>
          <h1 className="py-3"> My Tournaments</h1>
          {tournaments.length ? (
            <UserTournamentList tournaments={tournaments} history={history} />
          ) : (
            <h4>Your registered tournaments will be listed here.</h4>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
