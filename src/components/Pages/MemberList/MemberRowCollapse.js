import React, { Component } from 'react';
import Currency from 'react-currency-formatter';
import moment from 'moment/moment';
import FlexTable from '../../FlexTable/FlexTable';
import { DATE_FORMAT } from '../../../constants/applicationConstants';

export default class MemberRowCollapse extends Component {
  constructor() {
    super();

    this.forwardToRegistration = this.forwardToRegistration.bind(this);
  }

  forwardToRegistration(rowIndex) {
    const { user } = this.props;
    const registrationId = user.tournaments[rowIndex]._pivot_id;
    this.props.history.push(`/registration/${registrationId}`);
  }

  render() {
    const { user } = this.props;
    const userTableRows = [
      ['ID', user.id],
      ['Email', user.email],
      ['Last Debt Mail', moment(user.last_mail).format(DATE_FORMAT)],
      ['Total Debt', <Currency quantity={user.totalDebt || 0} currency="EUR" />],
    ];

    const registrationTableRows = user.tournaments.length ? user.tournaments.map((tournament) => {
      const debt = tournament._pivot_price_owed - tournament._pivot_price_paid;
      return [
        tournament.name,
        moment(tournament.startdate).format(DATE_FORMAT),
        tournament._pivot_role,
        <Currency quantity={tournament._pivot_price_paid || 0} currency="EUR" />,
        <Currency quantity={tournament._pivot_price_owed || 0} currency="EUR" />,
        <Currency quantity={debt || 0} currency="EUR" />,
        moment(tournament._pivot_transaction_date).format(DATE_FORMAT),
        tournament._pivot_transaction_from,
      ];
    }) : null;

    return (
      <div className="collapseContainer">
        <div className="collapseTournamentContainer">
          <h3 className="pr-4 pr-sm-0">{user.vorname} {user.name}</h3>
          <FlexTable key={`userTable_${user.id}`} tableName={`userTable_${user.id}`}
                     bodyRows={userTableRows} striped />
        </div>
        <div className="collapseUserContainer">
          <div className="d-flex">
            <h3>Registrations</h3>
          </div>
          {user.tournaments.length ? (
            <FlexTable key={`registrationTable_${user.id}`} tableName={`registrationTable_${user.id}`}
                       headColumns={[
                         'Name',
                         'Date',
                         'Role',
                         'Amount Paid',
                         'Amount Owed',
                         'Debt',
                         'Transaction Date',
                         'Transaction From',
                       ]}
                       actionOnRowClick={this.forwardToRegistration}
                       bodyRows={registrationTableRows} striped />
          ) : (
            <p>{user.vorname } has no registrations yet.</p>
          )}
        </div>
      </div>
    );
  }
}
