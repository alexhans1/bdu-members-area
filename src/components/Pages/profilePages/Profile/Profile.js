import React, { Component } from 'react';
import { connect } from 'react-redux';
import UserForm from '../UserForm';
import './Profile.css';
import profileImageDefault from '../../../../images/bdu_quad.png';
import { updateUser } from '../../../../actions/UserActions';

const mapStateToProps = ({ user }) => ({
  authenticatedUser: user.users.find(
    ({ id }) => user.authenticatedUserId === id,
  ),
});
const mapDispatchToProps = { updateUser };

class Profile extends Component {
  constructor() {
    super();

    this.handleUserUpdate = this.handleUserUpdate.bind(this);
  }

  handleUserUpdate({ email, firstName, lastName, gender, food }) {
    this.props.updateUser({
      userId: this.props.authenticatedUser.id,
      email,
      firstName,
      lastName,
      gender,
      food,
    });
  }

  render() {
    const {
      email,
      vorname,
      name,
      gender,
      food,
      image,
    } = this.props.authenticatedUser;

    return (
      <div className="container page-content px-5">
        <div className="d-flex align-items-center py-4">
          <img
            id="profileImage"
            src={image || profileImageDefault}
            alt=""
            className="mr-3 cursorPointer"
          />
          <h2>Edit your profile information</h2>
        </div>
        <UserForm
          context="edit"
          handleSubmit={this.handleUserUpdate}
          email={email}
          firstName={vorname}
          lastName={name}
          gender={gender}
          food={food}
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Profile);
