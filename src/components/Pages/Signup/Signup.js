import React, { Component } from 'react';
import './Signup.css';
import { Link } from 'react-router-dom';

class Signup extends Component {
  render() {
    return (
      <div className="d-flex">
        <div id="sideImage" className="col-5 d-none d-md-flex align-items-center justify-content-center">
          <h1 className="text-white text-center">Signup and Register for Tournaments with the BDU</h1>
        </div>
        <div className="col-sm-12 col-md-7 py-3 px-5">
          <form>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" className="form-control" id="email"
                     aria-describedby="emailHelp" placeholder="Enter your email" required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" className="form-control"
                     id="password" placeholder="Enter your password" required />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input type="password" className="form-control"
                     id="confirmPassword" placeholder="Confirm your password" required />
            </div>
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input type="text" className="form-control" id="firstName" placeholder="First Name" required />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input type="text" className="form-control" id="lastName" placeholder="Last Name" required />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select className="form-control" id="gender" required>
                <option value="f">female</option>
                <option value="m">male</option>
                <option value="-">non-binary</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="food">Food Preference</label>
              <input type="text" className="form-control" id="food"
                     placeholder="Veggie? Vegan? Allergies? Don't like tomatoes?" required />
            </div>
            <div className="form-group mt-2">
              <label htmlFor="signupPassword">Signup Password</label>
              <input type="text" className="form-control"
                     id="signupPassword" placeholder="Get password from the BDU board members" required />
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
