/* eslint-disable camelcase */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment/moment';
import Currency from 'react-currency-formatter';
import FlexTable from '../../FlexTable/FlexTable';
import Spinner from '../../Spinner/Spinner';
import { getUserList } from '../../../actions/UserActions';
import { registrationRoles } from '../../../constants/applicationConstants';

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
      sortBy: 1,
      sortDirection: 1,
    };

    this.sortColumn = this.sortColumn.bind(this);
  }

  componentWillMount() {
    this.props.getUserList();
  }

  sortColumn(columnIndex) {
    const { sortBy, sortDirection } = this.state;
    if (columnIndex === sortBy) {
      return this.setState({
        sortDirection: sortDirection * -1,
      });
    }
    return this.setState({
      sortBy: columnIndex,
    });
  }

  render() {
    const { users } = this.props;
    const { sortBy, sortDirection } = this.state;

    if (!users.length) {
      return (
        <div className="mainContent d-flex justify-content-center align-items-center">
          <Spinner xl />
        </div>
      );
    }

    const dateFormat = 'LL';
    const membersBodyRows = users.map((user) => {
      const lastLoginDate = moment(user.last_login).format(dateFormat);
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
      return [
        `${user.vorname} ${user.name}`,
        <Currency quantity={Math.round(totalDebt * 100) / 100} currency="EUR" />,
        user.tournaments.length,
        `${judgingRatio}%`,
        totalPoints,
        lastLoginDate,
      ];
    }).sort((a, b) => {
      // custom sort for debt
      if (sortBy === 1) {
        return (b[sortBy].props.quantity < a[sortBy].props.quantity) ? -1 * sortDirection : sortDirection;
      }
      // custom sort for percentages
      if (sortBy === 3) {
        return (parseInt(b[sortBy].substr(0, b[sortBy].search('%')), 10)
          < parseInt(a[sortBy].substr(0, a[sortBy].search('%')), 10)) ? -1 * sortDirection : sortDirection;
      }
      // custom sort for dates
      if (sortBy === 5) {
        return moment(a[sortBy]).isAfter(b[sortBy]) ? -1 * sortDirection : sortDirection;
      }
      if (b[sortBy] < a[sortBy]) return -1 * sortDirection;
      if (b[sortBy] > a[sortBy]) return sortDirection;
      return 0;
    });

    return (
      <div className="container-fluid py-4">
        <h2 className="mb-4">MembersList</h2>
        <FlexTable tableName="membersTable"
                   headColumns={['Name', 'Debt', 'Tournaments', 'Judging Ratio', 'Points', 'Last Login']}
                   sortColumn={this.sortColumn}
                   bodyRows={membersBodyRows} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MembersList);
