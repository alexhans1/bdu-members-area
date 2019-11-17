/* eslint-disable no-return-assign */
import React, { useState, useRef } from 'react';

const UserForm = ({
  email,
  firstName,
  lastName,
  gender,
  food,
  context,
  handleSubmit,
}) => {
  const [userFormState, setUserFormState] = useState({
    email: email || '',
    password: '',
    confirmPassword: '',
    firstName: firstName || '',
    lastName: lastName || '',
    gender: gender || '-',
    food: food || '',
    signupPassword: '',
  });
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  const confirmPasswordInput = useRef(null);

  function handleChange(e) {
    if (
      e.target.name === 'confirmPassword' ||
      !!(e.target.name === 'password' && userFormState.confirmPassword)
    ) {
      setPasswordsMatch(
        userFormState.password === e.target.value ||
          userFormState.confirmPassword === e.target.value,
      );
    }
    setUserFormState({ ...userFormState, [e.target.name]: e.target.value });
  }

  function _handleSubmit(e) {
    e.preventDefault();
    if (userFormState.password !== userFormState.confirmPassword) {
      confirmPasswordInput.focus();
    } else {
      handleSubmit(userFormState);
    }
  }

  let confirmPasswordClass = 'form-control';
  if (userFormState.confirmPassword.length > 0) {
    confirmPasswordClass += passwordsMatch ? ' is-valid' : ' is-invalid';
  }
  const isEditContext = context === 'edit';
  const enableSubmit =
    (passwordsMatch || isEditContext) &&
    userFormState.email &&
    userFormState.firstName &&
    userFormState.lastName &&
    (userFormState.signupPassword || isEditContext);

  return (
    <form onSubmit={_handleSubmit}>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          className="form-control"
          value={userFormState.email}
          onChange={handleChange}
          id="email"
          name="email"
          autoComplete="email"
          aria-describedby="emailHelp"
          placeholder="Enter your email"
          required
        />
      </div>
      {isEditContext ? null : (
        <div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control"
              value={userFormState.password}
              onChange={handleChange}
              id="password"
              name="password"
              autoComplete="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              className={confirmPasswordClass}
              value={userFormState.confirmPassword}
              ref={confirmPasswordInput}
              onChange={handleChange}
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="confirmPassword"
              placeholder="Confirm your password"
              required
            />
            {!passwordsMatch && userFormState.confirmPassword.length > 0 ? (
              <small className="text-danger">Passwords don´t match.</small>
            ) : null}
          </div>
        </div>
      )}
      <div className="form-group">
        <label htmlFor="firstName">First Name</label>
        <input
          type="text"
          className="form-control"
          value={userFormState.firstName}
          onChange={handleChange}
          id="firstName"
          name="firstName"
          autoComplete="given-name"
          placeholder="First Name"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="lastName">Last Name</label>
        <input
          type="text"
          className="form-control"
          value={userFormState.lastName}
          onChange={handleChange}
          id="lastName"
          name="lastName"
          autoComplete="family-name"
          placeholder="Last Name"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="gender">Gender</label>
        <select
          className="form-control"
          value={userFormState.gender}
          onChange={handleChange}
          id="gender"
          name="gender"
          required
        >
          <option value="f">female</option>
          <option value="m">male</option>
          <option value="-">non-binary</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="food">Food Preference</label>
        <input
          type="text"
          className="form-control"
          id="food"
          name="food"
          autoComplete="food"
          value={userFormState.food}
          onChange={handleChange}
          placeholder="Veggie? Vegan? Allergies? Don't like tomatoes?"
        />
      </div>
      {context === 'edit' ? null : (
        <div className="form-group mt-2">
          <label htmlFor="signupPassword">Signup Password</label>
          <input
            type="text"
            className="form-control"
            value={userFormState.signupPassword}
            onChange={handleChange}
            id="signupPassword"
            name="signupPassword"
            autoComplete="signupPassword"
            placeholder="Get password from the BDU board members"
            required
          />
        </div>
      )}
      <button
        type="submit"
        className="btn btn-lg btn-outline-info"
        disabled={!enableSubmit}
        style={{ cursor: enableSubmit ? 'pointer' : 'not-allowed' }}
      >
        {context === 'edit' ? 'Submit' : 'Signup'}
      </button>
    </form>
  );
};

export default UserForm;
