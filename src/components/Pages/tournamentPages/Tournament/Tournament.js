import React, { Component } from 'react';

class Tournament extends Component {
  render() {
    return (
      <div className="container-fluid">
        <h2>Tournament {this.props.match.params.id}</h2>
      </div>
    );
  }
}

export default Tournament;
