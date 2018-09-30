import React, { Component } from 'react';
import { connect } from 'react-redux';
import TournamentForm from '../TournamentForm';
import { createTournament } from '../../../../actions/TournamentActions';

const mapDispatchToProps = { createTournament };

class CreateTournamentForm extends Component {
  constructor() {
    super();

    this.createTournament = this.createTournament.bind(this);
  }

  createTournament({ name, location, accommodation, startDate, endDate, deadline, format, language, league,
    rankingFactor, speakerPrice, judgePrice, teamSpots, judgeSpots, link, comment }) {
    this.props.createTournament({
      name,
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
    return (
      <div className="container-fluid py-4">
        <h2 className="mb-4">Create New Tournament</h2>
        <TournamentForm handleSubmit={this.createTournament} />
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(CreateTournamentForm);
