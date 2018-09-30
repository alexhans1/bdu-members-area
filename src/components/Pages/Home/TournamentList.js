import React, { Component } from 'react';
import moment from 'moment/moment';
import { confirmAlert } from 'react-confirm-alert';
import Currency from 'react-currency-formatter';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { attendanceStatuses } from '../../../constants/applicationConstants';
import { deleteRegistration } from '../../../actions/RegistrationActions';

const mapDispatchToProps = { deleteRegistration };

class TournamentList extends Component {
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
          onClick: () => this.props.deleteRegistration(registrationId),
        },
        {
          label: 'No',
          onClick: () => {},
        },
      ],
    });
  }

  render() {
    const { tournaments } = this.props;

    return (
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
    );
  }
}

export default connect(null, mapDispatchToProps)(TournamentList);
