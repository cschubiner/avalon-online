import React, { PropTypes } from 'react';
import Firebase from 'firebase';
import RoleList from './RoleList.jsx';
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
      playerName: this.props.playerName,
    });
  }

  componentDidMount() {
    this.addCurrentPlayerToFirebase();
    this.populatePlayerState();
  }

  startGameClicked() {
    const gameRef = new Firebase(`https://avalonline.firebaseio.com/games/${this.props.roomCode}`);
    gameRef.update({
      hasStarted: true,
    });

    const roleNames = _.shuffle(globals.roleListForPlayerCount(this.state.players.length));

    let i = 0;
    this.state.players.forEach((player) => {
      const playerRef = new Firebase(`https://avalonline.firebaseio.com/games/${this.props.roomCode}/players/${player.playerName}`);
      playerRef.update({
        role: roleNames[i],
      });

      i+=1;
    });
  }

  getPlayerRow(playerData) {
    const isCurrPlayer = playerData.name == this.props.playerName;
    return (
      <li className={isCurrPlayer ? "bold" : ""}>
        { playerData.name }
      </li>
    );
  }

  getPlayerList() {
    let players = [];
    this.state.players.forEach((player) => {
      players.push(this.getPlayerRow(player));
    });

    return <ul>
      { players }
    </ul>;
  }

  getAdditionalPlayerMessage() {
    return <div className="italics">
      Need {5 - this.state.players.length} more players to start
    </div>;
  }

  render() {
    return (
      <div>
        <h1> Waiting Room </h1>
        <p> Go to avalonline.com and enter the room code to join! </p>
        <span>Room Code: </span>
        <span>{this.props.roomCode}</span>
        <h3> Players </h3>
        { this.getPlayerList() }
        <RoleList
          playerCount={this.state.players.length}
        />

        { this.state.players.length < 5 ? this.getAdditionalPlayerMessage() : null }
        <button type="button" onClick={this.startGameClicked.bind(this)}>
          Start Game
        </button>
      </div>
    );
  }
}

WaitingRoom.propTypes = propTypes;
