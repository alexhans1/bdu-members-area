import React, { Component } from 'react';
import './Spinner.css';

class Spinner extends Component {
  render() {
    return (
      <div id="spinnerContainer" className="d-flex align-items-center justify-content-center">
        <div className="spinner d-flex justify-content-around">
          <div className="bounce1" />
          <div className="bounce2" />
          <div className="bounce3" />
        </div>
      </div>
    );
  }
}

export default Spinner;
