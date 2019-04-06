/* eslint-disable camelcase */
import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import Currency from 'react-currency-formatter';
import FlexTable from '../../FlexTable/FlexTable';
import { attendanceStatuses } from '../../../constants/applicationConstants';
import { getUserByRegistrationId } from '../../../actions/UserActions';

const mapStateToProps = ({ user }) => ({
  users: user.users,
});

const mapDispatchToProps = { getUserByRegistrationId };

class Registration extends Component {
  componentWillMount() {
    const { users } = this.props;
    const registrationId = parseInt(this.props.match.params.id, 10);
    const user = users.find(({ tournaments }) =>
      tournaments.find(({ _pivot_id }) => _pivot_id === registrationId),
    );
    if (!user) {
      this.props.getUserByRegistrationId(registrationId);
    }
  }

  render() {
    const { users } = this.props;
    const registrationId = parseInt(this.props.match.params.id, 10);
    const notFound = (
      <div className="container">
        <h2 className="py-4">
          Registration not found. You might not have permission to see this registration.
        </h2>
      </div>
    );
    if (!users || !users.length) return notFound;
    const user = users.find(({ tournaments }) =>
      tournaments.find(({ _pivot_id }) => _pivot_id === registrationId),
    );
    if (!user) return notFound;
    const tournament = user.tournaments.find(
      tournamentObj => tournamentObj._pivot_id === parseInt(this.props.match.params.id, 10),
    );
    if (!tournament) return notFound;

    const attendanceStatusObj = attendanceStatuses.find(
      statusObj => statusObj.id === tournament._pivot_attended,
    );
    const attendanceStatus = attendanceStatusObj ? attendanceStatusObj.label : '';
    const dateFormat = 'DD.MM.YYYY';
    const startdate = tournament.startdate ? moment(tournament.startdate).format(dateFormat) : '';
    const enddate = tournament.enddate ? moment(tournament.enddate).format(dateFormat) : '';

    const registrationTableRows = [
      user.vorname && user.name ? ['User', `${user.vorname} ${user.name}`] : null,
      tournament.name ? ['Tournament', tournament.name] : null,
      tournament.startdate && tournament.startdate ? ['Date', `${startdate} - ${enddate}`] : null,
      tournament._pivot_role ? ['Role', tournament._pivot_role] : null,
      tournament._pivot_teamname ? ['Team Name', tournament._pivot_teamname] : null,
      tournament._pivot_comment ? ['Comment', tournament._pivot_comment] : null,
      tournament._pivot_is_independent ? ['Independent', tournament._pivot_is_independent] : null,
      tournament._pivot_funding ? ['Funding', tournament._pivot_funding] : null,
      tournament._pivot_price_owed
        ? ['Costs', <Currency quantity={tournament._pivot_price_owed || 0} currency="EUR" />]
        : null,
      tournament._pivot_price_paid
        ? ['Price paid', <Currency quantity={tournament._pivot_price_paid || 0} currency="EUR" />]
        : null,
      tournament._pivot_price_owed
        ? [
            'Debt',
            <span
              className={
                tournament._pivot_price_owed - tournament._pivot_price_paid > 0
                  ? 'text-danger'
                  : null
              }
            >
              <Currency
                quantity={tournament._pivot_price_owed - tournament._pivot_price_paid || 0}
                currency="EUR"
              />
            </span>,
          ]
        : null,
      attendanceStatus ? ['Status', attendanceStatus] : null,
      tournament._pivot_success ? ['Success', tournament._pivot_success] : null,
      tournament._pivot_points ? ['Points', tournament._pivot_points] : null,
      tournament._pivot_partner1
        ? [`${tournament._pivot_partner2 ? 'Partner 1' : 'Partner'}`, tournament._pivot_partner1]
        : null,
      tournament._pivot_partner2 ? ['Partner 2', tournament._pivot_partner2] : null,
    ].filter(row => row);

    return (
      <div className="container">
        {user && user.tournaments ? (
          <div className="row">
            <div className="col-12 col-md-6 col-lg-5 col-xl-4 offset-md-1">
              <h1 className="py-4">Registration {this.props.match.params.id}</h1>
              <FlexTable
                key={`registrationTable_${tournament._pivot_id}`}
                tableName={`registrationTable_${tournament._pivot_id}`}
                bodyRows={registrationTableRows}
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Registration);
