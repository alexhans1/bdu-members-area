import React, { Component } from 'react';
import './Spinner.css';

class Spinner extends Component {
  render() {
    const { xl } = this.props;
    return (
      <div className={`${xl ? 'xl ' : ''}spinner d-flex justify-content-around`}>
        <div className="bounce1" />
        <div className="bounce2" />
        <div className="bounce3" />
      </div>
    );
  }
}

export default Spinner;
