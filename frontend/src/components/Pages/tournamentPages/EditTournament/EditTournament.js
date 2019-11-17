import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TournamentForm from '../TournamentForm';
import {
  getTournament,
  updateTournament,
} from '../../../../actions/TournamentActions';
import Spinner from '../../../Spinner/Spinner';

const EditTournament = ({ match }) => {
  const tournamentId = parseInt(match.params.id, 10);

  const { tournamentList } = useSelector(state => state.tournament);
  const tournament = tournamentList.find(({ id }) => id === tournamentId);

  const dispatch = useDispatch();

  useEffect(() => {
    const tournamentIndex = tournamentList.findIndex(
      ({ id }) => id === tournamentId,
    );
    if (tournamentIndex < 0) dispatch(getTournament(tournamentId));
  }, []);

  if (!tournament) {
    return <Spinner />;
  }

  function editTournament(_tournament) {
    dispatch(updateTournament(tournamentId, _tournament));
  }

  const { startDate, endDate, deadline, ...restTournamentProps } = tournament;

  return (
    <div className="container-fluid page-content">
      <h2 className="mb-4">Edit Tournament</h2>
      <TournamentForm
        handleSubmit={editTournament}
        startDate={
          startDate
            ? new Date(startDate).toISOString().substr(0, 10)
            : startDate
        }
        endDate={
          endDate ? new Date(endDate).toISOString().substr(0, 10) : endDate
        }
        deadline={
          deadline ? new Date(deadline).toISOString().substr(0, 10) : deadline
        }
        {...restTournamentProps}
      />
    </div>
  );
};

export default EditTournament;
