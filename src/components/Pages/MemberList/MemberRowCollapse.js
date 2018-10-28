/* eslint-disable camelcase */
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import Currency from 'react-currency-formatter';
import moment from 'moment/moment';
import FlexTable from '../../FlexTable/FlexTable';
import { DATE_FORMAT } from '../../../constants/applicationConstants';

export default class MemberRowCollapse extends Component {
  constructor() {
    super();

    this.forwardToRegistration = this.forwardToRegistration.bind(this);
  }

  forwardToRegistration(rowIndex) {
    const { user } = this.props;
    const registrationId = user.tournaments[rowIndex]._pivot_id;
    this.props.history.push(`/registration/${registrationId}`);
  }

  render() {
    const { user } = this.props;
    const userTableRows = [
      ['ID', user.id],
      ['Email', user.email],
      ['Last Debt Mail', moment(user.last_mail).format(DATE_FORMAT)],
      ['Total Debt', (
        <span className={user.totalDebt > 0 ? 'text-danger' : null}>
          <Currency quantity={user.totalDebt || 0} currency="EUR" />
        </span>
      )],
    ];

    const registrationTableColumns = [{
      dataField: 'id',
      text: 'ID',
      hidden: true,
    }, {
      dataField: 'name',
      text: 'Name',
      sort: true,
    }, {
      dataField: 'startdate',
      text: 'Date',
      classes: 'd-none d-sm-table-cell',
      headerClasses: 'd-none d-sm-table-cell',
      sort: true,
      formatter: (cellContent, row) => moment(row.startdate).format(DATE_FORMAT),
    }, {
      dataField: '_pivot_role',
      text: 'Role',
      classes: 'd-none d-md-table-cell',
      headerClasses: 'd-none d-md-table-cell',
      sort: true,
    }, {
      dataField: 'debt',
      isDummyField: true,
      text: 'Debt',
      classes: 'text-right text-sm-left',
      formatter: (cellContent, row) => (
        <span className={(row._pivot_price_owed - row._pivot_price_paid) > 0 ? 'text-danger' : null}>
          <Currency quantity={row._pivot_price_owed - row._pivot_price_paid || 0} currency="EUR" />
        </span>
      ),
    }, {
      dataField: '_pivot_transaction_date',
      text: 'Transaction Date',
      sort: true,
      classes: 'd-none d-lg-table-cell',
      headerClasses: 'd-none d-lg-table-cell',
      formatter: (cellContent, row) => (
        row._pivot_transaction_date ? moment(row._pivot_transaction_date).format(DATE_FORMAT) : null
      ),
    }];

    const defaultSorted = [{
      dataField: 'startdate',
      order: 'desc',
    }];

    const rowEvents = {
      onClick: (e, { _pivot_id }) => {
        this.props.history.push(`registration/${_pivot_id}`);
      },
    };

    return (
      <div className="d-flex flex-column flex-xl-row p-2 p-md-3 pd-lg-4">
        <div className="d-flex flex-column p-0 col-md-8 col-lg-6 col-xl-4">
          <h3 className="pr-4 pr-sm-0">{user.vorname} {user.name}</h3>
          <FlexTable key={`userTable_${user.id}`} tableName={`userTable_${user.id}`}
                     bodyRows={userTableRows} striped />
        </div>
        <div className="d-flex flex-column mt-5 mt-xl-0 ml-xl-4">
          <div>
            <h3>Registrations</h3>
          </div>
          {user.tournaments.length ? (
            <BootstrapTable
              bootstrap4
              hover
              keyField="id"
              data={user.tournaments}
              columns={registrationTableColumns}
              defaultSorted={defaultSorted}
              rowEvents={rowEvents}
              rowClasses="cursorPointer"
              bordered={false} />
          ) : (
            <p>{user.vorname } has no registrations yet.</p>
          )}
        </div>
      </div>
    );
  }
}
