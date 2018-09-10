import React, { Component } from 'react';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import './App.css';
import 'react-notifications/lib/notifications.css';
import { connect } from 'react-redux';
import { NotificationContainer } from 'react-notifications';
import { checkAuthentication } from '../js/actions/AuthenticationActions';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import Login from './Pages/Login/Login';
import Signup from './Pages/profilePages/Signup/Signup';
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
import Profile from './Pages/profilePages/Profile/Profile';
import Home from './Pages/Home/Home';
import Spinner from './Spinner/Spinner';

const mapStateToProps = ({
  authentication,
}) => ({
  isAuthenticated: authentication.isAuthenticated,
  authenticatedUser: authentication.authenticatedUser,
  authCheckHasFinished: authentication.authCheckHasFinished,
});
const mapDispatchToProps = { checkAuthentication };

class App extends Component {
  componentWillMount() {
    this.props.checkAuthentication();
  }

  render() {
    const { isAuthenticated, authenticatedUser, authCheckHasFinished } = this.props;
    if (!authCheckHasFinished) {
      return (
        <div>
          <Navbar />
          <div id="mainContent">
            <div id="spinnerContainer">
              <Spinner xl />
            </div>
          </div>
          <Footer />
        </div>
      );
    }

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
        <div id="mainContent">
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />

            <Route path="/bug" component={BugList} />

            <PrivateRoute exact path="/tournament" component={TournamentList} />
            <PrivateRoute path="/tournament/:id" component={Tournament} />

            <PrivateRoute path="/registration/:id" component={Registration} />
            <PrivateRoute path="/dashboard" component={Dashboard} />

            <AdminRoute path="/createTournament" component={CreateTournament} />
            <AdminRoute path="/editTournament" component={EditTournament} />

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
