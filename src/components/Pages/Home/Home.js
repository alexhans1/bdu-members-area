import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import './Home.css';
import Currency from 'react-currency-formatter';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Link } from 'react-router-dom';
import * as RegistrationActions from '../../../actions/RegistrationActions';
import profileImageDefault from '../../../images/bdu_quad.png';
import { attendanceStatuses } from '../../../js/constants/applicationConstants';

const mapStateToProps = ({
  authenticatedUser,
}) => ({
  user: authenticatedUser,
});

class Home extends Component {
  constructor() {
    super();

    this.forwardToRegistration = this.forwardToRegistration.bind(this);
    this.deleteRegistration = this.deleteRegistration.bind(this);
  }

  forwardToRegistration(registrationId) {
    this.props.history.push(`/registration/${registrationId}`);
  }

  deleteRegistration(registrationId) {
    confirmAlert({
      title: 'Confirm',
      message: 'Are you sure you want to delete this registration?',
      buttons: [
        {
          label: 'Yes',
          class: 'btn btn-success',
          onClick: () => RegistrationActions.deleteRegistration(registrationId),
        },
        {
          label: 'No',
          onClick: () => {},
        },
      ],
    });
  }

  render() {
    const { user } = this.props;
    const tournaments = user.tournaments || [];

    const profileImage = user.image || profileImageDefault;

    return (
      <div id="home" className="container-fluid">
        <div className="row">
          <div id="profileContainer"
               className="col-12 col-sm-5 col-md-4 col-lg-3 d-flex flex-column align-items-center py-5">

            <div id="profileImageContainer" className="mb-4 cursorPointer">
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
                  <th />
                </tr>
              </thead>
              <tbody>
                {tournaments.map((tournament) => {
                  const status = attendanceStatuses.find(statusObj => statusObj.id === tournament._pivot_attended);
                  const dateFormat = 'LL';
                  const startdate = moment(tournament.startdate).format(dateFormat);
                  const enddate = moment(tournament.enddate).format(dateFormat);
                  const debt = Math.round((tournament._pivot_price_owed - tournament._pivot_price_paid));
                  return (
                    <tr key={tournament.id}>
                      <td onClick={() => this.forwardToRegistration(tournament._pivot_id)}>{tournament.name}</td>
                      <td onClick={() => this.forwardToRegistration(tournament._pivot_id)}>{startdate} - {enddate}</td>
                      <td onClick={() => this.forwardToRegistration(tournament._pivot_id)}>{tournament._pivot_role}</td>
                      <td onClick={() => this.forwardToRegistration(tournament._pivot_id)}>
                        <Currency quantity={debt} currency="EUR" />
                      </td>
                      <td onClick={() => this.forwardToRegistration(tournament._pivot_id)}>{status.label}</td>
                      <td onClick={() => this.forwardToRegistration(tournament._pivot_id)}>
                        {tournament._pivot_success}
                        <br />
                        {tournament._pivot_points ? `${tournament._pivot_points} points` : ''}
                      </td>
                      <td>
                        <div className="d-flex flex-wrap justify-content-center align-items-center">
                          <Link to="/edit" className="m-1">
                            <i className="far fa-edit text-info" />
                          </Link>
                          <i className="far fa-trash-alt text-danger m-1 cursorPointer" role="button"
                             onClick={() => { this.deleteRegistration(tournament._pivot_id); }} />
                        </div>
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

export default connect(mapStateToProps)(Home);
