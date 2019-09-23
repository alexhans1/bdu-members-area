/* eslint-disable no-return-assign */
import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import UserForm from '../UserForm';
import { signup } from '../../../../actions/AuthActions';
import './Signup.scss';

const Signup = () => {
  const dispatch = useDispatch();

  function handleSignup(registration) {
    dispatch(signup(registration));
  }

  return (
    <div id="signupContainer" className="d-flex">
      <div
        id="sideImage"
        className="col-5 d-none d-md-flex align-items-center justify-content-center"
      >
        <h1 className="text-white text-center">
          Signup and Register for Tournaments with the BDU
        </h1>
      </div>
      <div className="d-flex justify-content-center row w-100 align-items-center m-0">
        <div className="col-11 col-sm-10 col-md-9 col-lg-8 col-xl-6 p-4">
          <UserForm handleSubmit={handleSignup} />
          <hr />
          <span>
            Already have an account? <Link to="/login">Login</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
