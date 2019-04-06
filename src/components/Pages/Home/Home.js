import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Home.css';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Link } from 'react-router-dom';
import profileImageDefault from '../../../images/bdu_quad.png';
import TournamentList from './TournamentList';

const mapStateToProps = ({ user }) => ({
  user: user.users.find(({ id }) => user.authenticatedUserId === id),
});

class Home extends Component {
  render() {
    const { user, history } = this.props;
    const tournaments = user.tournaments || [];

    const profileImage = user.image || profileImageDefault;

    return (
      <div id="home" className="container-fluid">
        <div className="row">
          <div
            id="profileContainer"
            className="col-12 col-sm-5 col-md-4 col-lg-3 d-flex flex-column align-items-center py-5"
          >
            <div id="profileImageContainer" className="mb-4 cursorPointer">
              <img src={profileImage} alt="" />
            </div>
            <h4 className="text-center">
              {user.vorname} {user.name}
            </h4>
            <Link to="/edit" className="btn btn-sm btn-outline-light">
              Edit Profile
            </Link>
          </div>
          <div className="col-12 col-sm-7 col-md-8 col-lg-9">
            <h1 className="py-3">Your Tournaments</h1>
            {tournaments.length ? (
              <TournamentList tournaments={tournaments} history={history} />
            ) : (
              <h4>Your registered tournaments will be listed here.</h4>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Home);
