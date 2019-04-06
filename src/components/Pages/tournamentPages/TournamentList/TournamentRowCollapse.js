import React, { Component } from 'react';
import Currency from 'react-currency-formatter';
import moment from 'moment/moment';
import { connect } from 'react-redux';
import FlexTable from '../../../FlexTable/FlexTable';
import RegistrationModal from './RegistrationModal/RegistrationModal';
import { DATE_FORMAT, DATE_TIME_FORMAT } from '../../../../constants/applicationConstants';
import profileImageDefault from '../../../../images/bdu_quad.png';

const mapStateToProps = ({ user }) => ({
  authenticatedUser: user.users.find(({ id }) => user.authenticatedUserId === id),
  users: user.users,
});

class TournamentRowCollapse extends Component {
  static handleClickRegister(tournamentId) {
    window.$(`#registrationModal_${tournamentId}`).modal('toggle');
  }

  constructor() {
    super();

    this.forwardToRegistration = this.forwardToRegistration.bind(this);
  }

  forwardToRegistration(rowIndex) {
    const { tournament } = this.props;
    const registrationId = tournament.users[rowIndex]._pivot_id;
    this.props.history.push(`/registration/${registrationId}`);
  }

  render() {
    const { users, authenticatedUser } = this.props;
    const isAdmin = authenticatedUser.position === 1;
    const { tournament } = this.props;
    const startdate = moment(tournament.startdate).format(DATE_FORMAT);
    const enddate = moment(tournament.enddate).format(DATE_FORMAT);
    let { link } = tournament;
    if (tournament.link.includes('http://') || tournament.link.includes('https://')) {
      const isFaceBookLink = tournament.link.includes('facebook');
      const linkLabel = isFaceBookLink ? (
        <i className="fab fa-lg fa-facebook-square" />
      ) : (
        <i className="fas fa-lg fa-link" />
      );
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
      tournament.speakerprice
        ? ['Price Speaker', <Currency quantity={tournament.speakerprice || 0} currency="EUR" />]
        : null,
      tournament.judgeprice
        ? ['Price Judge', <Currency quantity={tournament.judgeprice || 0} currency="EUR" />]
        : null,
      tournament.deadline ? ['Deadline to register', tournament.deadline] : null,
      tournament.accommodation ? ['Accommodation', tournament.accommodation] : null,
      tournament.rankingvalue ? ['BDU ranking factor:', tournament.rankingvalue] : null,
      tournament.league ? ['League', tournament.league] : null,
      tournament.link ? ['Link', link] : null,
      tournament.comments ? ['Comments', tournament.comments] : null,
    ].filter(row => row);

    const userTableRows = tournament.users.length
      ? tournament.users.map(user => {
          const profileImage = user.image
            ? `http://root.debating.de/members_area/userpics/${user.image}`
            : profileImageDefault;
          return [
            <img className="tournamentsProfileImage" src={profileImage} alt="" />,
            `${user.vorname} ${user.name}`,
            user._pivot_role,
            user._pivot_teamname,
            user._pivot_comment,
            moment(user._pivot_created_at).format(DATE_TIME_FORMAT),
          ];
        })
      : null;

    return (
      <div className="collapseContainer">
        <div className="collapseTournamentContainer">
          <h3 className="pr-4 pr-sm-0">{tournament.name}</h3>
          <FlexTable
            key={`tournamentTable_${tournament.name}`}
            tableName={`tournamentTable_${tournament.name}`}
            bodyRows={tournamentTableRows}
            striped
          />
          <div className="d-flex mt-4">
            <button
              type="button"
              className="btn btn-outline-light btn-lg"
              data-toggle="tooltip"
              title="Add to calendar"
            >
              <i className="far fa-calendar-alt" />
            </button>
            <button
              type="button"
              className="btn btn-danger btn-lg ml-auto registerButton"
              onClick={() => {
                TournamentRowCollapse.handleClickRegister(tournament.id);
              }}
            >
              Register
            </button>
          </div>
        </div>
        <div className="collapseUserContainer">
          <div className="d-flex">
            <h3>Registered Users</h3>
            {isAdmin ? (
              <div className="d-flex mb-1">
                <button
                  onClick={() => {
                    this.forwardToEditTournament(tournament.id);
                  }}
                  type="button"
                  className="btn btn-outline-light ml-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    this.deleteTournament(tournament.id);
                  }}
                  type="button"
                  className="btn btn-outline-danger ml-2"
                >
                  Delete
                </button>
              </div>
            ) : null}
          </div>
          {tournament.users.length ? (
            <FlexTable
              key={`userTable_${tournament.name}`}
              tableName={`userTable_${tournament.name}`}
              headColumns={['Image', 'Name', 'Role', 'Team', 'Comment', 'Registered at']}
              actionOnRowClick={this.forwardToRegistration}
              bodyRows={userTableRows}
              striped
            />
          ) : (
            <p>There are no registrations for this tournament yet.</p>
          )}
        </div>
        <RegistrationModal tournament={tournament} users={users} />
      </div>
    );
  }
}

export default connect(mapStateToProps)(TournamentRowCollapse);
