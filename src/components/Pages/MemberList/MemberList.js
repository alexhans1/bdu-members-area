/* eslint-disable camelcase */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment/moment';
import Currency from 'react-currency-formatter';
import FlexTable from '../../FlexTable/FlexTable';
import Spinner from '../../Spinner/Spinner';
import { getUserList } from '../../../actions/UserActions';
import { DATE_TIME_FORMAT, registrationRoles } from '../../../constants/applicationConstants';
import MemberRowCollapse from './MemberRowCollapse';

const sortUserList = (a, b, sortBy, sortDirection) => ((a[sortBy] > b[sortBy])
  ? sortDirection
  : ((b[sortBy] > a[sortBy]) ? -1 * sortDirection : 0));

const mapStateToProps = ({
  user,
}) => ({
  users: user.users,
});

const mapDispatchToProps = { getUserList };

class MembersList extends Component {
  constructor() {
    super();
    this.state = {
      sortBy: 'totalDebt',
      sortDirection: -1,
    };

    this.sortColumn = this.sortColumn.bind(this);
  }

  componentWillMount() {
    this.props.getUserList();
  }

  sortColumn(columnIndex) {
    const { sortBy } = this.state;
    const sortableColumns = [
      'vorname',
      'totalDebt',
      'totalTournaments',
      'judgingRatio',
      'totalPoints',
      'last_login',
    ];
    if (columnIndex === sortableColumns.indexOf(sortBy)) {
      return this.setState(previousState => ({
        sortDirection: previousState.sortDirection * -1,
      }));
    }
    return this.setState({
      sortBy: sortableColumns[columnIndex],
    });
  }

  render() {
    const { users, history } = this.props;
    const { sortBy, sortDirection } = this.state;

    if (!users.length) {
      return (
        <div className="mainContent d-flex justify-content-center align-items-center">
          <Spinner xl />
        </div>
      );
    }

    const enrichedUserList = users.map((user) => {
      const totalPoints = user.tournaments.reduce((total, tournament) => {
        const addedPoints = moment(tournament.startdate).isBefore(moment().subtract(1, 'years'))
          ? 0
          : tournament._pivot_points;
        return total + addedPoints;
      }, 0);
      const totalTournaments = user.tournaments.length || 0;
      const totalTorunamentsAsJudge = user.tournaments.filter(
        ({ _pivot_role }) => _pivot_role === registrationRoles.JUDGE,
      ).length || 0;
      const judgingRatio = Math.round(totalTorunamentsAsJudge * 100 / totalTournaments) || -1;
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
    const sortedUsers = enrichedUserList.sort((a, b) => sortUserList(a, b, sortBy, sortDirection));
    const membersBodyRows = sortedUsers.map(user => [
      `${user.vorname} ${user.name}`,
      <Currency quantity={Math.round(user.totalDebt * 100) / 100} currency="EUR" />,
      user.tournaments.length,
      `${user.judgingRatio}%`,
      user.totalPoints,
      moment(user.last_login).format(DATE_TIME_FORMAT),
    ]);

    const collapseRows = sortedUsers.map(user => (
      <MemberRowCollapse user={user} history={history} />
    ));


    return (
      <div className="container-fluid py-4">
        <h2 className="mb-4">MembersList</h2>
        <FlexTable tableName="membersTable"
                   headColumns={['Name', 'Debt', 'Tournaments', 'Judging Ratio', 'Points', 'Last Login']}
                   sortColumn={this.sortColumn}
                   bodyRows={membersBodyRows} collapse={collapseRows} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MembersList);
