import React, { Component } from 'react';
import { connect } from 'react-redux';
import TournamentForm from '../TournamentForm';
import { getTournament, updateTournament } from '../../../../actions/TournamentActions';
import Spinner from '../../../Spinner/Spinner';

const mapStateToProps = ({
  tournament,
}) => ({
  tournamentList: tournament.tournamentList,
});
const mapDispatchToProps = { getTournament, updateTournament };


class EditTournament extends Component {
  constructor(props) {
    super(props);

    this.editTournament = this.editTournament.bind(this);
  }

  componentWillMount() {
    const { tournamentList, match } = this.props;
    const tournamentId = parseInt(match.params.id, 10);
    const tournamentIndex = tournamentList.findIndex(({ id }) => id === tournamentId);
    if (tournamentIndex < 0) this.props.getTournament(tournamentId);
  }

  editTournament({ name, location, accommodation, startDate, endDate, deadline, format, language, league,
    rankingFactor, speakerPrice, judgePrice, teamSpots, judgeSpots, link, comment }) {
    const tournamentId = parseInt(this.props.match.params.id, 10);
    this.props.updateTournament(tournamentId, {
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
    const { tournamentList, match } = this.props;
    const tournamentId = parseInt(match.params.id, 10);
    const tournament = tournamentList.find(({ id }) => id === tournamentId);
    if (!tournament) {
      return <Spinner />;
    }
    const { name, ort, accommodation, startdate, enddate, deadline, format, language, league,
      rankingvalue, speakerprice, judgeprice, teamspots, judgespots, link, comments } = tournament;
    return (
      <div className="container-fluid py-4">
        <h2 className="mb-4">Edit Tournament</h2>
        <TournamentForm
          handleSubmit={this.editTournament}
          name={name}
          location={ort}
          accommodation={accommodation}
          startDate={startdate ? new Date(startdate).toISOString().substr(0, 10) : startdate}
          endDate={enddate ? new Date(enddate).toISOString().substr(0, 10) : enddate}
          deadline={deadline ? new Date(deadline).toISOString().substr(0, 10) : deadline}
          format={format}
          language={language}
          league={league}
          rankingFactor={rankingvalue}
          speakerPrice={speakerprice}
          judgePrice={judgeprice}
          teamSpots={teamspots}
          judgeSpots={judgespots}
          link={link}
          comment={comments} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditTournament);
