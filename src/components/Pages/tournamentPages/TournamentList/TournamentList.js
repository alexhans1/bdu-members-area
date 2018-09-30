import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import './TournamentList.css';
import profileImageDefault from '../../../../images/bdu_quad.png';
import FlexTable from '../../../FlexTable/FlexTable';
import RegistrationModal from './RegistrationModal/RegistrationModal';
import Spinner from '../../../Spinner/Spinner';
import { getTournaments } from '../../../../actions/TournamentActions';
import { getUserList } from '../../../../actions/UserActions';

const mapStateToProps = ({
  tournament,
  user,
}) => ({
  users: user.users,
  tournaments: tournament.tournamentList,
  showSpinner: tournament.isLoading,
});
const mapDispatchToProps = { getUserList, getTournaments };

class TournamentList extends Component {
  static handleClickRegister(tournamentId) {
    window.$(`#registrationModal_${tournamentId}`).modal('toggle');
  }

  constructor(props) {
    super(props);

    props.getTournaments(true);
    props.getUserList();
    this.loadOldTournaments = this.loadOldTournaments.bind(this);
  }

  loadOldTournaments() {
    this.props.getTournaments();
  }

  render() {
    const { users, tournaments, showSpinner } = this.props;
    const dateFormat = 'LL';
    const tournamentBodyRows = tournaments.map((tournament) => {
      const startdate = moment(tournament.startdate).format(dateFormat);
      const enddate = moment(tournament.enddate).format(dateFormat);
      return [
        tournament.name,
        `${startdate} - ${enddate}`,
        tournament.ort,
        tournament.language,
        tournament.users.length,
      ];
    });
    const collapseRows = tournaments.map((tournament) => {
      const startdate = moment(tournament.startdate).format(dateFormat);
      const enddate = moment(tournament.enddate).format(dateFormat);
      let { link } = tournament;
      if (tournament.link.includes('http://') || tournament.link.includes('https://')) {
        const isFaceBookLink = tournament.link.includes('facebook');
        const linkLabel = isFaceBookLink
          ? <i className="fab fa-lg fa-facebook-square" />
          : <i className="fas fa-lg fa-link" />;
        link = (
          <a className="text-white" href={tournament.link} target="_blank" rel="noopener noreferrer">
            {linkLabel}
          </a>
        );
      }
      const tournamentTableRows = [
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
        tournament.link ? ['Link', link] : null,
        tournament.comments ? ['Comments', tournament.comments] : null,
      ].filter(row => row);

      const userTableRows = tournament.users.length ? tournament.users.map((user) => {
        const profileImage = user.image
          ? `http://root.debating.de/members_area/userpics/${user.image}`
          : profileImageDefault;
        return [
          <img className="tournamentsProfileImage" src={profileImage} alt="" />,
          `${user.vorname} ${user.name}`,
          user._pivot_role,
          user._pivot_teamname,
          user._pivot_comment,
          moment(user._pivot_created_at).format('LLL'),
        ];
      }) : null;

      return (
        <div className="collapseContainer">
          <div className="collapseTournamentContainer">
            <h3 className="pr-4 pr-sm-0">{tournament.name}</h3>
            <FlexTable key={`tournamentTable_${tournament.name}`} tableName={`tournamentTable_${tournament.name}`}
                       bodyRows={tournamentTableRows} striped />
            <div className="d-flex mt-4">
              <button type="button" className="btn btn-outline-light btn-lg"
                      data-toggle="tooltip" title="Add to calendar">
                <i className="far fa-calendar-alt" />
              </button>
              <button type="button" className="btn btn-danger btn-lg ml-auto registerButton"
                      onClick={() => { TournamentList.handleClickRegister(tournament.id); }}>
                Register
              </button>
            </div>
          </div>
          <div className="collapseUserContainer">
            <h3>Registered Users</h3>
            {tournament.users.length ? (
              <FlexTable key={`userTable_${tournament.name}`} tableName={`userTable_${tournament.name}`}
                         headColumns={['Image', 'Name', 'Role', 'Team', 'Comment', 'Registered at']}
                         bodyRows={userTableRows} striped />
            ) : (
              <p>There are no registrations for this tournament yet.</p>
            )}
          </div>
          <RegistrationModal tournament={tournament} users={users} />
        </div>
      );
    });
    return (
      <div className="container-fluid py-4">
        <h2 className="mb-4">BDU Tournaments</h2>
        <FlexTable tableName="tournamentsTable" headColumns={['Name', 'Date', 'Location', 'Language', 'Users']}
                   bodyRows={tournamentBodyRows} collapse={collapseRows} />
        <div className="d-flex align-items-center flex-column flex-sm-row mt-4">
          <button type="button" className="btn btn-outline-info"
                  onClick={this.loadOldTournaments}>Load old tournaments
          </button>
          {showSpinner ? (
            <div className="mx-auto mt-4 mt-sm-0">
              <Spinner />
            </div>
          ) : null}
        </div>

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TournamentList);
