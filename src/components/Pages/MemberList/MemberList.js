/* eslint-disable camelcase */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment/moment';
import BootstrapTable from 'react-bootstrap-table-next';
import Currency from 'react-currency-formatter';
import {
  DATE_TIME_FORMAT,
  registrationRoles,
} from '../../../constants/applicationConstants';
import MemberRowCollapse from './MemberRowCollapse';
import { SET_EXPANDED_USER_ID } from '../../../constants/action-types';
import { calculateTotalUserDebt } from '../../../helpers';

const membersTableColumns = [
  {
    dataField: 'id',
    text: 'ID',
    hidden: true,
  },
  {
    dataField: 'firstName',
    isDummyField: true,
    text: 'Name',
    sort: true,
    formatter: (cellContent, row) => `${row.firstName} ${row.name}`,
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
    classes: 'd-none d-lg-table-cell',
    headerClasses: 'd-none d-lg-table-cell',
    sort: true,
    formatter: cellContent => moment(cellContent).format(DATE_TIME_FORMAT),
  },
];

const MemberList = ({ history }) => {
  const { users, expandedUserId } = useSelector(state => ({
    users: state.user.users,
    expandedUserId: state.user.expandedUserId,
  }));
  const enrichedUserList = users.map(user => {
    const totalPoints = user.tournaments.reduce((total, tournament) => {
      const addedPoints = moment(tournament.startDate).isBefore(
        moment().subtract(1, 'years'),
      )
        ? 0
        : tournament._pivot_points;
      return total + addedPoints;
    }, 0);
    const totalTournaments = user.tournaments.length || 0;
    const totalTournamentsAsJudge =
      user.tournaments.filter(
        ({ _pivot_role }) => _pivot_role === registrationRoles.JUDGE,
      ).length || 0;
    const judgingRatio =
      Math.round((totalTournamentsAsJudge * 100) / totalTournaments) || -1;
    const totalDebt = calculateTotalUserDebt(user);

    return { ...user, totalPoints, totalTournaments, judgingRatio, totalDebt };
  });

  const dispatch = useDispatch();
  const setExpandedUserId = userId =>
    dispatch({ type: SET_EXPANDED_USER_ID, payload: { userId } });
  const expandRow = {
    renderer: row => (
      <MemberRowCollapse key={row.id} user={row} history={history} />
    ),
    onlyOneExpanding: true,
    expanded: [expandedUserId],
    onExpand: (row, isExpand, rowIndex, e) => {
      setExpandedUserId(isExpand ? row.id : null);
      if (isExpand) {
        const el = e.target;
        if (!el) return;
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 1);
      }
    },
  };

  return (
    <div className="container-fluid page-content">
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
};

export default MemberList;
