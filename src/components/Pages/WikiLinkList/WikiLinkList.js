import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { confirmAlert } from 'react-confirm-alert';
import BootstrapTable from 'react-bootstrap-table-next';

import './WikiLinkList.scss';
import triggerAlert from '../../../actions/actionHelpers';
import {
  alertTypes,
  BASE_URL,
  DATE_FORMAT,
} from '../../../constants/applicationConstants';

// feature for expanded rows disabled, keep code fragments for possible later use

/* import TournamentRowCollapse from './TournamentRowCollapse';
import {
  SET_EXPANDED_TOURNAMENT_ID,
  TOGGLE_SHOW_PREV_TOURNAMENTS,
} from '../../../../constants/action-types'; */

import CreateWikiLinkModal from './CreateWikiLinkModal';

const WikiLinkList = ({ isAdmin }) => {
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
      formatter: (cellContent, row) => {
        return (
          <a href={row.url} target="_blank">
            Open Document
          </a>
        );
      },
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

  const [modalIsOpen, setModalIsOpen] = useState(false);

  async function fetchWikiLinks() {
    const response = await fetch(`${BASE_URL}/wikiLinks`, {
      method: 'GET',
      credentials: 'include',
    });
    if (response.status === 200) {
      const { data: links } = await response.json();
      if (links) setEntryList(links);
    }
  }

  // define behaviour on render of the component
  useEffect(() => {
    fetchWikiLinks();
  }, []); // only render one time

  // definde behaviour of onClick of an entry
  const expandRow = {
    renderer: row => (
      <div>
        <p>{row.description}</p>
        <p>
          URL:{' '}
          <a href={row.url} target="_blank">
            {row.url}
          </a>
        </p>
        <button
          onClick={() => {
            handleDeleteClick(row.id);
          }}
          type="button"
          className="btn btn-outline-danger ml-2"
        >
          Delete
        </button>
      </div>
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

  const handleDeleteClick = linkId => {
    confirmAlert({
      title: 'Confirm',
      message: 'Are you sure you want to delete this link?',
      buttons: [
        {
          label: 'Yes',
          class: 'btn btn-success',
          onClick: () => deleteWikiLink(linkId),
        },
        {
          label: 'No',
          onClick: () => {},
        },
      ],
    });
  };

  async function deleteWikiLink(linkId) {
    const response = await fetch(`${BASE_URL}/wikiLinks/${linkId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const body = await response.json();
    if (response.status === 200) {
      triggerAlert(body.message, alertTypes.SUCCESS);
      fetchWikiLinks();
    } else triggerAlert(body.message, alertTypes.WARNING);
  }

  const handleAddedWikiLink = () => {
    fetchWikiLinks();
    setModalIsOpen(false);
  };
  return (
    <div className="container-fluid page-content">
      <h2 className="mb-4">HowTos, Templates, Documents</h2>
      <p>
        Find a selection of HowTos, Templates and other documents that are
        usefull for debating.
      </p>
      {isAdmin ? (
        <p>
          As an admin, you can add new links to documents:
          <button
            className="btn btn-outline-success ml-3"
            type="button"
            onClick={() => {
              setModalIsOpen(true);
            }}
          >
            Add Document
          </button>
          <CreateWikiLinkModal
            isOpen={modalIsOpen}
            closeModal={() => {
              setModalIsOpen(false);
            }}
            handleAddedWikiLink={handleAddedWikiLink}
          />
        </p>
      ) : null}
      <p></p>
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
