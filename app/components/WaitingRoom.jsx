import React, { PropTypes } from 'react';
import Firebase from 'firebase';
import _ from 'lodash';

const propTypes = {
  roomCode: PropTypes.string.isRequired,
  playerName: PropTypes.string.isRequired,
};

export default class WaitingRoom extends React.Component {
  constructor() {
    super();
    this.state = {
      players: [],
    }
  }

  populatePlayerState() {
    const ref = new Firebase(`https://avalonline.firebaseio.com/games/${this.props.roomCode}/players`);
    ref.on("value", (snapshot) => {
      let players = [];
      snapshot.forEach((childSnapshot) => {
        let key = childSnapshot.key();
        let childData = childSnapshot.val();
        players.push(childData);
      });
      this.setState({'players': players});
    });
  }

  addCurrentPlayerToFirebase() {
    const ref = new Firebase(`https://avalonline.firebaseio.com/games/${this.props.roomCode}/players/${this.props.playerName}`);
    ref.set({
      name: this.props.playerName,
    });
  }

  componentDidMount() {
    this.addCurrentPlayerToFirebase();
    this.populatePlayerState();
  }

  startGameClicked() {

  }

  getPlayerRow(playerData) {
    const isCurrPlayer = playerData.name == this.props.playerName;
    return (
      <li className={isCurrPlayer ? "currentPlayerRow" : ""}>
        { playerData.name }
      </li>
    );
  }

  getPlayerList() {
    let players = [];
    this.state.players.forEach((playerData) => {
      players.push(this.getPlayerRow(playerData));
    });

    return players;
  }

  render() {
    return (
      <div>
        <h1> Waiting Room </h1>
        <p> Go to avalonline.com and enter the room code to join! </p>
        <span>Room Code: </span>
        <span>{this.props.roomCode}</span>
        <div>
          { this.getPlayerList() }
        </div>
        <button type="button" onClick={this.startGameClicked.bind(this)}>
          Start Game
        </button>
      </div>
    );
  }
}

WaitingRoom.propTypes = propTypes;
