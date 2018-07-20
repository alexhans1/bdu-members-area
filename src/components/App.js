import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import './App.css';
import AuthenticationStore from '../stores/AuthenticationStore';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import Login from './Pages/Login/Login';
import Signup from './Pages/Signup/Signup';
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
import Profile from './Pages/Profile/Profile';
import Home from './Pages/Home/Home';

class App extends Component {
  render() {
    return (
      <div>
        <Navbar />
        <div id="mainContent">
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />

            <Route path="/tournament" component={TournamentList} />
            <Route path="/tournament/:id" component={Tournament} />
            <Route path="/createTournament" component={CreateTournament} />
            <Route path="/editTournament" component={EditTournament} />

            <Route path="/member" component={MemberList} />

            <Route path="/registration/:id" component={Registration} />

            <Route path="/transaction" component={TransactionList} />
            <Route path="/transaction/:id" component={Transaction} />

            <Route path="/bug" component={BugList} />
            <Route path="/dashboard" component={Dashboard} />

            <Route path="/edit" component={Profile} />
            <Route path="/" component={Home} />
          </Switch>
        </div>
        <Footer />
      </div>
    );
  }
}

export default App;
