import React from 'react';
import { alertTypes, BASE_URL } from '../../../constants/applicationConstants';
import triggerAlert from '../../../actions/actionHelpers';

const CreateWikiLinkForm = () => {
  // function on form submit
  const postWikiLink = async event => {
    event.preventDefault();

    // get data html from the form
    const formData = new FormData(event.target);

    // convert to JSON
    const jsonData = JSON.stringify(Object.fromEntries(formData));

    // API call and respnonse handling
    const response = await fetch(`${BASE_URL}/wikiLinks`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Method': 'POST',
      },
      body: jsonData,
    });
    triggerAlert(
      response.message,
      response.status === 200 ? alertTypes.SUCCESS : alertTypes.WARNING,
    );
  };

  return (
    <div className="col-12 col-md-8 col-lg-7 col-xl-5 px-0 pb-4">
      <h2>Add Link to Document</h2>
      <form onSubmit={postWikiLink}>
        <div className="row">
          <div className="col-12 col-md-10 d-flex flex-wrap">
            <div className="form-group px-lg-3">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                className="form-control"
                name="title"
                autoComplete="title"
                placeholder="Title"
                required
              />
            </div>
            <div className="form-group px-lg-3">
              <label htmlFor="topic">Topic</label>
              <input
                type="text"
                className="form-control"
                name="topic"
                autoComplete="topic"
                placeholder="Topic"
                required
              />
            </div>
            <div className="form-group px-lg-3">
              <label htmlFor="url">Link</label>
              <input
                type="url"
                className="form-control"
                name="url"
                autoComplete="url"
                placeholder="The Link"
                required
              />
            </div>
            <div className="form-group px-lg-3">
              <label htmlFor="description">Description</label>
              <textarea
                rows="5"
                className="form-control"
                name="description"
                autoComplete="description"
                placeholder="Description"
                required
              />
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-outline-info">
          Add Link
        </button>
      </form>
    </div>
  );
};

export default CreateWikiLinkForm;
