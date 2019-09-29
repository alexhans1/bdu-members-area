export function calculateTotalUserDebt(user) {
  if (!user.tournaments) return undefined;
  return user.tournaments.reduce((total, tournament) => {
    const debt = tournament._pivot_price_paid - tournament._pivot_price_owed;
    return total - debt;
  }, 0);
}

export const renameTournamentFields = ({
  ort,
  startdate,
  enddate,
  speakerprice,
  judgeprice,
  teamspots,
  judgespots,
  rankingvalue,
  comments,
  ...tournament
}) => {
  let users;
  if (tournament.users) {
    // eslint-disable-next-line no-use-before-define
    users = tournament.users.map(renameUserFields);
  }
  return {
    ...tournament,
    location: ort,
    startDate: startdate,
    endDate: enddate,
    speakerPrice: speakerprice,
    judgePrice: judgeprice,
    teamSpots: teamspots,
    judgeSpots: judgespots,
    rankingFactor: rankingvalue,
    comment: comments,
    users,
  };
};

export const renameUserFields = ({ vorname, name, ...user }) => {
  let tournaments;
  if (user.tournaments) {
    tournaments = user.tournaments.map(renameTournamentFields);
  }
  return {
    ...user,
    firstName: vorname,
    lastName: name,
    tournaments,
  };
};
