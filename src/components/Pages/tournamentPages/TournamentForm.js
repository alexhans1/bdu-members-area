import React, { Component } from 'react';
import './TournamentForm.css';

class TournamentForm extends Component {
  constructor(props) {
    super(props);
    const { name, location, accommodation, startDate, endDate, deadline, format, language, league,
      rankingFactor, speakerPrice, judgePrice, teamSpots, judgeSpots, link, comment } = props;
    const date = new Date().toISOString().substr(0, 10);
    this.state = {
      name: name || '',
      location: location || '',
      accommodation: accommodation || '',
      startDate: startDate || date,
      endDate: endDate || date,
      deadline: deadline || date,
      format: format || '',
      language: language || '',
      league: league || '',
      rankingFactor: rankingFactor || 0,
      speakerPrice: speakerPrice || 0,
      judgePrice: judgePrice || 0,
      teamSpots: teamSpots || 0,
      judgeSpots: judgeSpots || 0,
      link: link || '',
      comment: comment || '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    const change = {};
    change[e.target.name] = e.target.value;
    if (e.target.name === 'confirmPassword' || !!(e.target.name === 'password' && this.state.confirmPassword)) {
      change.passwordsMatch = this.state.password === e.target.value || this.state.confirmPassword === e.target.value;
    }
    this.setState(change);
  }

  handleSubmit(e) {
    e.preventDefault();
    const { name, location, accommodation, startDate, endDate, deadline, format, language, league,
      rankingFactor, speakerPrice, judgePrice, teamSpots, judgeSpots, link, comment } = this.state;
    return this.props.handleSubmit({ name,
      location,
      accommodation,
      startDate,
      endDate,
      deadline,
      format,
      language,
      league,
      rankingFactor,
      speakerPrice,
      judgePrice,
      teamSpots,
      judgeSpots,
      link,
      comment,
    });
  }

  render() {
    const { name, location, accommodation, startDate, endDate, deadline, format, language, league,
      rankingFactor, speakerPrice, judgePrice, teamSpots, judgeSpots, link, comment } = this.state;

    const disableSubmit = (
      name
      && startDate
      && endDate
      && rankingFactor
    );

    return (
      <form onSubmit={this.handleSubmit} id="tournamentForm" className="d-flex flex-wrap">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="name" className="form-control" value={name}
                 onChange={this.handleChange} id="email" name="name" autoComplete="name"
                 placeholder="Name" required />
        </div>
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input type="location" className="form-control" value={location}
                 onChange={this.handleChange} id="location" name="location" autoComplete="location"
                 placeholder="Location" />
        </div>
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input type="date" className="form-control" value={startDate}
                 onChange={this.handleChange} id="startDate" name="startDate"
                 autoComplete="startDate" placeholder="Start Date" required />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input type="date" className="form-control" value={endDate}
                 onChange={this.handleChange} id="endDate" name="endDate"
                 autoComplete="endDate" placeholder="End Date" required />
        </div>
        <div className="form-group">
          <label htmlFor="deadline">Dealine</label>
          <input type="date" className="form-control" value={deadline}
                 onChange={this.handleChange} id="deadline" name="deadline"
                 autoComplete="deadline" placeholder="Dealine" />
        </div>
        <div className="form-group">
          <label htmlFor="format">Format</label>
          <input type="text" className="form-control" value={format}
                 onChange={this.handleChange} id="format" name="format"
                 autoComplete="format" placeholder="Format" />
        </div>
        <div className="form-group">
          <label htmlFor="language">Language</label>
          <select className="form-control" value={language}
                  onChange={this.handleChange} id="language" name="language">
            <option value="de">German</option>
            <option value="en">English</option>
            <option value="-">other</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="rankingFactor">BDU Ranking Factor</label>
          <input type="number" className="form-control" value={rankingFactor}
                 onChange={this.handleChange} id="rankingFactor" name="rankingFactor"
                 autoComplete="rankingFactor" placeholder="BDU Ranking Factor" />
        </div>
        <div className="form-group">
          <label htmlFor="accommodation">Accommodation</label>
          <input type="text" className="form-control" id="accommodation"
                 name="accommodation" autoComplete="accommodation"
                 value={accommodation} onChange={this.handleChange}
                 placeholder="Accommodation" />
        </div>
        <div className="form-group">
          <label htmlFor="league">League</label>
          <input type="text" className="form-control" value={league}
                 onChange={this.handleChange} id="league" name="league"
                 autoComplete="league" placeholder="League" />
        </div>
        <div className="form-group">
          <label htmlFor="speakerPrice">Price for Speakers in €</label>
          <input type="number" className="form-control" value={speakerPrice}
                 onChange={this.handleChange} id="speakerPrice" name="speakerPrice"
                 autoComplete="speakerPrice" placeholder="Price for Speakers" />
        </div>
        <div className="form-group">
          <label htmlFor="judgePrice">Price for Judges in €</label>
          <input type="number" className="form-control" value={judgePrice}
                 onChange={this.handleChange} id="judgePrice" name="judgePrice"
                 autoComplete="judgePrice" placeholder="Price for Judges" />
        </div>
        <div className="form-group">
          <label htmlFor="teamSpots">Team Spots</label>
          <input type="number" className="form-control" value={teamSpots}
                 onChange={this.handleChange} id="teamSpots" name="teamSpots"
                 autoComplete="teamSpots" placeholder="Team Spots" />
        </div>
        <div className="form-group">
          <label htmlFor="judgeSpots">Judges Spots</label>
          <input type="number" className="form-control" value={judgeSpots}
                 onChange={this.handleChange} id="judgeSpots" name="judgeSpots"
                 autoComplete="judgeSpots" placeholder="Judges Spots" />
        </div>
        <div className="form-group">
          <label htmlFor="link">Link</label>
          <input type="url" className="form-control" value={link}
                 onChange={this.handleChange} id="link" name="link"
                 autoComplete="link" placeholder="Link" />
        </div>
        <div className="form-group">
          <label htmlFor="comment">Comment</label>
          <input type="text" className="form-control" value={comment}
                 onChange={this.handleChange} id="comment" name="comment"
                 autoComplete="comment" placeholder="Comment" />
        </div>
        <button type="submit" className="btn btn-lg btn-outline-info ml-3 ml-lg-5" disabled={!disableSubmit}
                style={{ cursor: disableSubmit ? 'pointer' : 'not-allowed' }}>
          Submit
        </button>
      </form>
    );
  }
}

export default TournamentForm;
