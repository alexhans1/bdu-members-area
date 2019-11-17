import React from 'react';
import PropTypes from 'prop-types';
import { ArrowUpRight, ArrowDownRight } from 'react-feather';

const NumberCard = ({ title, number, percentageChange }) => {
  const roundedPercentageChange = percentageChange
    ? Math.round((percentageChange - 1) * 100)
    : null;
  return (
    <div className="box">
      <small className="number-card-title">{title}</small>
      <span className="d-flex justify-content-center align-items-center">
        <b className="number">{number}</b>
        {roundedPercentageChange && (
          <b
            className={`ml-2 ${
              roundedPercentageChange > 0 ? 'text-success' : 'text-danger'
            }`}
          >
            {roundedPercentageChange > 0 && '+'}
            {roundedPercentageChange}%
            {roundedPercentageChange > 0 ? (
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
