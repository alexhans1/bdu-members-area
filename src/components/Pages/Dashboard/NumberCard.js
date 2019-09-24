import React from 'react';
import PropTypes from 'prop-types';
import { ArrowUpRight, ArrowDownRight } from 'react-feather';

const NumberCard = ({ title, number, percentageChange }) => {
  if (percentageChange) {
    percentageChange = Math.round((percentageChange - 1) * 100);
  }
  return (
    <div className="box">
      <small className="number-card-title">{title}</small>
      <span className="d-flex justify-content-center align-items-center">
        <b className="number">{number}</b>
        {percentageChange && (
          <b
            className={`ml-2 ${
              percentageChange > 0 ? 'text-success' : 'text-danger'
            }`}
          >
            {percentageChange > 0 && '+'}
            {percentageChange}%
            {percentageChange > 0 ? (
              <ArrowUpRight className="ml-1" />
            ) : (
              <ArrowDownRight className="ml-1" />
            )}
          </b>
        )}
      </span>
    </div>
  );
};

NumberCard.propTypes = {
  title: PropTypes.string.isRequired,
  number: PropTypes.number.isRequired,
  percentageChange: PropTypes.number,
};

NumberCard.defaultProps = {
  percentageChange: undefined,
};

export default NumberCard;
