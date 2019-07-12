import React, { Component } from 'react';
import { connect } from 'react-redux';
import Currency from 'react-currency-formatter';
import {
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import './Dashboard.scss';
import moment from 'moment';
import { BASE_URL } from '../../../constants/applicationConstants';

const mapStateToProps = ({ user, tournament }) => ({
  users: user.users,
  tournaments: tournament.tournamentList,
});
const COLORS = ['#00C49F', '#FFBB28', '#FF8042'];

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      debtArray: [],
    };
  }

  async componentDidMount() {
    if (!this.state.debtArray.length) {
      const response = await fetch(`${BASE_URL}/clubDebt`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.status !== 200) return;
      const { data: debtArray } = await response.json();
      if (debtArray.length) this.setState({ debtArray });
    }
  }

  render() {
    const { debtArray } = this.state;
    const { users, tournaments } = this.props;
    const firstTournamentDate = Math.min(
      ...tournaments.map(({ startdate }) => moment(startdate).valueOf()),
    );

    const totalUsers = users.length;
    const activeUsers = users.filter(
      user =>
        user.tournaments.filter(tournament =>
          moment(tournament.startdate).isAfter(moment().subtract(1, 'years')),
        ).length,
    );
    const registeredUsers = users.filter(
      user =>
        user.tournaments.filter(tournament =>
          moment(tournament.startdate).isAfter(moment()),
        ).length,
    ).length;

    const victoryData = [
      ...Array(
        Math.round(
          Math.abs(
            moment
              .duration(moment(firstTournamentDate).diff(moment()))
              .asDays(),
          ) / 7,
        ),
      ).keys(),
    ].map(i => {
      const date = moment(firstTournamentDate).add(i * 7 - 1, 'days');
      return {
        date: date.toISOString(),
        count: tournaments.filter(
          ({ startdate, users: tournamentUsers }) =>
            moment(startdate).isBefore(date) &&
            tournamentUsers.some(({ _pivot_success }) =>
              ['win', 'win2', 'winESL', 'win2ESL'].includes(_pivot_success),
            ),
        ).length,
      };
    });

    const activeUsersGenderData = ['m', 'f', '-'].map(name => ({
      name,
      value: activeUsers.filter(({ gender }) => gender === name).length,
    }));

    return (
      <div className="container-fluid">
        <div id="dashboard">
          <div className="box">
            <b>{totalUsers}</b>
            <small>Total Members</small>
          </div>
          <div className="box cell-size-3x3 pl-0 pr-3 pt-2 pb-0">
            <h5 className="py-0 px-4 align-self-start">Member Debt</h5>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={debtArray.map(([date, debt]) => ({
                  x: date,
                  Debt: debt,
                }))}
              >
                <Area
                  type="monotone"
                  dataKey="Debt"
                  stroke="#59D4BB"
                  fill="#59D4BB"
                  dot={false}
                />
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  tickFormatter={date =>
                    moment(date, 'YYYYDDMM').format('MMM YY')
                  }
                  dataKey="x"
                  tick={{ fontSize: 'x-small' }}
                />
                <YAxis unit="€" tick={{ fontSize: 'x-small' }} />
                <Tooltip
                  formatter={value => (
                    <Currency quantity={value} currency="EUR" />
                  )}
                  labelFormatter={value => moment(value).format('DD/MM/YYYY')}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="box cell-size-3x2 pl-0 pr-3 pt-2 pb-0">
            <h5 className="py-0 px-4 align-self-start">Total Victories: </h5>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={victoryData}>
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#EB91A3"
                  fill="#EB91A3"
                  dot={false}
                />
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  tickFormatter={date => moment(date).format('MMM YY')}
                  dataKey="date"
                  tick={{ fontSize: 'x-small' }}
                />
                <YAxis tick={{ fontSize: 'x-small' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="box">3</div>
          <div className="box">
            <b>{activeUsers.length}</b>
            <small>Active Members*</small>
          </div>
          <div className="box cell-size-1x2">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart width={150} height={150}>
                <Pie
                  dataKey="value"
                  data={activeUsersGenderData}
                  innerRadius={40}
                  outerRadius={80}
                  startAngle={180}
                  endAngle={0}
                  cy={130}
                  label={({ percent }) => `${Math.round(percent * 100)}%`}
                  labelLine={false}
                >
                  {activeUsersGenderData.map((entry, index) => (
                    <Cell fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <small>
              <i className="fas fa-venus-mars" style={{ fontSize: '1.5rem' }} />{' '}
              Active Users
            </small>
          </div>
          <div className="box">4</div>
          <div className="box">4</div>
          <div className="box">
            <b>{registeredUsers}</b>
            <small>Registered Members*</small>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Dashboard);
