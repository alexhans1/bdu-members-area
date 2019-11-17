/* eslint-disable camelcase */
import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import Currency from 'react-currency-formatter';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';

import {
  attendanceStatuses,
  successTypes,
} from '../../../constants/applicationConstants';
import './Registration.scss';
import FieldEditor from './FieldEditor';
import { patchRegistration } from '../../../actions/RegistrationActions';

const mapStateToProps = (
  { user },
  {
    match: {
      params: { id: registrationId },
    },
  },
) => {
  const regUser = user.users.find(
    ({ tournaments }) =>
      tournaments &&
      tournaments.find(
        ({ _pivot_id }) => _pivot_id === parseInt(registrationId, 10),
      ),
  );
  return {
    isAdmin: user.authenticatedUserId
      ? user.users.find(({ id }) => user.authenticatedUserId === id)
          .position === 1
      : false,
    authenticatedUserId: user.authenticatedUserId,
    user: regUser,
    userList: user.users,
    tournament: regUser
      ? regUser.tournaments.find(
          ({ _pivot_id }) => _pivot_id === parseInt(registrationId, 10),
        )
      : null,
  };
};

const mapDispatchToProps = {
  patchRegistration,
};

class Registration extends Component {
  constructor(props) {
    super(props);
    this.handleRegUpdate = this.handleRegUpdate.bind(this);
  }

  handleRegUpdate(value, name) {
    if (value === undefined || !name) return;
    const { tournament, patchRegistration: updateReg } = this.props;

    updateReg(tournament._pivot_id, {
      [name]: value,
    });
  }

