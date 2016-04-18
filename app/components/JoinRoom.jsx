import React, { PropTypes } from 'react';
import Firebase from 'firebase';
import WaitingRoom from './WaitingRoom.jsx';
import _ from 'lodash';

const propTypes = {
  roomCode: PropTypes.string.isRequired,
  playerName: PropTypes.string.isRequired,
};

export default class JoinRoom extends React.Component {
  constructor() {
    super();
    this.state = {
      isOnJoinRoom: true,
    }
  }

  joinAsPlayerClicked() {
    this.setState({ isOnJoinRoom: false, isSpectator: false })
  }

  joinAsSpectatorClicked() {
    this.setState({ isOnJoinRoom: false, isSpectator: true })
  }

  handleNameChange(e) {
    console.log(e.target.value)
    this.setState({ name: e.target.value.toUpperCase() })
    console.log(this.state.name)
  }

  getJoinRoom() {
    return (
      <div>
        <h3>Joining Room</h3>
        <h1>{this.props.roomCode}</h1>
        <p> Go to avalonline.com and enter the room code <span className="bold">{this.props.roomCode}</span> to join! </p>

        <form className="nameForm" onSubmit={this.handleSubmit}>
          <input
            type="text"
            placeholder="WHALE FLOCK"
            value={this.state.name}
            onChange={this.handleNameChange.bind(this)}
          />
        </form>

        <button type="button" onClick={this.joinAsPlayerClicked.bind(this)}>
          Join as Player
        </button>
        <button type="button" onClick={this.joinAsSpectatorClicked.bind(this)}>
          Join as Spectator
        </button>
      </div>
    );
  }

  getWaitingRoom() {
    return <WaitingRoom
      roomCode={this.props.roomCode}
      // roomCode={this.state.roomCode}
      isSpectator={this.state.isSpectator}
      playerName={this.state.name}
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
