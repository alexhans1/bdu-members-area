import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import BootstrapTable from 'react-bootstrap-table-next';
import './WikiLinkList.scss';
import { BASE_URL, DATE_FORMAT } from '../../../constants/applicationConstants';

// feature for expanded rows disabled, keep code fragments for possible later use

/* import TournamentRowCollapse from './TournamentRowCollapse';
import {
  SET_EXPANDED_TOURNAMENT_ID,
  TOGGLE_SHOW_PREV_TOURNAMENTS,
} from '../../../../constants/action-types'; */

import CreateWikiLinkForm from './CreateWikiLinkForm';

// define the bootstrap table colums
const tableColumns = [
  {
    dataField: 'id',
    text: 'ID',
    hidden: true,
  },
  {
    dataField: 'title',
    text: 'Title',
    sort: true,
    style: { wordBreak: 'break-word' },
  },
  {
    dataField: 'url',
    text: 'Link',
    style: { wordBreak: 'break-word' },
  },
  {
    dataField: 'topic',
    text: 'Topic',
    sort: true,
    classes: 'd-none d-lg-table-cell',
    headerClasses: 'd-none d-lg-table-cell',
    formatter: (cellContent, row) => row.topic.toUpperCase(),
  },
  {
    dataField: 'created_at',
    isDummyField: true,
    text: 'Added to Collection',
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
    formatter: (cellContent, addedAt) =>
      `${moment(addedAt).format(DATE_FORMAT)}`,
  },
];

const WikiLinkList = ({ isAdmin }) => {
  // code disabled, keep for possible later use
  /* const { expandedTournamentId, tournaments } = useSelector(
    ({
      howto: {
        tournamentList,
        showPreviousTournaments,
        expandedTournamentId: tId,
      },
    }) => ({
      tournaments: showPreviousTournaments
        ? tournamentList
        : tournamentList.filter(({ enddate }) =>
            moment(enddate).isAfter(moment()),
          ),
      expandedTournamentId: tId,
    }),
  ); */

  /* const dispatch = useDispatch(); */
  /* const handleToggle = useCallback(() =>
    dispatch({ type: TOGGLE_SHOW_PREV_TOURNAMENTS }),
  );
  const setExpandedTournamentId = tournamentId =>
    dispatch({ type: SET_EXPANDED_TOURNAMENT_ID, payload: { tournamentId } }); */

  // add the entry list to the state of the component
  const [entryList, setEntryList] = useState([]);

  // define behaviour on render of the component
  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`${BASE_URL}/wikiLinks`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.status === 200) {
        const { data: links } = await response.json();
        if (links) setEntryList(links);
      }
    }
    fetchData();
  }, [entryList]); // do not rerender if entryList has not changed. COMMENT: tobi is unsure if the code is correct for inteded behaviour

  // definde behaviour of onClick of an entry
  const expandRow = {
    renderer: row => <p>{row.description}</p>,
    onlyOneExpanding: false,
    onExpand: (row, isExpand, rowIndex, e) => {
      // setExpandedTournamentId(isExpand ? row.id : null);
      if (isExpand) {
        const el = e.target;
        if (!el) return;
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 1);
      }
    },
    // expanded: [expandedTournamentId],
  };

  return (
    <div className="container-fluid page-content">
      {isAdmin ? <CreateWikiLinkForm /> : null}

      <h2 className="mb-4">HowTos, Templates, Documents</h2>
      <BootstrapTable
        bootstrap4
        hover
        keyField="id"
        data={entryList}
        columns={tableColumns}
        defaultSorted={[
          {
            dataField: 'created_at',
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

function mapStateToProps({ user }) {
  return {
    // helper function to handle admin authentication
    // COMMENT: tobi thinks this should be somewhere more central to avoid redundant code
    isAdmin: user.authenticatedUserId
      ? user.users.find(({ id }) => user.authenticatedUserId === id)
          .position === 1
      : false,
  };
}

export default connect(mapStateToProps)(WikiLinkList);
