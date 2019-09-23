export function calculateTotalUserDebt(user) {
  if (!user.tournaments) return undefined;
  return user.tournaments.reduce((total, tournament) => {
    const debt = tournament._pivot_price_paid - tournament._pivot_price_owed;
    return total - debt;
  }, 0);
}
