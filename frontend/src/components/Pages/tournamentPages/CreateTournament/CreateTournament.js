import React from 'react';
import { useDispatch } from 'react-redux';
import TournamentForm from '../TournamentForm';
import { createTournament } from '../../../../actions/TournamentActions';

const CreateTournament = () => {
  const dispatch = useDispatch();
  const _createTournament = tournament => {
    dispatch(createTournament(tournament));
  };

  return (
    <div className="container-fluid page-content">
      <h2 className="mb-4">Create New Tournament</h2>
      <TournamentForm handleSubmit={_createTournament} />
    </div>
  );
};

export default CreateTournament;
