import React, { PropTypes } from 'react';
import Firebase from 'firebase';
import WaitingRoom from './WaitingRoom.jsx';
import _ from 'lodash';

const propTypes = {
  roomCode: PropTypes.string.isRequired,
};

export default class JoinRoom extends React.Component {
  constructor() {
    super();
    this.state = {
      isOnJoinRoom: true,
      playerName: '',
    }
  }

  handleSubmit(isSpectator, e) {
    e.preventDefault();
    if (this.state.playerName.length <= 2 || this.state.playerName.length >= 21) {
      alert("Your name must be between 3 and 20 characters.");
    } else {
      this.setState({ playerName: this.state.playerName.trim(), isOnJoinRoom: false, isSpectator: isSpectator })
    }
  }

  handleNameChange(e) {
    this.setState({ playerName: e.target.value.toUpperCase() })
  }

  getJoinRoom() {
    return (
      <div>
        <h3>Joining Room</h3>
        <h1>{this.props.roomCode}</h1>
        <p> Go to avalonline.com and enter the room code <span className="bold">{this.props.roomCode}</span> to join! </p>
        <p> Choose a name: </p>
        <form className="nameForm" onSubmit={this.handleSubmit.bind(this, false)}>
          <input
            type="text"
            placeholder="WHALE FLOCK"
            value={this.state.playerName}
            onChange={this.handleNameChange.bind(this)}
          />
        </form>

        <br/>

        <button type="button" onClick={this.handleSubmit.bind(this, false)}>
          Join as Player
        </button>
        <button type="button" onClick={this.handleSubmit.bind(this, true)}>
          Join as Spectator
        </button>
      </div>
    );
  }

  getWaitingRoom() {
    return <WaitingRoom
      roomCode={this.props.roomCode}
      isSpectator={this.state.isSpectator}
      playerName={this.state.playerName}
    />;
  }

  render() {
    if (this.state.isOnJoinRoom) {
      return this.getJoinRoom();
    } else {
      return this.getWaitingRoom();
    }
  }
}

JoinRoom.propTypes = propTypes;
