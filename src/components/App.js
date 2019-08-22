import React, { useEffect } from 'react';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './App.scss';
import 'react-notifications/lib/notifications.css';
import { NotificationContainer } from 'react-notifications';
import { getAppData } from '../actions/AuthActions';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import Login from './Pages/Login/Login';
import Signup from './Pages/profilePages/Signup/Signup';
import Home from './Pages/Home/Home';
import Profile from './Pages/profilePages/Profile/Profile';
import TournamentList from './Pages/tournamentPages/TournamentList/TournamentList';
import CreateTournament from './Pages/tournamentPages/CreateTournament/CreateTournament';
import EditTournament from './Pages/tournamentPages/EditTournament/EditTournament';
import MemberList from './Pages/MemberList/MemberList';
import Registration from './Pages/Registration/Registration';
import BugList from './Pages/BugList/BugList';
import Dashboard from './Pages/Dashboard/Dashboard';
import Spinner from './Spinner/Spinner';

const App = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAppData());
  }, [dispatch]);

  const {
    isAuthenticated,
    authenticatedUser,
    authCheckHasFinished,
  } = useSelector(({ user }) => ({
    ...user,
    authenticatedUser: user.authenticatedUserId
      ? user.users.find(({ id }) => user.authenticatedUserId === id)
      : {},
  }));

  if (!authCheckHasFinished) {
    return (
      <div className="app">
        <Navbar />
        <main className="mainContent d-flex justify-content-center align-items-center">
          <Spinner xl />
        </main>
        <Footer />
      </div>
    );
  }

  const AuthenticationRoute = ({ component: ComponentToRender, ...rest }) => (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? <Redirect to="/" /> : <ComponentToRender {...props} />
      }
    />
  );
  const PrivateRoute = ({ component: ComponentToRender, ...rest }) => (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? (
          <ComponentToRender {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
  const AdminRoute = ({ component: ComponentToRender, ...rest }) => (
    <Route
      {...rest}
      render={props =>
        isAuthenticated && authenticatedUser.position ? (
          <ComponentToRender {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );

  return (
    <div className="app">
      <Navbar
        isAuthenticated={isAuthenticated}
        authenticatedUser={authenticatedUser}
      />
      <main className="mainContent">
        <Switch>
          <AuthenticationRoute path="/login" component={Login} />
          <AuthenticationRoute path="/signup" component={Signup} />

          <Route path="/bug" component={BugList} />

          <PrivateRoute exact path="/tournament" component={TournamentList} />
          <AdminRoute path="/tournament/:id" component={EditTournament} />

          <PrivateRoute path="/registration/:id" component={Registration} />
          <PrivateRoute path="/dashboard" component={Dashboard} />

          <AdminRoute path="/createTournament" component={CreateTournament} />

          <AdminRoute path="/member" component={MemberList} />

          <PrivateRoute path="/edit" component={Profile} />
          <PrivateRoute path="/home" component={Home} />

          <PrivateRoute path="/" component={TournamentList} />
        </Switch>
      </main>
      <Footer />
      <NotificationContainer />
    </div>
  );
};

export default withRouter(App);
