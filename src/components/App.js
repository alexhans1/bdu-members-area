import React, { Component } from 'react';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import './App.css';
import 'react-notifications/lib/notifications.css';
import { connect } from 'react-redux';
import { NotificationContainer } from 'react-notifications';
import { getCurrentUser } from '../actions/UserActions';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import Login from './Pages/Login/Login';
import Signup from './Pages/profilePages/Signup/Signup';
import Home from './Pages/Home/Home';
import Profile from './Pages/profilePages/Profile/Profile';
import TournamentList from './Pages/tournamentPages/TournamentList/TournamentList';
import Tournament from './Pages/tournamentPages/Tournament/Tournament';
import CreateTournament from './Pages/tournamentPages/CreateTournament/CreateTournament';
import EditTournament from './Pages/tournamentPages/EditTournament/EditTournament';
import MemberList from './Pages/MemberList/MemberList';
import Registration from './Pages/Registration/Registration';
import TransactionList from './Pages/transactionPages/TransactionList/TransactionList';
import Transaction from './Pages/transactionPages/Transaction/Transaction';
import BugList from './Pages/BugList/BugList';
import Dashboard from './Pages/Dashboard/Dashboard';
import Spinner from './Spinner/Spinner';

const mapStateToProps = ({
  user,
}) => ({
  isAuthenticated: user.isAuthenticated,
  authenticatedUser: user.authenticatedUser,
  authCheckHasFinished: user.authCheckHasFinished,
});
const mapDispatchToProps = { getCurrentUser };

class App extends Component {
  componentWillMount() {
    this.props.getCurrentUser();
  }

  render() {
    const { isAuthenticated, authenticatedUser, authCheckHasFinished } = this.props;
    if (!authCheckHasFinished) {
      return (
        <div>
          <Navbar />
          <div className="mainContent d-flex justify-content-center align-items-center">
            <Spinner xl />
          </div>
          <Footer />
        </div>
      );
    }

    const AuthenticationRoute = ({ component: ComponentToRender, ...rest }) => (
      <Route {...rest} render={props => (
        isAuthenticated
          ? <Redirect to="/" />
          : <ComponentToRender {...props} />
      )} />
    );
    const PrivateRoute = ({ component: ComponentToRender, ...rest }) => (
      <Route {...rest} render={props => (
        isAuthenticated
          ? <ComponentToRender {...props} />
          : <Redirect to="/login" />
      )} />
    );
    const AdminRoute = ({ component: ComponentToRender, ...rest }) => (
      <Route {...rest} render={props => (
        (isAuthenticated && authenticatedUser.position)
          ? <ComponentToRender {...props} />
          : <Redirect to="/login" />
      )} />
    );

    return (
      <div>
        <Navbar isAuthenticated={isAuthenticated} authenticatedUser={authenticatedUser} />
        <div className="mainContent">
          <Switch>
            <AuthenticationRoute path="/login" component={Login} />
            <AuthenticationRoute path="/signup" component={Signup} />

            <Route path="/bug" component={BugList} />

            <PrivateRoute exact path="/tournament" component={TournamentList} />
            <PrivateRoute path="/tournament/:id" component={Tournament} />

            <PrivateRoute path="/registration/:id" component={Registration} />
            <PrivateRoute path="/dashboard" component={Dashboard} />

            <AdminRoute path="/createTournament" component={CreateTournament} />
            <AdminRoute path="/editTournament/:id" component={EditTournament} />

            <AdminRoute path="/member" component={MemberList} />

            <AdminRoute exact path="/transaction" component={TransactionList} />
            <AdminRoute path="/transaction/:id" component={Transaction} />

            <PrivateRoute path="/edit" component={Profile} />
            <PrivateRoute path="/" component={Home} />
          </Switch>
        </div>
        <Footer />
        <NotificationContainer />
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