  render() {
    const {
      user,
      tournament,
      isAdmin,
      authenticatedUserId,
      userList,
      match: {
        params: { id: regId },
      },
    } = this.props;
    if (!user || !tournament)
      return (
        <div className="container-fluid">
          <h2 className="py-4">
            Registration not found. You might not have permission to see this
            registration.
          </h2>
        </div>
      );

    const attendanceStatus =
      Object.keys(attendanceStatuses).find(
        statusName =>
          attendanceStatuses[statusName] === tournament._pivot_attended,
      ) || '';
    const dateFormat = 'DD.MM.YYYY';
    const startDate = tournament.startDate
      ? moment(tournament.startDate).format(dateFormat)
      : '';
    const endDate = tournament.endDate
      ? moment(tournament.endDate).format(dateFormat)
      : '';
    const partner1 = userList.find(
      ({ id }) => id === tournament._pivot_partner1,
    );
    const partner2 = userList.find(
      ({ id }) => id === tournament._pivot_partner2,
    );
    let success = tournament._pivot_attended === 1 ? 'none' : null;
    const successObj = successTypes.find(
      ({ id }) => id === tournament._pivot_success,
    );
    if (successObj) success = successObj.label;

    const registrationTableRows = [
      {
        header: 'User',
        field:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : null,
      },
      {
        header: 'Tournament',
        field: tournament.name,
      },
      {
        header: 'Date',
        field:
          tournament.startDate && tournament.startDate
            ? `${startDate} - ${endDate}`
            : null,
      },
      {
        header: 'Role',
        field: tournament._pivot_role,
        editType: Type.SELECT,
        fieldName: 'role',
        options: [
          { id: 'judge', label: 'judge' },
          { id: 'speaker', label: 'speaker' },
        ],
      },
      {
        header: 'Team Name',
        field: tournament._pivot_teamname,
        editType: Type.TEXT,
        fieldName: 'teamname',
      },
      {
        header: 'Comment',
        field: tournament._pivot_comment,
        editType: Type.TEXT,
        fieldName: 'comment',
      },
      {
        header: 'Independent',
        field: tournament._pivot_is_independent ? 'Yes' : 'No',
        editType: Type.CHECKBOX,
        fieldValue: tournament._pivot_is_independent,
        fieldName: 'is_independent',
      },
      {
        header: 'Funding',
        field: tournament._pivot_funding ? 'Yes' : 'No',
        editType: Type.CHECKBOX,
        fieldValue: tournament._pivot_funding,
        fieldName: 'funding',
      },
      {
        header: 'Costs',
        field:
          tournament._pivot_attended === 1 ? (
            <Currency
              quantity={parseFloat(tournament._pivot_price_owed, 10) || 0}
              currency="EUR"
            />
          ) : null,
        fieldValue: tournament._pivot_price_owed || 0,
        editType: Type.TEXT,
        fieldName: 'price_owed',
        adminOnlyEdit: true,
      },
      {
        header: 'Price paid',
        field:
          tournament._pivot_attended === 1 ? (
            <Currency
              quantity={parseFloat(tournament._pivot_price_paid, 10) || 0}
              currency="EUR"
            />
          ) : null,
        fieldValue: tournament._pivot_price_paid || 0,
        editType: Type.TEXT,
        fieldName: 'price_paid',
        adminOnlyEdit: true,
      },
      {
        header: 'Debt',
        field:
          tournament._pivot_attended === 1 ? (
            <span
              className={
                tournament._pivot_price_owed - tournament._pivot_price_paid > 0
                  ? 'text-danger'
                  : null
              }
            >
              <Currency
                quantity={
                  parseFloat(
                    tournament._pivot_price_owed - tournament._pivot_price_paid,
                    10,
                  ) || 0
                }
                currency="EUR"
              />
            </span>
          ) : null,
      },
      {
        header: 'Status',
        field: attendanceStatus,
        editType: Type.SELECT,
        fieldValue: tournament._pivot_attended,
        fieldName: 'attended',
        options: Object.keys(attendanceStatuses).map(label => ({
          id: attendanceStatuses[label],
          label,
        })),
        adminOnlyEdit: true,
      },
      {
        header: 'Success',
        field: success,
        editType: Type.SELECT,
        fieldValue: tournament._pivot_success,
        fieldName: 'success',
        options: successTypes,
      },
      {
        header: 'Points',
        field:
          tournament._pivot_attended === 1 ? tournament._pivot_points : null,
      },
      {
        header:
          tournament.format.toLowerCase() === 'opd' ? 'Partner 1' : 'Partner',
        field: partner1
          ? `${partner1.firstName} ${partner1.name}`
          : successTypes
              .reduce(
                (acc, { canHavePartner, id }) =>
                  canHavePartner ? [...acc, id] : acc,
                [],
              )
              .includes(tournament._pivot_success)
          ? ''
          : null,
        fieldName: 'partner1',
        fieldValue: tournament._pivot_partner1,
        editType: Type.SELECT,
        options: [
          { id: null, label: '' },
          ...userList.map(({ firstName, name, id }) => ({
            id,
            label: `${firstName} ${name}`,
          })),
        ],
      },
      {
        header: 'Partner 2',
        field:
          tournament.format.toLowerCase() === 'opd'
            ? partner2
              ? `${partner2.firstName} ${partner2.name}`
              : successTypes
                  .reduce(
                    (acc, { canHavePartner, id }) =>
                      canHavePartner ? [...acc, id] : acc,
                    [],
                  )
                  .includes(tournament._pivot_success)
              ? ''
              : null
            : null,
        fieldName: 'partner2',
        fieldValue: tournament._pivot_partner2,
        editType: Type.SELECT,
        options: [
          { id: null, bel: '' },
          ...userList.map(({ firstName, name, id }) => ({
            id,
            label: `${firstName} ${name}`,
          })),
        ],
      },
      {
        header: 'Transaction from',
        field:
          tournament._pivot_attended === 1
            ? tournament._pivot_transaction_from || ''
            : null,
        fieldName: 'transaction_from',
        fieldValue: tournament.transaction_from,
        editType: Type.TEXT,
        adminOnly: true,
        adminOnlyEdit: true,
      },
      {
        header: 'Transaction date',
        field:
          tournament._pivot_attended === 1
            ? tournament._pivot_transaction_date || ''
            : null,
        fieldName: 'transaction_date',
        fieldValue: tournament.transaction_date,
        editType: Type.TEXT,
        adminOnly: true,
        adminOnlyEdit: true,
      },
    ].filter(
      ({ field, adminOnly }) => field !== null && (!adminOnly || isAdmin),
    );

    return (
      <div id="registration" className="container page-content">
        {user && user.tournaments && (
          <div className="row">
            <div className="col-12 col-md-9 col-lg-7 col-xl-6 offset-md-1">
              <div className="d-flex align-items-center">
                <h2 className="py-4 mr-4">
                  Registration
                  {regId}
                </h2>
                {(isAdmin ||
                  authenticatedUserId === tournament._pivot_user_id) && (
                  <button
                    className="btn btn-outline-danger"
                    type="button"
                    disabled={
                      tournament._pivot_attended === attendanceStatuses.Went
                    }
                  >
                    Delete
                  </button>
                )}
              </div>
              <BootstrapTable
                bootstrap4
                keyField="id"
                data={registrationTableRows.map((row, i) => ({
                  id: i,
                  ...row,
                }))}
                columns={[
                  {
                    dataField: 'header',
                    text: '',
                    style: { fontWeight: 'bold' },
                    editable: false,
                  },
                  {
                    dataField: 'field',
                    text: '',
                    editorRenderer: (
                      editorProps,
                      value,
                      { editType, options, fieldName, fieldValue },
                    ) => {
                      if (!editType) return null;
                      return (
                        <FieldEditor
                          fieldName={fieldName}
                          fieldValue={fieldValue}
                          type={editType}
                          value={
                            value.props && value.props.quantity
                              ? value.props.quantity
                              : value
                          }
                          options={options}
                          handleChange={this.handleRegUpdate}
                        />
                      );
                    },
                  },
                ]}
                cellEdit={cellEditFactory({
                  mode: 'click',
                  blurToSave: true,
                  nonEditableRows: () =>
                    registrationTableRows.reduce(
                      (nonEditRowIds, { adminOnlyEdit, editType }, i) => {
                        // check if the current user can edit this registration at all
                        if (!isAdmin && authenticatedUserId !== user.id)
                          return [...nonEditRowIds, i];
                        if (!isAdmin && adminOnlyEdit)
                          return [...nonEditRowIds, i];
                        if (!editType) return [...nonEditRowIds, i];
                        return nonEditRowIds;
                      },
                      [],
                    ),
                })}
                bordered={false}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Registration);
