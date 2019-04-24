/* eslint-disable camelcase */
import React, { Component } from 'react';
import moment from 'moment/moment';
import { confirmAlert } from 'react-confirm-alert';
import Currency from 'react-currency-formatter';
import BootstrapTable from 'react-bootstrap-table-next';
import { connect } from 'react-redux';
import { attendanceStatuses, DATE_FORMAT } from '../../../constants/applicationConstants';
import { deleteRegistration } from '../../../actions/RegistrationActions';

const mapDispatchToProps = { deleteRegistration };

class TournamentList extends Component {
  constructor() {
    super();

    this.actionRefs = React.createRef();
    this.deleteRegistration = this.deleteRegistration.bind(this);
  }

  deleteRegistration(registrationId) {
    confirmAlert({
      title: 'Confirm',
      message: 'Are you sure you want to delete this registration?',
      buttons: [
        {
          label: 'Yes',
          class: 'btn btn-success',
          onClick: () => this.props.deleteRegistration(registrationId),
        },
        {
          label: 'No',
          onClick: () => {},
        },
      ],
    });
  }

  render() {
    const { tournaments } = this.props;

    const tournamentTableColumns = [
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
        text: 'Date',
        isDummyField: true,
        sort: true,
        formatter: (cellContent, row) => (
          <span>
            {moment(row.startdate).format(DATE_FORMAT)}
            <br />
            {moment(row.enddate).format(DATE_FORMAT)}
          </span>
        ),
      },
      {
        dataField: '_pivot_role',
        text: 'Role',
        classes: 'd-none d-md-table-cell',
        headerClasses: 'd-none d-md-table-cell',
        sort: true,
      },
      {
        dataField: '_pivot_price_paid',
        text: 'Debt',
        isDummyField: true,
        sort: true,
        formatter: (cellContent, row) => (
          <span
            className={row._pivot_price_owed - row._pivot_price_paid > 0 ? 'text-danger' : null}
          >
            <Currency
              quantity={row._pivot_price_owed - row._pivot_price_paid || 0}
              currency="EUR"
            />
          </span>
        ),
      },
      {
        dataField: '_pivot_attended',
        text: 'Status',
        sort: true,
        classes: 'd-none d-lg-table-cell',
        headerClasses: 'd-none d-lg-table-cell',
        formatter: cellContent =>
          attendanceStatuses.find(statusObj => statusObj.id === cellContent).label,
      },
      {
        dataField: '_pivot_points',
        text: 'Success',
        sort: true,
        classes: 'd-none d-lg-table-cell',
        headerClasses: 'd-none d-lg-table-cell',
      },
      {
        dataField: 'actions',
        text: '',
        isDummyField: true,
        formatter: (cellContent, row) => (
          <div
            ref={this.actionRefs}
            className="d-flex flex-wrap justify-content-center align-items-center"
          >
            <i className="far fa-edit text-info" />
            <i
              className="far fa-trash-alt text-danger m-1 cursorPointer"
              role="button"
              onClick={e => {
                this.deleteRegistration(row._pivot_id);
                e.stopPropagation();
              }}
            />
          </div>
        ),
      },
    ];

    return (
      <BootstrapTable
        bootstrap4
        hover
        keyField="id"
        data={tournaments}
        columns={tournamentTableColumns}
        defaultSorted={[
          {
            dataField: 'startdate',
            order: 'desc',
          },
        ]}
        rowEvents={{
          onClick: (e, { _pivot_id }) => {
            console.log('e:', e);
            console.log('this.actionRefs:', this.actionRefs);
            this.props.history.push(`registration/${_pivot_id}`);
          },
        }}
        rowClasses="cursorPointer"
        bordered={false}
      />
    );
  }
}

export default connect(
  null,
  mapDispatchToProps,
)(TournamentList);
