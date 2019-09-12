import React, { useState, useEffect } from "react";
import moment from 'moment';
import BootstrapTable from 'react-bootstrap-table-next';
// import { useDispatch, useSelector } from 'react-redux';
import './HowToList.scss';
import { DATE_FORMAT } from '../../../constants/applicationConstants';
// import TournamentRowCollapse from './TournamentRowCollapse';
/* import {
  SET_EXPANDED_TOURNAMENT_ID,
  TOGGLE_SHOW_PREV_TOURNAMENTS,
} from '../../../../constants/action-types'; */


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
    formatter: (cellContent, addedAt) => `${moment(addedAt).format(DATE_FORMAT)}`,
  },
  
];


const HowToList = () => {
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

  const [entryList, setEntryList] = useState([]);
  

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`${BASE_URL}/wikiLinks`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.status === 200) {
        const { data: links } = await response.json();
        if (links)
          setEntryList(links);
      }
    }
    fetchData()
  }, entryList);


  const expandRow = {
    renderer: row => (
      <p>{row.description}</p>
    ),
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
      <h2 className="mb-4">A collection of important HowTos</h2>
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

export default HowToList;
