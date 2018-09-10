import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import Currency from 'react-currency-formatter';
import { attendanceStatuses } from '../../../js/constants/applicationConstants';

const mapStateToProps = ({
  authentication,
}) => ({
  user: authentication.authenticatedUser,
});

class Registration extends Component {
  render() {
    const { user } = this.props;
    const tournament = user.tournaments.find(
      tournamentObj => tournamentObj._pivot_id === parseInt(this.props.match.params.id, 10),
    );
    if (!tournament) {
      return (
        <div className="container">
          <h2>Tournament not found.</h2>
        </div>
      );
    }

    const attendanceStatusObj = attendanceStatuses.find(statusObj => statusObj.id === tournament._pivot_attended);
    const attendanceStatus = attendanceStatusObj ? attendanceStatusObj.label : '';
    const dateFormat = 'DD.MM.YYYY';
    const startdate = tournament.startdate ? moment(tournament.startdate).format(dateFormat) : '';
    const enddate = tournament.enddate ? moment(tournament.enddate).format(dateFormat) : '';

    return (
      <div className="container">
        <h1 className="py-4">Registration {this.props.match.params.id}</h1>
        {(user && user.tournaments) ? (
          <table className="table table-hover table-responsive">
            <tbody>
              <tr>
                <th>User</th>
                <td>{user.vorname} {user.name}</td>
              </tr>
              <tr>
                <th>Tournament</th>
                <td>{tournament.name}</td>
              </tr>
              <tr>
                <th>Date</th>
                <td>{`${startdate} - ${enddate}`}</td>
              </tr>
              <tr>
                <th>Role</th>
                <td>{tournament._pivot_role}</td>
              </tr>
              {tournament._pivot_teamname ? (
                <tr>
                  <th>Team Name</th>
                  <td>{tournament._pivot_teamname}</td>
                </tr>
              ) : null}
              {tournament._pivot_comment ? (
                <tr>
                  <th>Comment</th>
                  <td>{tournament._pivot_comment}</td>
                </tr>
              ) : null}
              <tr>
                <th>Independent</th>
                <td>{tournament._pivot_is_independent}</td>
              </tr>
              <tr>
                <th>Funding</th>
                <td>{tournament._pivot_funding}</td>
              </tr>
              <tr>
                <th>Costs</th>
                <td><Currency quantity={tournament._pivot_price_owed} currency="EUR" /></td>
              </tr>
              <tr>
                <th>Price paid</th>
                <td><Currency quantity={tournament._pivot_price_paid} currency="EUR" /></td>
              </tr>
              <tr>
                <th>Debt</th>
                <td>
                  <Currency quantity={tournament._pivot_price_owed - tournament._pivot_price_paid} currency="EUR" />
                </td>
              </tr>
              <tr>
                <th>Status</th>
                <td>{attendanceStatus}</td>
              </tr>
              <tr>
                <th>Success</th>
                <td>{tournament._pivot_success}</td>
              </tr>
              <tr>
                <th>Points</th>
                <td>{tournament._pivot_points}</td>
              </tr>
              {tournament._pivot_partner1 ? (
                <tr>
                  <th>{tournament._pivot_partner2 ? 'Partner 1' : 'Partner'}</th>
                  <td>{tournament._pivot_partner1}</td>
                </tr>
              ) : null}
              {tournament._pivot_partner2 ? (
                <tr>
                  <th>Partner 2</th>
                  <td>{tournament._pivot_partner2}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        ) : ''}
      </div>
    );
  }
}

export default connect(mapStateToProps)(Registration);
