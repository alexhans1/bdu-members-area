import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UserForm from '../UserForm';
import './Profile.scss';
import profileImageDefault from '../../../../images/bdu_quad.png';
import { updateUser } from '../../../../actions/UserActions';

const Profile = () => {
  const { id, email, vorname, name, gender, food, image } = useSelector(
    ({ user }) =>
      user.users.find(({ id: _id }) => user.authenticatedUserId === _id),
  );

  const dispatch = useDispatch();
  const handleUserUpdate = ({
    email: _email,
    firstName,
    lastName,
    _gender,
    _food,
  }) => {
    dispatch(
      updateUser({
        userId: id,
        email: _email,
        firstName,
        lastName,
        gender: _gender,
        food: _food,
      }),
    );
  };

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
        handleSubmit={handleUserUpdate}
        email={email}
        firstName={vorname}
        lastName={name}
        gender={gender}
        food={food}
      />
    </div>
  );
};

export default Profile;
