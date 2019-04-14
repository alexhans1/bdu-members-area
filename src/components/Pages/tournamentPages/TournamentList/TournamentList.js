import React, { Component } from 'react';
import moment from 'moment';
import BootstrapTable from 'react-bootstrap-table-next';
import { connect } from 'react-redux';
import './TournamentList.css';
import { DATE_FORMAT } from '../../../../constants/applicationConstants';
import TournamentRowCollapse from './TournamentRowCollapse';
import {
  SET_EXPANDED_TOURNAMENT_ID,
  TOGGLE_SHOW_PREV_TOURNAMENTS,
} from '../../../../constants/action-types';

const mapStateToProps = ({ tournament, user }) => ({
  authenticatedUser: user.authenticatedUserId
    ? user.users.find(({ id }) => user.authenticatedUserId === id)
    : {},
  tournaments: tournament.showPreviousTournaments
    ? tournament.tournamentList
    : tournament.tournamentList.filter(({ enddate }) => moment(enddate).isAfter(moment())),
  expandedTournamentId: tournament.expandedTournamentId,
});

const mapDispatchToProps = dispatch => {
  return {
    toggleShowPrevTournaments: () => dispatch({ type: TOGGLE_SHOW_PREV_TOURNAMENTS }),
    setExpandedTournamentId: tournamentId =>
      dispatch({ type: SET_EXPANDED_TOURNAMENT_ID, payload: { tournamentId } }),
  };
};

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
    dataField: 'startdate',
    isDummyField: true,
    text: 'Date',
    sort: true,
    sortFunc: (a, b, order) => {
      if (order === 'asc') {
        return moment(a).isAfter(moment(b)) ? 1 : moment(a).isBefore(moment(b)) ? -1 : 0;
      }
      return moment(a).isAfter(moment(b)) ? -1 : moment(a).isBefore(moment(b)) ? 1 : 0;
    },
    formatter: (cellContent, row) =>
      `${moment(row.startdate).format(DATE_FORMAT)} - ${moment(row.enddate).format(DATE_FORMAT)}`,
  },
  {
    dataField: 'ort',
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
    sortFunc: (a, b, order) => (order === 'asc' ? a.length - b.length : b.length - a.length),
    classes: 'd-none d-lg-table-cell',
    headerClasses: 'd-none d-lg-table-cell',
    formatter: cellContent => cellContent.length,
  },
];

class TournamentList extends Component {
  componentDidUpdate() {
    const { expandedTournamentId } = this.props;
    if (expandedTournamentId) {
      const el = document.getElementById(expandedTournamentId).parentElement.parentElement
        .previousSibling;
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  render() {
    const {
      tournaments,
      setExpandedTournamentId,
      expandedTournamentId,
      toggleShowPrevTournaments: handleToggle,
      history,
    } = this.props;

    const expandRow = {
      renderer: row => <TournamentRowCollapse tournament={row} history={history} />,
      onlyOneExpanding: true,
      expanded: [expandedTournamentId],
    };

    return (
      <div className="container-fluid py-4">
        <h2 className="mb-4">BDU Tournaments</h2>
        <BootstrapTable
          bootstrap4
          hover
          keyField="id"
          data={tournaments}
          columns={tableColumns}
          defaultSorted={[
            {
              dataField: 'startdate',
              order: 'desc',
            },
          ]}
          rowEvents={{
            onClick: (e, row) => setExpandedTournamentId(row.id),
          }}
          rowClasses="cursorPointer"
          expandRow={expandRow}
          bordered={false}
        />
        <div className="d-flex align-items-center flex-column flex-sm-row mt-4">
          <button type="button" className="btn btn-outline-info" onClick={handleToggle}>
            {tournaments.find(({ enddate }) => moment(enddate).isBefore(moment()))
              ? 'Hide'
              : 'Show'}{' '}
            previous tournaments
          </button>
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TournamentList);
