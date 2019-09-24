import React from 'react';
import { useDispatch } from 'react-redux';
import BootstrapTable from 'react-bootstrap-table-next';
import Currency from 'react-currency-formatter';
import moment from 'moment/moment';
import FlexTable from '../../FlexTable/FlexTable';
import { DATE_FORMAT } from '../../../constants/applicationConstants';
import { patchRegistration } from '../../../actions/RegistrationActions';

const MemberRowCollapse = ({ history, user }) => {
  const dispatch = useDispatch();
  const userTableRows = [
    ['User ID', user.id],
    ['Email', user.email],
    ['Last Debt Mail', moment(user.last_mail).format(DATE_FORMAT)],
    [
      'Total Debt',
      <span className={user.totalDebt > 0 ? 'text-danger' : null}>
        <Currency quantity={user.totalDebt || 0} currency="EUR" />
      </span>,
    ],
  ];

  const registrationTableColumns = [
    {
      dataField: 'id',
      text: 'ID',
      hidden: true,
    },
    {
      dataField: 'name',
      text: 'Name',
      sort: true,
    },
    {
      dataField: 'startdate',
      text: 'Date',
      classes: 'd-none d-sm-table-cell',
      headerClasses: 'd-none d-sm-table-cell',
      sort: true,
      formatter: cellContent => moment(cellContent).format(DATE_FORMAT),
    },
    {
      dataField: '_pivot_role',
      text: 'Role',
      classes: 'd-none d-md-table-cell',
      headerClasses: 'd-none d-md-table-cell',
      sort: true,
    },
    {
      dataField: 'debt',
      isDummyField: true,
      text: 'Debt',
      classes: 'text-right text-sm-left',
      headerClasses: 'text-right text-sm-left',
      formatter: (cellContent, row) => (
        <div className="d-flex align-items-center justify-content-center">
          <span
            className={
              row._pivot_price_owed - row._pivot_price_paid > 0
                ? 'text-danger'
                : null
            }
          >
            <Currency
              quantity={row._pivot_price_owed - row._pivot_price_paid || 0}
              currency="EUR"
            />
            <button
              type="button"
              className="btn btn-outline-light btn-sm ml-2 px-2"
              onClick={e => {
                e.stopPropagation();
                dispatch(
                  patchRegistration(row._pivot_id, {
                    price_paid: row._pivot_price_owed,
                  }),
                );
              }}
            >
              €‎
            </button>
          </span>
        </div>
      ),
    },
    {
      dataField: '_pivot_transaction_date',
      text: 'Transaction Date',
      sort: true,
      classes: 'd-none d-lg-table-cell',
      headerClasses: 'd-none d-lg-table-cell',
      formatter: cellContent =>
        cellContent ? moment(cellContent).format(DATE_FORMAT) : null,
    },
  ];

  const defaultSorted = [
    {
      dataField: 'startdate',
      order: 'desc',
    },
  ];

  const forwardToRegistration = {
    /* eslint-disable camelcase */
    onClick: (e, { _pivot_id }) => {
      history.push(`registration/${_pivot_id}`);
    },
    /* eslint-enable camelcase */
  };

  return (
    <div
      id={user.id}
      className="d-flex flex-column flex-xl-row p-2 p-md-3 pd-lg-4"
    >
      <div className="d-flex flex-column p-0 col-md-8 col-lg-6 col-xl-4">
        <h3 className="pr-4 pr-sm-0">
          {user.vorname} {user.name}
        </h3>
        <FlexTable
          key={`userTable_${user.id}`}
          tableName={`userTable_${user.id}`}
          bodyRows={userTableRows}
          striped
        />
      </div>
      <div className="d-flex flex-column mt-5 mt-xl-0 ml-xl-4">
        <div>
          <h3>Registrations</h3>
        </div>
        {user.tournaments.length ? (
          <BootstrapTable
            bootstrap4
            keyField="id"
            data={user.tournaments}
            columns={registrationTableColumns}
            defaultSorted={defaultSorted}
            rowEvents={forwardToRegistration}
            rowClasses="cursorPointer"
            bordered={false}
          />
        ) : (
          <p>{user.vorname} has no registrations yet.</p>
        )}
      </div>
    </div>
  );
};

export default MemberRowCollapse;
