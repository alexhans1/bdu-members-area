import React, { Component } from 'react';
import moment from 'moment';
import Currency from 'react-currency-formatter';
import './Home.css';
import { Link } from 'react-router-dom';
import AuthenticationStore from '../../../stores/AuthenticationStore';
import profileImageDefault from '../../../images/bdu_quad.png';

class Home extends Component {
  constructor() {
    super();

    this.state = {
      user: {},
    };

    this.attendanceStatuses = [
      {
        id: 0,
        label: 'Registered',
      }, {
        id: 1,
        label: 'Went',
      }, {
        id: 2,
        label: 'Can Go',
      }, {
        id: 3,
        label: 'Didn´t Go',
      },
    ];

    this.handleAuthChange = this.handleAuthChange.bind(this);
    this.forwardToRegistration = this.forwardToRegistration.bind(this);
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

  forwardToRegistration(registrationId) {
    this.props.history.push(`/registration/${registrationId}`);
  }

  render() {
    const { user } = this.state;
    const tournaments = user.tournaments || [];

    const profileImage = user.image
      ? `http://root.debating.de/members_area/userpics/${user.image}`
      : profileImageDefault;

    return (
      <div className="container-fluid">
        <div className="row">
          <div id="profileContainer"
               className="col-12 col-sm-5 col-md-4 col-lg-3 d-flex flex-column align-items-center py-5">

            <div id="profileImageContainer" className="mb-4">
              <img src={profileImage} alt="" />
            </div>
            <h4 className="text-center">{user.vorname} {user.name}</h4>
            <Link to="/edit" className="btn btn-sm btn-outline-light">Edit Profile</Link>
          </div>
          <div className="col-12 col-sm-7 col-md-8 col-lg-9">
            <h1 className="py-3">Your Tournaments</h1>
            <table className="table table-hover table-responsive">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Role</th>
                  <th>Debt</th>
                  <th>Status</th>
                  <th>Success</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.map((tournament) => {
                  const status = this.attendanceStatuses.find(statusObj => statusObj.id === tournament._pivot_attended);
                  const dateFormat = 'LL';
                  const startdate = moment(tournament.startdate).format(dateFormat);
                  const enddate = moment(tournament.endddate).format(dateFormat);
                  const debt = Math.round((tournament._pivot_price_owed - tournament._pivot_price_paid));
                  return (
                    <tr key={tournament.id} className="cursorPointer"
                        onClick={() => this.forwardToRegistration(tournament._pivot_id)}>
                      <td>{tournament.name}</td>
                      <td>{startdate} - {enddate}</td>
                      <td>{tournament._pivot_role}</td>
                      <td><Currency quantity={debt} currency="EUR" /></td>
                      <td>{status.label}</td>
                      <td>
                        {tournament._pivot_success}
                        <br />
                        {tournament._pivot_points ? `${tournament._pivot_points} points` : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
