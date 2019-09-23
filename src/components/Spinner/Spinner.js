import React from 'react';
import './Spinner.css';

const Spinner = ({ xl }) => {
  return (
    <div className={`${xl ? 'xl ' : ''}spinner d-flex justify-content-around`}>
      <div className="bounce1" />
      <div className="bounce2" />
      <div className="bounce3" />
    </div>
  );
};

export default Spinner;
