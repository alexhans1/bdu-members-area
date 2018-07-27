import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import logo from './bdu_white_logo.png';
import AuthenticationStore from '../../stores/AuthenticationStore';
import * as Auth from '../../actions/AuthenticationActions';

class Navbar extends Component {
  constructor() {
    super();
    this.state = {
      isAuthenticated: false,
    };
    this.handleAuthChange = this.handleAuthChange.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentWillMount() {
    AuthenticationStore.on('authChange', this.handleAuthChange);
  }

  componentWillUnmount() {
    AuthenticationStore.removeListener('authChange', this.handleAuthChange);
  }

  handleAuthChange() {
    this.setState({
      isAuthenticated: AuthenticationStore.getAuthenticationStatus(),
    });
  }

  handleLogout() {
    Auth.logout();
  }

  render() {
    const { isAuthenticated } = this.state;

    let navbarLinks = (
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
    );
    if (isAuthenticated) {
      navbarLinks = (
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <a className="nav-link" onClick={this.handleLogout}>
              <i className="fas fa-sign-out-alt" /> Logout
            </a>
          </li>
        </ul>
      );
    }

    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <Link className="navbar-brand" to="/">
          <img src={logo} width="80" height="35" alt="logo" />
        </Link>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          {navbarLinks}
        </div>
      </nav>
    );
  }
}

export default Navbar;
