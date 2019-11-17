import React from 'react';
import { alertTypes, BASE_URL } from '../../../constants/applicationConstants';
import Modal from 'react-modal';
import Spinner from '../../Spinner/Spinner';
import triggerAlert from '../../../actions/actionHelpers';

import './CreateWikiLinkModal.scss';

const CreateWikiLinkModal = ({
  isOpen,
  closeModal,
  handleAddedWikiLink,
  isLoading = false,
}) => {
  // recommended for assistive technology support
  Modal.setAppElement('.app');

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
    const body = await response.json();
    if (response.status === 200) {
      triggerAlert(body.message, alertTypes.SUCCESS);
      handleAddedWikiLink();
    } else {
      triggerAlert(body.message, alertTypes.WARNING);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      className="wikiLinks-creator-modal"
      shouldCloseOnOverlayClick
      onRequestClose={closeModal}
    >
      <h2 className="mb-3">Add a New Link to a Document</h2>
      {isLoading && <Spinner />}
      {!isLoading && (
        <form onSubmit={postWikiLink}>
          <div className="wiki-links-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                className="form-control"
                name="title"
                autoComplete="title"
                placeholder="A Short Title"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="topic">Topic</label>
              <input
                type="text"
                className="form-control"
                name="topic"
                autoComplete="topic"
                placeholder="one word topic"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="url">Link</label>
              <input
                type="text"
                className="form-control"
                name="url"
                autoComplete="url"
                placeholder="full link to document"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                rows="4"
                className="form-control"
                name="description"
                autoComplete="description"
                placeholder="Describe purpose and contents of the linked document"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-outline-success mr-3">
            Add Link
          </button>
          <button
            className="btn btn-outline-dark mr-3"
            type="button"
            onClick={closeModal}
          >
            Close
          </button>
        </form>
      )}
    </Modal>
  );
};

export default CreateWikiLinkModal;
