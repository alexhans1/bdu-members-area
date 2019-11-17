import React, { Component } from 'react';
import { connect } from 'react-redux';
import $ from 'jquery';
import { register } from '../../../../../actions/RegistrationActions';

const mapStateToProps = ({ user }) => ({
  user: user.users.find(({ id }) => user.authenticatedUserId === id),
});
const mapDispatchToProps = { register };

class RegistrationModal extends Component {
  constructor() {
    super();
    this.state = {
      role: 'judge',
      partner1: '-',
      partner2: '-',
      teamName: '',
      comment: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handlePostRegister = this.handlePostRegister.bind(this);
  }

  handleChange(e) {
    const change = {};
    change[e.target.name] = e.target.value;
    this.setState(change);
  }

  handlePostRegister(e) {
    e.preventDefault();
    const { tournament, user, register: _register } = this.props;
    $(`#registrationModal_${tournament.id}`).modal('hide');
    const { role, partner1, partner2, teamName, comment } = this.state;
    const userId = user.id;
    _register({
      tournament,
      userId,
      role,
      comment,
      independent: 0,
      funding: 0,
      partner1,
      partner2,
      teamName,
    });
  }

  render() {
    const { role, partner1, partner2, teamName, comment } = this.state;
    const { tournament, users } = this.props;
    return (
      <div
        className="modal fade text-body"
        id={`registrationModal_${tournament.id}`}
        tabIndex="-1"
        role="dialog"
        aria-labelledby="exampleModalCenterTitle"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <form onSubmit={this.handlePostRegister}>
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalCenterTitle">
                  Register for {tournament.name}
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="roleSelect">Register as</label>
                  <select
                    className="form-control"
                    id="roleSelect"
                    name="role"
                    value={role}
                    onChange={this.handleChange}
                  >
                    <option value="judge">Judge</option>
                    <option value="speaker">Speaker</option>
                  </select>
                </div>
                {role === 'speaker' ? (
                  <div className="form-group d-flex flex-column">
                    <label htmlFor="partner1Select">Teammate</label>
                    <select
                      className="form-control"
                      id="partner1Select"
                      name="partner1"
                      value={partner1}
                      onChange={this.handleChange}
                    >
                      <option value="-">None</option>
                      {users.map(user => (
                        <option key={`partner1List_${user.id}`} value={user.id}>
                          {`${user.firstName} ${user.lastName}`}
                        </option>
                      ))}
                    </select>
                    <small>Don´t have a team partner yet? No problem.</small>
                  </div>
                ) : null}
                {role === 'speaker' &&
                partner1 &&
                partner1 !== '-' &&
                !['BPS', 'BP'].includes(tournament.format) ? (
                  <div className="form-group">
                    <label htmlFor="partner2Select">Teammate 2</label>
                    <select
                      className="form-control"
                      id="partner2Select"
                      name="partner2"
                      value={partner2}
                      onChange={this.handleChange}
                    >
                      <option value="-">None</option>
                      {users.map(user => (
                        <option
                          key={`partner1List_${user.id}`}
                          value={user.id}
                          disabled={user.id === parseInt(partner1, 10)}
                        >
                          {`${user.firstName} ${user.lastName}`}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                {role === 'speaker' ? (
                  <div className="form-group">
                    <label htmlFor="teamName">Team Name</label>
                    <input
                      className="form-control"
                      id="teamName"
                      name="teamName"
                      placeholder="Be funny, creative, critical, ..."
                      value={teamName}
                      onChange={this.handleChange}
                    />
                  </div>
                ) : null}
                <div className="form-group">
                  <label htmlFor="comment">Comment</label>
                  <input
                    className="form-control"
                    id="comment"
                    name="comment"
                    placeholder="Anything you want us to know?"
                    value={comment}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  data-dismiss="modal"
                >
                  Close
                </button>
                <button type="submit" className="btn btn-success">
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RegistrationModal);
