import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.scss';
import { useDispatch } from 'react-redux';
import { LogIn } from 'react-feather';

import membersAreaImage from './BDU_memberArea_512.png';
import { login } from '../../../actions/AuthActions';

const Login = () => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleLogin(e) {
    e.preventDefault();
    dispatch(login(email, password));
  }

  return (
    <div id="loginPage" className="container-fluid d-flex flex-column">
      <div className="row d-flex align-items-center justify-content-center py-4">
        <img id="loginMembersAreaImage" src={membersAreaImage} alt="" />
      </div>
      <div className="row d-flex align-items-center justify-content-center py-3">
        <div className="col-lg-4 col-md-5 col-sm-7 col-11 login-box p-4">
          <h4>
            Login <LogIn />
          </h4>
          <hr />
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                onChange={e => {
                  setEmail(e.target.value);
                }}
                name="email"
                autoComplete="username email"
                aria-describedby="emailHelp"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                }}
                name="password"
                autoComplete="current-password"
                id="password"
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" className="btn btn-lg btn-outline-info">
              Login
            </button>
          </form>
          <hr />
          <p>
            Forgot your password? <Link to="/forgot">Reset Password</Link>
          </p>
          <p>
            Need an account? <Link to="/signup">Signup</Link>
          </p>
        </div>
      </div>
      <div
        id="photoCredit"
        className="d-flex justify-content-end flex-wrap mt-auto"
      >
        photo credit:&nbsp;
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.flickr.com/photos/jaehyunlee/"
        >
          Jaehyun Lee
        </a>
        ,&nbsp;
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.flickr.com/photos/jaehyunlee/33543411320/"
        >
          ´´Museum Island´´
        </a>
        &nbsp;is licensed under&nbsp;
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://creativecommons.org/licenses/by/2.0/"
        >
          {' '}
          CC BY 2.0
        </a>
      </div>
    </div>
  );
};

export default Login;
