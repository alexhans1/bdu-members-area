/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import './Navbar.css';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout } from '../../actions/UserActions';
import logo from './bdu_white_logo.png';
import profileImageDefault from '../../images/bdu_quad.png';

const mapDispatchToProps = { logout };

class Navbar extends Component {
  constructor() {
    super();

    this.handleLogout = this.handleLogout.bind(this);
  }

  handleLogout() {
    this.props.logout();
  }

  render() {
    const { isAuthenticated, authenticatedUser } = this.props;
    let isAdmin = false;
    let profileImage = null;
    if (isAuthenticated) {
      isAdmin = authenticatedUser.position === 1;
      profileImage = authenticatedUser.image
        ? `http://root.debating.de/members_area/userpics/${authenticatedUser.image}`
        : profileImageDefault;
    }

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
            Profile
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/tournament" className="nav-link">
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
            <div className="dropdown-menu bg-dark" aria-labelledby="navbarDropdown">
              <Link to="/createTournament" className="dropdown-item text-white">
                Create Tournament
              </Link>
              <Link to="/member" className="dropdown-item text-white">
                Members
              </Link>
            </div>
          </li>
        ) : null}
        <li id="profileDropdown" className="nav-item dropdown cursorPointer">
          <a
            className="nav-link dropdown-toggle"
            id="navbarDropdown"
            role="button"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <img id="navbarProfileImage" src={profileImage} className="mr-2" alt="" />
            <span>{authenticatedUser.vorname}</span>
          </a>
          <div
            className="dropdown-menu dropdown-menu-right bg-dark"
            aria-labelledby="navbarDropdown"
          >
            <Link to="/edit" className="dropdown-item text-white">
              Edit Profile
            </Link>
            <div className="dropdown-divider border-secondary" />
            <a
              className="dropdown-item text-white"
              role="button"
              tabIndex="0"
              onClick={this.handleLogout}
            >
              <i className="fas fa-sign-out-alt" /> Logout
            </a>
          </div>
        </li>
      </ul>
    );

    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
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
  null,
  mapDispatchToProps,
)(Navbar);
