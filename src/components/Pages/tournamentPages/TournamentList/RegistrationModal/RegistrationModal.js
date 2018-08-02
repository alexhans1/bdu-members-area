import React, { Component } from 'react';
import RegistrationStore from '../../../../../stores/RegistrationStore';
import * as RegistrationActions from '../../../../../actions/RegistrationActions';

class RegistrationModal extends Component {
  constructor() {
    super();
    this.state = {
      role: 'judge',
      partner1: '-',
      partner2: '-',
      teamName: '',
    };

    this.handleRegistrationChange = this.handleRegistrationChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handlePostRegister = this.handlePostRegister.bind(this);
  }

  componentWillMount() {
    RegistrationStore.on('registrationChange', this.handleRegistrationChange);
  }

  componentWillUnmount() {
    RegistrationStore.removeListener('registrationChange', this.handleRegistrationChange);
  }

  handleRegistrationChange() {
  }

  handleChange(e) {
    const change = {};
    change[e.target.name] = e.target.value;
    this.setState(change);
  }

  handlePostRegister() {
    console.log(123, this.props.tournament);
  }

  render() {
    const { role, partner1, partner2, teamName } = this.state;
    const { tournament, users } = this.props;
    return (
      <div className="modal fade text-body" id={`registrationModal_${tournament.id}`} tabIndex="-1" role="dialog"
           aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalCenterTitle">Register for {tournament.name}</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="roleSelect">Register as</label>
                <select className="form-control" id="roleSelect" name="role" value={role} onChange={this.handleChange}>
                  <option value="judge">Judge</option>
                  <option value="speaker">Speaker</option>
                </select>
              </div>
              {role === 'speaker' ? (
                <div className="form-group">
                  <label htmlFor="partner1Select">Teammate</label>
                  <p>Don't have a team partner yet? No problem.</p>
                  <select className="form-control" id="partner1Select" name="partner1"
                          value={partner1} onChange={this.handleChange}>
                    <option value="-">None</option>
                    {users.map(user => (
                      <option key={`partner1List_${user.id}`} value={user.id}>{`${user.vorname} ${user.name}`}</option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" data-dismiss="modal">Close</button>
              <button type="button" className="btn btn-success" onClick={this.handlePostRegister}>Register</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default RegistrationModal;
