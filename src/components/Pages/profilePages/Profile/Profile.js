import React, { Component } from 'react';
import { connect } from 'react-redux';
import UserForm from '../UserForm';
import './Profile.css';
import profileImageDefault from '../../../../images/bdu_quad.png';
import * as UserActions from '../../../../actions/UserActions';

const mapStateToProps = ({
  user,
}) => ({
  authenticatedUser: user.authenticatedUser,
});

class Profile extends Component {
  static handleUserUpdate(userId, email, firstName, lastName, gender, food) {
    return UserActions.updateUser(userId, email, firstName, lastName, gender, food);
  }

  render() {
    const { email, vorname, name, gender, food, image } = this.props.authenticatedUser;

    return (
      <div className="container px-5">
        <div className="d-flex align-items-center py-4">
          <img id="profileImage" src={image || profileImageDefault} alt="" className="mr-3 cursorPointer" />
          <h2>Edit your profile information</h2>
        </div>
        <UserForm context="edit"
                  handleSubmit={Profile.handleUserUpdate}
                  email={email}
                  firstName={vorname}
                  lastName={name}
                  gender={gender}
                  food={food} />
      </div>
    );
  }
}

export default connect(mapStateToProps)(Profile);
