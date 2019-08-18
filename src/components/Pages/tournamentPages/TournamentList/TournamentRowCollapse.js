import React from 'react';
import Currency from 'react-currency-formatter';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment/moment';
import $ from 'jquery';
import { confirmAlert } from 'react-confirm-alert';
import FlexTable from '../../../FlexTable/FlexTable';
import RegistrationModal from './RegistrationModal/RegistrationModal';
import {
  DATE_FORMAT,
  DATE_TIME_FORMAT,
} from '../../../../constants/applicationConstants';
import { deleteTournament } from '../../../../actions/TournamentActions';

const handleClickRegister = tournamentId => {
  $(`#registrationModal_${tournamentId}`).modal('toggle');
};

const TournamentRowCollapse = ({ tournament, history }) => {
  const { isAdmin, users } = useSelector(({ user }) => ({
    isAdmin: user.authenticatedUserId
      ? user.users.find(({ id }) => user.authenticatedUserId === id)
          .position === 1
      : false,
    users: user.users,
  }));
  const dispatch = useDispatch();

  const forwardToEditTournament = tournamentId => {
    history.push(`/tournament/${tournamentId}`);
  };

  const forwardToRegistration = tournament.users.length
    ? rowIndex => {
        const registrationId = tournament.users[rowIndex]._pivot_id;
        history.push(`/registration/${registrationId}`);
      }
    : null;

  const handleDeleteClick = tournamentId => {
    confirmAlert({
      title: 'Confirm',
      message: 'Are you sure you want to delete this tournament?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => dispatch(deleteTournament(tournamentId)),
        },
        {
          label: 'No',
          onClick: () => {},
        },
      ],
    });
  };

  const startdate = moment(tournament.startdate).format(DATE_FORMAT);
  const enddate = moment(tournament.enddate).format(DATE_FORMAT);
  let { link } = tournament;
  if (
    tournament.link.includes('http://') ||
    tournament.link.includes('https://')
  ) {
    const isFaceBookLink = tournament.link.includes('facebook');
    const linkLabel = isFaceBookLink ? (
      <i className="fab fa-lg fa-facebook-square" />
    ) : (
      <i className="fas fa-lg fa-link" />
    );
    link = (
      <a
        className="text-white"
        href={tournament.link}
        target="_blank"
        rel="noopener noreferrer"
      >
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
      ? [
          'Price Speaker',
          <Currency quantity={tournament.speakerprice || 0} currency="EUR" />,
        ]
      : null,
    tournament.judgeprice
      ? [
          'Price Judge',
          <Currency quantity={tournament.judgeprice || 0} currency="EUR" />,
        ]
      : null,
    tournament.deadline ? ['Deadline to register', tournament.deadline] : null,
    tournament.accommodation
      ? ['Accommodation', tournament.accommodation]
      : null,
    tournament.rankingvalue
      ? ['BDU ranking factor:', tournament.rankingvalue]
      : null,
    tournament.league ? ['League', tournament.league] : null,
    tournament.link ? ['Link', link] : null,
    tournament.comments ? ['Comments', tournament.comments] : null,
  ].filter(row => row);

  const userTableRows = tournament.users.length
    ? tournament.users
        .map(user => {
          return [
            `${user.vorname} ${user.name}`,
            user._pivot_role,
            user._pivot_teamname,
            user._pivot_comment,
            moment(user._pivot_created_at).format(DATE_TIME_FORMAT),
          ];
        })
        .sort(([, , , , , a], [, , , , , b]) => {
          if (a === b) return 0;
          return moment(a, DATE_TIME_FORMAT).isAfter(
            moment(b, DATE_TIME_FORMAT),
          )
            ? 1
            : -1;
        })
    : null;
  console.log('userTableRows', userTableRows);

  return (
    <div id={tournament.id} className="collapseContainer">
      <div className="collapseTournamentContainer">
        <h3 className="pr-4 pr-sm-0">{tournament.name}</h3>
        {isAdmin ? (
          <div className="d-flex mb-1">
            <button
              onClick={() => {
                forwardToEditTournament(tournament.id);
              }}
              type="button"
              className="btn btn-outline-light"
            >
              Edit
            </button>
            <button
              onClick={() => {
                handleDeleteClick(tournament.id);
              }}
              type="button"
              className="btn btn-outline-danger ml-2"
            >
              Delete
            </button>
          </div>
        ) : null}
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
              handleClickRegister(tournament.id);
            }}
          >
            Register
          </button>
        </div>
      </div>
      <div className="collapseUserContainer">
        <div className="d-flex">
          <h3>Registered Users</h3>
        </div>
        {tournament.users.length ? (
          <FlexTable
            key={`userTable_${tournament.name}`}
            tableName={`userTable_${tournament.name}`}
            headColumns={['Name', 'Role', 'Team', 'Comment', 'Registered at']}
            actionOnRowClick={forwardToRegistration}
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
};

export default TournamentRowCollapse;
