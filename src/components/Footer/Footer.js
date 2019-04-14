import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

class Footer extends Component {
  render() {
    return (
      <div id="footer" className="d-flex justify-content-around align-items-center py-2">
        <span>© Berlin Debating Union e.V., {new Date().getFullYear()}</span>
        <Link to="/bug">Feedback / Bugs</Link>
      </div>
    );
  }
}

export default Footer;
