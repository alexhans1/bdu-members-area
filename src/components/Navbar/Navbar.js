/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import './Navbar.scss';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout } from '../../actions/AuthActions';
import logo from './bdu_white_logo.png';

const mapStateToProps = ({ user }) => ({
  isAuthenticated: user.isAuthenticated,
  authenticatedUser: user.authenticatedUserId
    ? user.users.find(({ id }) => user.authenticatedUserId === id)
    : {},
  isAdmin: user.authenticatedUserId
    ? user.users.find(({ id }) => user.authenticatedUserId === id).position ===
      1
    : false,
});

const mapDispatchToProps = { logout };

class Navbar extends Component {
  render() {
    const {
      isAuthenticated,
      authenticatedUser,
      isAdmin,
      logout: handleLogout,
    } = this.props;

    const navbarLinks = !isAuthenticated ? (
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <Link className="nav-link" to="/login">
            <i className="fas fa-sign-in-alt" /> Login
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/signup">
            <i className="fas fa-user-circle" /> Signup
          </Link>
        </li>
      </ul>
    ) : (
      <ul className="navbar-nav d-flex w-100">
        <li className="nav-item">
          <Link to="/" className="nav-link">
            Tournaments
          </Link>
        </li>
        {isAdmin ? (
          <li className="nav-item dropdown cursorPointer">
            <a
              className="nav-link dropdown-toggle"
              id="navbarDropdown"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Admin
            </a>
            <div
              className="dropdown-menu bg-dark"
              aria-labelledby="navbarDropdown"
            >
              <Link to="/createTournament" className="dropdown-item text-white">
                Create Tournament
              </Link>
              <Link to="/member" className="dropdown-item text-white">
                Members
              </Link>
            </div>
          </li>
        ) : null}
        <li
          id="profileDropdown"
          className="nav-item dropdown cursorPointer ml-auto"
        >
          <a
            className="nav-link dropdown-toggle"
            id="navbarDropdown"
            role="button"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <span>{authenticatedUser.vorname}</span>
          </a>
          <div
            className="dropdown-menu dropdown-menu-right bg-dark"
            aria-labelledby="navbarDropdown"
          >
            <Link to="/home" className="dropdown-item text-white">
              My Tournaments
            </Link>
            <Link to="/edit" className="dropdown-item text-white">
              Edit Profile
            </Link>
            <div className="dropdown-divider border-secondary" />
            <a
              className="dropdown-item text-white"
              role="button"
              tabIndex="0"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt" /> Logout
            </a>
          </div>
        </li>
      </ul>
    );

    return (
      <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
        <Link className="navbar-brand" to="/">
          <img src={logo} width="80" height="35" alt="logo" />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          {navbarLinks}
        </div>
      </nav>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Navbar);
