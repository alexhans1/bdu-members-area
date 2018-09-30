/* eslint-disable no-return-assign */
import React, { Component } from 'react';

class UserForm extends Component {
  constructor(props) {
    super(props);
    const {
      email,
      firstName,
      lastName,
      gender,
      food,
    } = props;
    this.state = {
      email: email || '',
      password: '',
      confirmPassword: '',
      firstName: firstName || '',
      lastName: lastName || '',
      gender: gender || 'm',
      food: food || '',
      signupPassword: '',
      passwordsMatch: false,
    };

    this.confirmPasswordInput = null;

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    const change = {};
    change[e.target.name] = e.target.value;
    if (e.target.name === 'confirmPassword' || !!(e.target.name === 'password' && this.state.confirmPassword)) {
      change.passwordsMatch = this.state.password === e.target.value || this.state.confirmPassword === e.target.value;
    }
    this.setState(change);
  }

  handleSubmit(e) {
    e.preventDefault();
    const { email, password, confirmPassword, firstName, lastName, gender, food, signupPassword } = this.state;
    if (password !== confirmPassword) {
      return this.confirmPasswordInput.focus();
    }
    return this.props.handleSubmit({ email, password, firstName, lastName, gender, food, signupPassword });
  }

  render() {
    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      gender,
      food,
      signupPassword,
      passwordsMatch,
    } = this.state;

    const { context } = this.props;

    let confirmPasswordClass = 'form-control';
    if (confirmPassword.length > 0) {
      confirmPasswordClass += passwordsMatch ? ' is-valid' : ' is-invalid';
    }

    const isEditContext = context === 'edit';
    const disableSubmit = (
      (passwordsMatch || isEditContext)
      && email
      && firstName
      && lastName
      && (signupPassword || isEditContext)
    );

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" className="form-control" value={email}
                 onChange={this.handleChange} id="email" name="email" autoComplete="email"
                 aria-describedby="emailHelp" placeholder="Enter your email" required />
        </div>
        {isEditContext ? null : (
          <div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" className="form-control" value={password}
                     onChange={this.handleChange} id="password" name="password" autoComplete="password"
                     placeholder="Enter your password" required />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input type="password" className={confirmPasswordClass} value={confirmPassword}
                     ref={input => this.confirmPasswordInput = input}
                     onChange={this.handleChange} id="confirmPassword" name="confirmPassword"
                     autoComplete="confirmPassword" placeholder="Confirm your password" required />
              {(!passwordsMatch && confirmPassword.length > 0) ? (
                <small className="text-danger">Passwords don´t match.</small>
              ) : null}
            </div>
          </div>
        )}
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input type="text" className="form-control" value={firstName}
                 onChange={this.handleChange} id="firstName" name="firstName"
                 autoComplete="given-name" placeholder="First Name" required />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input type="text" className="form-control" value={lastName}
                 onChange={this.handleChange} id="lastName" name="lastName"
                 autoComplete="family-name" placeholder="Last Name" required />
        </div>
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select className="form-control" value={gender}
                  onChange={this.handleChange} id="gender" name="gender" required>
            <option value="f">female</option>
            <option value="m">male</option>
            <option value="-">non-binary</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="food">Food Preference</label>
          <input type="text" className="form-control" id="food" name="food" autoComplete="food"
                 value={food} onChange={this.handleChange}
                 placeholder="Veggie? Vegan? Allergies? Don't like tomatoes?" />
        </div>
        {context === 'edit' ? null : (
          <div className="form-group mt-2">
            <label htmlFor="signupPassword">Signup Password</label>
            <input type="text" className="form-control" value={signupPassword}
                   onChange={this.handleChange} id="signupPassword" name="signupPassword"
                   autoComplete="signupPassword" placeholder="Get password from the BDU board members" required />
          </div>
        )}
        <button type="submit" className="btn btn-lg btn-outline-info" disabled={!disableSubmit}
                style={{ cursor: disableSubmit ? 'pointer' : 'not-allowed' }}>
          {context === 'edit' ? 'Submit' : 'Signup'}
        </button>
      </form>
    );
  }
}

export default UserForm;
