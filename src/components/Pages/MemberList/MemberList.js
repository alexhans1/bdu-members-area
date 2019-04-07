/* eslint-disable camelcase */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment/moment';
import BootstrapTable from 'react-bootstrap-table-next';
import Currency from 'react-currency-formatter';
import Spinner from '../../Spinner/Spinner';
import { DATE_TIME_FORMAT, registrationRoles } from '../../../constants/applicationConstants';
import MemberRowCollapse from './MemberRowCollapse';

const mapStateToProps = ({ user }) => ({
  users: user.users,
});

class MembersList extends Component {
  render() {
    const { users, history } = this.props;

    if (!users.length) {
      return (
        <div className="mainContent d-flex justify-content-center align-items-center">
          <Spinner xl />
        </div>
      );
    }

    const enrichedUserList = users.map(user => {
      const totalPoints = user.tournaments.reduce((total, tournament) => {
        const addedPoints = moment(tournament.startdate).isBefore(moment().subtract(1, 'years'))
          ? 0
          : tournament._pivot_points;
        return total + addedPoints;
      }, 0);
      const totalTournaments = user.tournaments.length || 0;
      const totalTournamentsAsJudge =
        user.tournaments.filter(({ _pivot_role }) => _pivot_role === registrationRoles.JUDGE)
          .length || 0;
      const judgingRatio = Math.round((totalTournamentsAsJudge * 100) / totalTournaments) || -1;
      const totalDebt = user.tournaments.reduce((total, tournament) => {
        const debt = tournament._pivot_price_paid - tournament._pivot_price_owed;
        return total - debt;
      }, 0);
      user.totalPoints = totalPoints;
      user.totalTournaments = totalTournaments;
      user.judgingRatio = judgingRatio;
      user.totalDebt = totalDebt;

      return user;
    });

    const membersTableColumns = [
      {
        dataField: 'id',
        text: 'ID',
        hidden: true,
      },
      {
        dataField: 'vorname',
        isDummyField: true,
        text: 'Name',
        sort: true,
        formatter: (cellContent, row) => `${row.vorname} ${row.name}`,
      },
      {
        dataField: 'totalDebt',
        text: 'Debt',
        sort: true,
        formatter: cellContent => (
          <span className={cellContent > 0 ? 'text-danger' : null}>
            <Currency quantity={cellContent || 0} currency="EUR" />
          </span>
        ),
      },
      {
        dataField: 'totalTournaments',
        text: 'Tournaments',
        classes: 'd-none d-lg-table-cell',
        headerClasses: 'd-none d-lg-table-cell',
        sort: true,
      },
      {
        dataField: 'judgingRatio',
        text: 'Judging Ratio',
        sort: true,
      },
      {
        dataField: 'totalPoints',
        text: 'Points',
        sort: true,
        classes: 'd-none d-lg-table-cell',
        headerClasses: 'd-none d-lg-table-cell',
      },
      {
        dataField: 'last_login',
        text: 'Last Login',
        sort: true,
        formatter: cellContent => moment(cellContent).format(DATE_TIME_FORMAT),
      },
    ];

    const expandRow = {
      renderer: row => <MemberRowCollapse user={row} history={history} />,
      onlyOneExpanding: true,
    };

    return (
      <div className="container-fluid py-4">
        <h2 className="mb-4">MembersList</h2>
        <BootstrapTable
          bootstrap4
          hover
          keyField="id"
          data={enrichedUserList}
          columns={membersTableColumns}
          defaultSorted={[
            {
              dataField: 'totalDebt',
              order: 'desc',
            },
          ]}
          rowClasses="cursorPointer"
          expandRow={expandRow}
          bordered={false}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps)(MembersList);
