import React, { useState } from 'react';
import './TournamentForm.scss';

const TournamentForm = ({ handleSubmit, ...formProps }) => {
  const date = new Date().toISOString().substr(0, 10);
  const initialFormValues = {
    name: formProps.name || '',
    location: formProps.location || '',
    accommodation: formProps.accommodation || '',
    startDate: formProps.startDate || date,
    endDate: formProps.endDate || date,
    deadline: formProps.deadline || date,
    format: formProps.format || '',
    language: formProps.language || '',
    league: formProps.league || '',
    rankingFactor: formProps.rankingFactor || 0,
    speakerPrice: formProps.speakerPrice || 0,
    judgePrice: formProps.judgePrice || 0,
    teamSpots: formProps.teamSpots || 0,
    judgeSpots: formProps.judgeSpots || 0,
    link: formProps.link || '',
    comment: formProps.comment || '',
  };

  const [formValues, setFormValues] = useState(initialFormValues);

  function handleChange(e) {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  }

  const disableSubmit =
    formValues.name &&
    formValues.startDate &&
    formValues.endDate &&
    formValues.rankingFactor;

  return (
    <form
      onSubmit={() => {
        handleSubmit(formValues);
      }}
      id="tournamentForm"
    >
      <div className="row">
        <div className="col-12 col-md-10 d-flex flex-wrap">
          <div className="form-group px-lg-3">
            <label>
              Name
              <input
                type="name"
                className="form-control"
                value={formValues.name}
                onChange={handleChange}
                id="email"
                name="name"
                autoComplete="name"
                placeholder="Name"
                required
              />
            </label>
          </div>
          <div className="form-group px-lg-3">
            <label>
              Location
              <input
                type="location"
                className="form-control"
                value={formValues.location}
                onChange={handleChange}
                id="location"
                name="location"
                autoComplete="location"
                placeholder="Location"
              />
            </label>
          </div>
          <div className="form-group px-lg-3">
            <label>
              Start Date
              <input
                type="date"
                className="form-control"
                value={formValues.startDate}
                onChange={handleChange}
                id="startDate"
                name="startDate"
                autoComplete="startDate"
                placeholder="Start Date"
                required
              />
            </label>
          </div>
          <div className="form-group px-lg-3">
            <label>
              End Date
              <input
                type="date"
                className="form-control"
                value={formValues.endDate}
                onChange={handleChange}
                id="endDate"
                name="endDate"
                autoComplete="endDate"
                placeholder="End Date"
                required
              />
            </label>
          </div>
          <div className="form-group px-lg-3">
            <label>
              Deadline
              <input
                type="date"
                className="form-control"
                value={formValues.deadline}
                onChange={handleChange}
                id="deadline"
                name="deadline"
                autoComplete="deadline"
                placeholder="Dealine"
              />
            </label>
          </div>
          <div className="form-group px-lg-3">
            <label>
              Format
              <input
                type="text"
                className="form-control"
                value={formValues.format}
                onChange={handleChange}
                id="format"
                name="format"
                autoComplete="format"
                placeholder="Format"
              />
            </label>
          </div>
          <div className="form-group px-lg-3">
            <label>
              Language
              <select
                className="form-control"
                value={formValues.language}
                onChange={handleChange}
                id="language"
                name="language"
              >
                <option value="formValues.de">German</option>
                <option value="formValues.en">English</option>
                <option value="formValues.-">other</option>
              </select>
            </label>
          </div>
          <div className="form-group px-lg-3">
            <label>
              BDU Ranking Factor
              <input
                type="number"
                className="form-control"
                value={formValues.rankingFactor}
                onChange={handleChange}
                id="rankingFactor"
                name="rankingFactor"
                autoComplete="rankingFactor"
                placeholder="BDU Ranking Factor"
              />
            </label>
          </div>
          <div className="form-group px-lg-3">
            <label>
              Accommodation
              <input
                type="text"
                className="form-control"
                id="accommodation"
                name="accommodation"
                autoComplete="accommodation"
                value={formValues.accommodation}
                onChange={handleChange}
                placeholder="Accommodation"
              />
            </label>
          </div>
          <div className="form-group px-lg-3">
            <label>
              League
              <input
                type="text"
                className="form-control"
                value={formValues.league}
                onChange={handleChange}
                id="league"
                name="league"
                autoComplete="league"
                placeholder="League"
              />
            </label>
          </div>
          <div className="form-group px-lg-3">
            <label>
              Price for Speakers in €
              <input
                type="number"
                className="form-control"
                value={formValues.speakerPrice}
                onChange={handleChange}
                id="speakerPrice"
                name="speakerPrice"
                autoComplete="speakerPrice"
                placeholder="Price for Speakers"
              />
            </label>
          </div>
          <div className="form-group px-lg-3">
            <label>
              Price for Judges in €
              <input
                type="number"
                className="form-control"
                value={formValues.judgePrice}
                onChange={handleChange}
                id="judgePrice"
                name="judgePrice"
                autoComplete="judgePrice"
                placeholder="Price for Judges"
              />
            </label>
          </div>
          <div className="form-group px-lg-3">
            <label>
              Team Spots
              <input
                type="number"
                className="form-control"
                value={formValues.teamSpots}
                onChange={handleChange}
                id="teamSpots"
                name="teamSpots"
                autoComplete="teamSpots"
                placeholder="Team Spots"
              />
            </label>
          </div>
          <div className="form-group px-lg-3">
            <label>
              Judges Spots
              <input
                type="number"
                className="form-control"
                value={formValues.judgeSpots}
                onChange={handleChange}
                id="judgeSpots"
                name="judgeSpots"
                autoComplete="judgeSpots"
                placeholder="Judges Spots"
              />
            </label>
          </div>
          <div className="form-group px-lg-3">
            <label>
              Link
              <input
                type="url"
                className="form-control"
                value={formValues.link}
                onChange={handleChange}
                id="link"
                name="link"
                autoComplete="link"
                placeholder="Link"
              />
            </label>
          </div>
          <div className="form-group px-lg-3">
            <label>
              Comment
              <input
                type="text"
                className="form-control"
                value={formValues.comment}
                onChange={handleChange}
                id="comment"
                name="comment"
                autoComplete="comment"
                placeholder="Comment"
              />
            </label>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12 col-md-10">
          <button
            type="submit"
            className="btn btn-lg btn-outline-info ml-3"
            disabled={!disableSubmit}
            style={{ cursor: disableSubmit ? 'pointer' : 'not-allowed' }}
          >
            Submit
          </button>
        </div>
      </div>
    </form>
  );
};

export default TournamentForm;
