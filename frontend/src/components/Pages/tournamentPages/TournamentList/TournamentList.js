import React, { useCallback } from 'react';
import moment from 'moment';
import BootstrapTable from 'react-bootstrap-table-next';
import { useDispatch, useSelector } from 'react-redux';
import './TournamentList.scss';
import { DATE_FORMAT } from '../../../../constants/applicationConstants';
import TournamentRowCollapse from './TournamentRowCollapse';
import {
  SET_EXPANDED_TOURNAMENT_ID,
  TOGGLE_SHOW_PREV_TOURNAMENTS,
} from '../../../../constants/action-types';

const tableColumns = [
  {
    dataField: 'id',
    text: 'ID',
    hidden: true,
  },
  {
    dataField: 'name',
    text: 'Name',
    sort: true,
    style: { wordBreak: 'break-word' },
  },
  {
    dataField: 'startDate',
    isDummyField: true,
    text: 'Date',
    sort: true,
    sortFunc: (a, b, order) => {
      if (order === 'asc') {
        return moment(a).isAfter(moment(b))
          ? 1
          : moment(a).isBefore(moment(b))
          ? -1
          : 0;
      }
      return moment(a).isAfter(moment(b))
        ? -1
        : moment(a).isBefore(moment(b))
        ? 1
        : 0;
    },
    formatter: (cellContent, row) =>
      `${moment(row.startDate).format(DATE_FORMAT)} - ${moment(
        row.endDate,
      ).format(DATE_FORMAT)}`,
  },
  {
    dataField: 'location',
    text: 'Location',
    sort: true,
    style: { wordBreak: 'break-word' },
  },
  {
    dataField: 'language',
    text: 'Language',
    sort: true,
    classes: 'd-none d-lg-table-cell',
    headerClasses: 'd-none d-lg-table-cell',
    formatter: (cellContent, row) => row.language.toUpperCase(),
  },
  {
    dataField: 'users',
    text: 'Users',
    sort: true,
    sortFunc: (a, b, order) =>
      order === 'asc' ? a.length - b.length : b.length - a.length,
    classes: 'd-none d-lg-table-cell',
    headerClasses: 'd-none d-lg-table-cell',
    formatter: cellContent => cellContent.length,
  },
];

const TournamentList = ({ history }) => {
  const { expandedTournamentId, tournaments } = useSelector(
    ({
      tournament: {
        tournamentList,
        showPreviousTournaments,
        expandedTournamentId: tId,
      },
    }) => ({
      tournaments: showPreviousTournaments
        ? tournamentList
        : tournamentList.filter(({ endDate }) =>
            moment(endDate).isAfter(moment()),
          ),
      expandedTournamentId: tId,
    }),
  );

  const dispatch = useDispatch();
  const handleToggle = useCallback(
    () => dispatch({ type: TOGGLE_SHOW_PREV_TOURNAMENTS }),
    [dispatch],
  );
  const setExpandedTournamentId = tournamentId =>
    dispatch({ type: SET_EXPANDED_TOURNAMENT_ID, payload: { tournamentId } });

  const expandRow = {
    renderer: row =>
      expandedTournamentId ? (
        <TournamentRowCollapse tournament={row} history={history} />
      ) : null,
    onlyOneExpanding: true,
    onExpand: (row, isExpand, rowIndex, e) => {
      setExpandedTournamentId(isExpand ? row.id : null);
      if (isExpand) {
        const el = e.target;
        if (!el) return;
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 1);
      }
    },
    expanded: [expandedTournamentId],
  };

  return (
    <div className="container-fluid page-content">
      <h2 className="mb-4">BDU Tournaments</h2>
      <BootstrapTable
        bootstrap4
        hover
        keyField="id"
        data={tournaments}
        columns={tableColumns}
        defaultSorted={[
          {
            dataField: 'startDate',
            order: 'desc',
          },
        ]}
        rowClasses="cursorPointer"
        expandRow={expandRow}
        bordered={false}
      />
      <div className="d-flex align-items-center flex-column flex-sm-row mt-4">
        <button
          type="button"
          className="btn btn-outline-info"
          onClick={handleToggle}
        >
          {tournaments.find(({ endDate }) => moment(endDate).isBefore(moment()))
            ? 'Hide '
            : 'Show '}
          previous tournaments
        </button>
      </div>
    </div>
  );
};

export default TournamentList;
