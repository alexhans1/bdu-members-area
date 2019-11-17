import React from 'react';
import { connect } from 'react-redux';
import BootstrapTable from 'react-bootstrap-table-next';
import moment from 'moment';
import { Check, X, Trash2 } from 'react-feather';

import { BASE_URL, DATE_FORMAT } from '../../../constants/applicationConstants';
import {
  GET_ALL_BUGS,
  REMOVE_BUG,
  SET_BUG_STATUS,
} from '../../../constants/action-types';
import BugReportForm from './BugReportForm';

let haveBugsLoaded;

const BugList = ({
  bugList,
  isAdmin,
  users,
  setBugStatus: handleUpdate,
  deleteBug: handleDelete,
  getBugList,
}) => {
  const [showAll, setShowAll] = React.useState(false);

  React.useEffect(() => {
    if (isAdmin && !haveBugsLoaded) {
      getBugList();
      haveBugsLoaded = true;
    }
  }, [isAdmin, getBugList]);

  return (
    <div className="container-fluid page-content">
      <BugReportForm />

      {isAdmin && bugList.length ? (
        <>
          <h2 className="pb-4">Bug List</h2>
          <BootstrapTable
            bootstrap4
            keyField="id"
            data={showAll ? bugList : bugList.filter(({ status }) => !status)}
            columns={[
              {
                dataField: 'description',
                text: 'Description',
                sort: true,
              },
              {
                dataField: 'created_at',
                text: 'Created at',
                sort: true,
                headerStyle: () => ({ maxWidth: '160px' }),
                formatter: cell => moment(cell).format(DATE_FORMAT),
              },
              {
                dataField: 'user_id',
                text: 'Reported by',
                isDummyField: true,
                sort: true,
                headerStyle: () => ({ maxWidth: '160px' }),
                /* eslint-disable camelcase */
                formatter: (a, { user_id }) => {
                  const user = users.find(({ id }) => id === user_id);
                  /* eslint-enable camelcase */
                  if (user && user.lastName && user.firstName)
                    return `${user.firstName} ${user.lastName}`;
                  return null;
                },
              },
              {
                dataField: 'status',
                text: 'Status',
                isDummyField: true,
                sort: true,
                headerStyle: () => ({ maxWidth: '100px' }),
                formatter: (cell, { id, status }) => {
                  return status ? (
                    <Check
                      role="button"
                      onClick={() => {
                        handleUpdate(id, status ? 0 : 1);
                      }}
                    />
                  ) : (
                    <X
                      role="button"
                      onClick={() => {
                        handleUpdate(id, status ? 0 : 1);
                      }}
                    />
                  );
                },
              },
              {
                dataField: '',
                text: '',
                isDummyField: true,
                sort: false,
                headerStyle: () => ({ maxWidth: '80px' }),
                formatter: (cell, { id }) => (
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => handleDelete(id)}
                  >
                    <Trash2 />
                  </button>
                ),
              },
            ]}
            defaultSorted={[
              {
                dataField: 'created_at',
                order: 'desc',
              },
            ]}
            bordered={false}
          />
          <div className="d-flex align-items-center flex-column flex-sm-row mt-4">
            <button
              type="button"
              className="btn btn-outline-info"
              onClick={() => {
                setShowAll(!showAll);
              }}
            >
              {showAll ? 'Hide ' : 'Show '}
              resolved issues
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
};

function mapStateToProps({ user, bug }) {
  return {
    isAdmin: user.authenticatedUserId
      ? user.users.find(({ id }) => user.authenticatedUserId === id)
          .position === 1
      : false,
    users: user.users,
    bugList: bug.bugList,
  };
}

const mapDispatchToProps = dispatch => ({
  getBugList: async () => {
    const response = await fetch(`${BASE_URL}/bugs`, {
      method: 'GET',
      credentials: 'include',
    });
    if (response.status === 200) {
      const { data: bugList } = await response.json();
      if (bugList)
        dispatch({
          type: GET_ALL_BUGS,
          payload: { bugList },
        });
    }
  },
  setBugStatus: async (bugId, status) => {
    const response = await fetch(`${BASE_URL}/bugs/${bugId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Method': 'PUT',
      },
      body: JSON.stringify({
        status,
      }),
    });
    if (response.status === 200) {
      dispatch({
        type: SET_BUG_STATUS,
        payload: { status, bugId },
      });
    }
  },
  deleteBug: async bugId => {
    const response = await fetch(`${BASE_URL}/bugs/${bugId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (response.status === 200) {
      dispatch({
        type: REMOVE_BUG,
        payload: { bugId },
      });
    }
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(BugList);
