import React, { Component } from 'react';
import './Signup.css';
import { Link } from 'react-router-dom';
import AuthenticationStore from '../../../stores/AuthenticationStore';
import * as Auth from '../../../actions/AuthenticationActions';

class Signup extends Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      gender: 'm',
      food: '',
      signupPassword: '',
      passwordsMatch: false,
    };

    this.confirmPasswordInput = null;

    this.handleAuthChange = this.handleAuthChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSignup = this.handleSignup.bind(this);
  }

  componentWillMount() {
    AuthenticationStore.on('authChange', this.handleAuthChange);
  }

  componentWillUnmount() {
    AuthenticationStore.removeListener('authChange', this.handleAuthChange);
  }

  handleAuthChange() {
    if (AuthenticationStore.getAuthenticationStatus()) {
      this.props.history.push('/');
    }
  }

  handleChange(e) {
    const change = {};
    change[e.target.name] = e.target.value;
    if (e.target.name === 'confirmPassword') change.passwordsMatch = this.state.password === e.target.value;
    this.setState(change);
  }

  handleSignup(e) {
    e.preventDefault();
    if (this.state.password !== this.state.confirmPassword) {
      return this.confirmPasswordInput.focus();
    }
    const { email, password, firstName, lastName, gender, food, signupPassword } = this.state;
    return Auth.signup(email, password, firstName, lastName, gender, food, signupPassword);
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

    let confirmPasswordClass = 'form-control';
    if (confirmPassword.length > 0) {
      confirmPasswordClass += passwordsMatch ? ' is-valid' : ' is-invalid';
    }

    return (
      <div className="d-flex">
        <div id="sideImage" className="col-5 d-none d-md-flex align-items-center justify-content-center">
          <h1 className="text-white text-center">Signup and Register for Tournaments with the BDU</h1>
        </div>
        <div className="col-sm-12 col-md-7 py-3 px-5">
          <form onSubmit={this.handleSignup}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" className="form-control" value={email}
                     onChange={this.handleChange} id="email" name="email" autoComplete="email"
                     aria-describedby="emailHelp" placeholder="Enter your email" required />
            </div>
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
                     placeholder="Veggie? Vegan? Allergies? Don't like tomatoes?" required />
            </div>
            <div className="form-group mt-2">
              <label htmlFor="signupPassword">Signup Password</label>
              <input type="text" className="form-control" value={signupPassword}
                     onChange={this.handleChange} id="signupPassword" name="signupPassword"
                     autoComplete="signupPassword" placeholder="Get password from the BDU board members" required />
            </div>
            <button type="submit" className="btn btn-lg btn-outline-info">Signup</button>
          </form>
          <hr />
          <span>
            Already have an account? <Link to="/login">Login</Link>
          </span>
        </div>
      </div>
    );
  }
}

export default Signup;
