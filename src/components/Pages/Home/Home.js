import React, { Component } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import AuthenticationStore from '../../../stores/AuthenticationStore';

class Home extends Component {
  constructor() {
    super();

    this.state = {
      user: {},
      tournaments: [],
    };

    this.handleAuthChange = this.handleAuthChange.bind(this);
  }

  componentWillMount() {
    AuthenticationStore.on('authChange', this.handleAuthChange);
  }

  componentDidMount() {
    this.setState({ user: AuthenticationStore.getAuthenticatedUser() || {} });
  }

  componentWillUnmount() {
    AuthenticationStore.removeListener('authChange', this.handleAuthChange);
  }

  handleAuthChange() {
    this.setState({ user: AuthenticationStore.getAuthenticatedUser() || {} });
  }

  render() {
    const { user } = this.state;
    return (
      <div className="container-fluid row">
        <div id="profileContainer" className="col-12 col-sm-4 d-none d-sm-flex flex-column align-items-center py-5">
          <h4>{user.vorname} {user.name}</h4>
          <Link to="/login" className="btn btn-sm btn-outline-light mb-5">Update Profile</Link>
        </div>
        <div className="col-12 col-sm-8">
          {user.name ? user.name : 'Vorname'}
          <p>123</p>
          <p>123</p>
          <p>123</p>
          <p>123</p>
          <p>123</p>
          <p>123</p>
          <p>123</p>
        </div>
      </div>
    );
  }
}

export default Home;
