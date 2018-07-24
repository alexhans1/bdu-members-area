import React, { Component } from 'react';
import './Login.css';
import { Link } from 'react-router-dom';
import membersAreaImage from './BDU_memberArea_512.png';
import * as Auth from '../../../actions/AuthenticationActions';

class Login extends Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  handleChange(e) {
    const change = {};
    change[e.target.name] = e.target.value;
    this.setState(change);
  }

  handleLogin(e) {
    e.preventDefault();
    Auth.login(this.state.email, this.state.password);
  }

  render() {
    return (
      <div id="loginPage" className="container-fluid">
        <div className="row d-flex align-items-center justify-content-center py-4">
          <img src={membersAreaImage} width={342} alt="" />
        </div>
        <div className="row d-flex align-items-center justify-content-center py-3">
          <div className="col-lg-4 col-md-5 col-sm-12 login-box p-4">
            <h4><i className="fas fa-sign-in-alt" /> Login</h4>
            <hr />
            <form onSubmit={this.handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" className="form-control" id="email" value={this.state.email}
                       onChange={this.handleChange} name="email"
                       aria-describedby="emailHelp" placeholder="Enter your email" required />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" className="form-control" value={this.state.password}
                       onChange={this.handleChange} name="password"
                       id="password" placeholder="Enter your password" required />
              </div>
              <button type="submit" className="btn btn-lg btn-outline-info">Login</button>
            </form>
            <hr />
            <p>Forgot your password? <Link to="/forgot">Reset Password</Link></p>
            <p>Need an account? <Link to="/signup">Signup</Link></p>
          </div>
        </div>
        <span id="photoCredit" className="d-flex justify-content-end">
          photo credit:&nbsp;<a target="_blank" href="https://www.flickr.com/photos/jaehyunlee/">Jaehyun Lee</a>,&nbsp;
          <a target="_blank" href="https://www.flickr.com/photos/jaehyunlee/33543411320/">"Museum Island"</a>&nbsp;
          is licensed under&nbsp;<a target="_blank" href="https://creativecommons.org/licenses/by/2.0/"> CC BY 2.0</a>
        </span>
      </div>
    );
  }
}

export default Login;
