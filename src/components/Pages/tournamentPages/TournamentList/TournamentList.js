import React, { Component } from 'react';
import './TournamentList.css';
import moment from 'moment';
import FlexTable from '../../../FlexTable/FlexTable';
import TournamentStore from '../../../../stores/TournamentStore';
import * as TournamentActions from '../../../../actions/TournamentActions';
import profileImageDefault from '../../../../images/bdu_quad.png';

class TournamentList extends Component {
  static loadOldTournaments() {
    TournamentActions.getAllTournaments();
  }

  constructor() {
    super();
    this.state = {
      tournaments: [],
    };

    this.handleTournamentChange = this.handleTournamentChange.bind(this);
    TournamentList.loadOldTournaments = TournamentList.loadOldTournaments.bind(this);
  }

  componentWillMount() {
    TournamentStore.on('tournamentChange', this.handleTournamentChange);
    TournamentActions.getCurrentTournaments();
  }

  componentWillUnmount() {
    TournamentStore.removeListener('tournamentChange', this.handleTournamentChange);
  }

  handleTournamentChange() {
    this.setState({
      tournaments: TournamentStore.getAllTournaments(),
    });
  }

  render() {
    const { tournaments } = this.state;
    const dateFormat = 'LL';
    const tournamentBodyRows = tournaments.map((tournament) => {
      const startdate = moment(tournament.startdate).format(dateFormat);
      const enddate = moment(tournament.enddate).format(dateFormat);
      return [
        tournament.name,
        `${startdate} \n ${enddate}`,
        tournament.ort,
        tournament.language,
        tournament.users.length,
      ];
    });
    const collapseRows = tournaments.map((tournament) => {
      const userTableRows = tournament.users.map((user) => {
        const profileImage = user.image
          ? `http://root.debating.de/members_area/userpics/${user.image}`
          : profileImageDefault;
        return [
          <img className="tournamentsProfileImage mx-auto" src={profileImage} alt="" />,
          `${user.vorname} ${user.name}`,
          user._pivot_role,
          user._pivot_teamname,
          user._pivot_comment,
          moment(user._pivot_created_at).format(dateFormat),
        ];
      });

      const startdate = moment(tournament.startdate).format(dateFormat);
      const enddate = moment(tournament.enddate).format(dateFormat);
      const tournamentTableRows = [
        tournament.name ? ['Name', tournament.name] : null,
        tournament.ort ? ['Location', tournament.ort] : null,
        tournament.startdate ? ['Date', `${startdate} - ${enddate}`] : null,
        tournament.format ? ['Format', tournament.format] : null,
        tournament.teamspots ? ['Team Spots', tournament.teamspots] : null,
        tournament.judgespots ? ['Judge Spots', tournament.judgespots] : null,
        tournament.speakerprice ? ['Price Speaker', tournament.speakerprice] : null,
        tournament.judgeprice ? ['Price Judge', tournament.judgeprice] : null,
        tournament.deadline ? ['Deadline to register', tournament.deadline] : null,
        tournament.accommodation ? ['Accommodation', tournament.accommodation] : null,
        tournament.rankingvalue ? ['BDU ranking factor:', tournament.rankingvalue] : null,
        tournament.league ? ['League', tournament.league] : null,
        tournament.link ? ['Link', tournament.link] : null,
        tournament.comments ? ['Comments', tournament.comments] : null,
      ].filter(row => row);
      return (
        <div className="d-flex">
          <div className="w-25">
            <FlexTable key={`tournamentTable_${tournament.name}`} tableName={`tournamentTable_${tournament.name}`}
                       bodyRows={tournamentTableRows} striped />
          </div>
          <div className="w-75 ml-5">
            <FlexTable key={`userTable_${tournament.name}`} tableName={`userTable_${tournament.name}`}
                       headColumns={['', 'Name', 'Role', 'Team', 'Comment', 'Registered at']}
                       bodyRows={userTableRows} striped />
          </div>
        </div>
      );
    });
    return (
      <div className="container-fluid">
        <h2 className="my-4">BDU Tournaments</h2>
        <FlexTable tableName="tournamentsTable" headColumns={['Name', 'Date', 'Location', 'Language', 'Users']}
                   bodyRows={tournamentBodyRows} collapse={collapseRows} />
        <button type="button" className="btn btn-outline-info mt-4"
                onClick={TournamentList.loadOldTournaments}>
          Load old tournaments
        </button>
      </div>
    );
  }
}

export default TournamentList;
