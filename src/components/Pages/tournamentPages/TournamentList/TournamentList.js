import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import './TournamentList.css';
import FlexTable from '../../../FlexTable/FlexTable';
import Spinner from '../../../Spinner/Spinner';
import { DATE_FORMAT } from '../../../../constants/applicationConstants';
import TournamentRowCollapse from './TournamentRowCollapse';

const mapStateToProps = ({ tournament, user }) => ({
  authenticatedUser: user.users.find(({ id }) => user.authenticatedUserId === id),
  users: user.users,
  tournaments: tournament.tournamentList,
  showSpinner: tournament.isLoading,
});

class TournamentList extends Component {
  constructor(props) {
    super(props);

    this.forwardToEditTournament = this.forwardToEditTournament.bind(this);
  }

  forwardToEditTournament(tournamentId) {
    this.props.history.push(`/editTournament/${tournamentId}`);
  }

  render() {
    const { tournaments, showSpinner, history } = this.props;
    const tournamentBodyRows = tournaments.map(tournament => {
      const startdate = moment(tournament.startdate).format(DATE_FORMAT);
      const enddate = moment(tournament.enddate).format(DATE_FORMAT);
      return [
        tournament.name,
        `${startdate} - ${enddate}`,
        tournament.ort,
        tournament.language,
        tournament.users.length,
      ];
    });
    const collapseRows = tournaments.map(tournament => (
      <TournamentRowCollapse history={history} tournament={tournament} />
    ));
    return (
      <div className="container-fluid py-4">
        <h2 className="mb-4">BDU Tournaments</h2>
        <FlexTable
          tableName="tournamentsTable"
          headColumns={['Name', 'Date', 'Location', 'Language', 'Users']}
          bodyRows={tournamentBodyRows}
          collapse={collapseRows}
        />
        <div className="d-flex align-items-center flex-column flex-sm-row mt-4">
          <button type="button" className="btn btn-outline-info" onClick={this.loadOldTournaments}>
            Load old tournaments
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

export default connect(mapStateToProps)(TournamentList);
