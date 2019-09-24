import React from 'react';
import { useDispatch } from 'react-redux';
import { alertTypes, BASE_URL } from '../../../constants/applicationConstants';
import { ADD_BUG } from '../../../constants/action-types';
import triggerAlert from '../../../actions/actionHelpers';

const BugReportForm = () => {
  const dispatch = useDispatch();

  async function postBug(e) {
    e.preventDefault();
    const description = e.target[0].value;
    if (!description) return;
    const response = await fetch(`${BASE_URL}/bugs`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Method': 'POST',
      },
      body: JSON.stringify({
        type: '-',
        description,
      }),
    });
    if (response.status === 200) {
      const { bug: newBug } = await response.json();
      if (newBug)
        dispatch({
          type: ADD_BUG,
          payload: { newBug },
        });
    } else {
      const { message } = await response.json();
      triggerAlert(message, alertTypes.WARNING);
    }
  }

  return (
    <div className="col-12 col-md-8 col-lg-7 col-xl-5 px-0 pb-4">
      <h2>Report an issue</h2>
      <form onSubmit={postBug}>
        <textarea
          className="form-control my-2"
          placeholder="Describe the issue you found"
          rows="10"
        />
        <button type="submit" className="btn btn-outline-info">
          Report
        </button>
      </form>
    </div>
  );
};

export default BugReportForm;
