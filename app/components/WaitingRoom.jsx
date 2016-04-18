import React, { PropTypes } from 'react';
import Firebase from 'firebase';
import RoleList from './RoleList.jsx';
import GameRoom from './GameRoom.jsx';
import globals from '../globals.js'
import _ from 'lodash';

const propTypes = {
  roomCode: PropTypes.string.isRequired,
  playerName: PropTypes.string.isRequired,
  isSpectator: PropTypes.bool.isRequired,
};

export default class WaitingRoom extends React.Component {
  constructor() {
    super();
    this.state = {
      players: [],
      isOnWaitingRoom: true,
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
    ref.update({
      playerName: this.props.playerName,
      isSpectator: this.props.isSpectator,
    });
  }

  componentDidMount() {
    this.addCurrentPlayerToFirebase();
    this.populatePlayerState();
  }

  startGameClicked() {
    const roleNames = _.shuffle(globals.roleListForPlayerCount(this.state.players.length));

    let i = 0;
    this.state.players.forEach((player) => {
      const playerRef = new Firebase(`https://avalonline.firebaseio.com/games/${this.props.roomCode}/players/${player.playerName}`);
      playerRef.update({
        role: roleNames[i],
      });

      i+=1;
    });

    const gameRef = new Firebase(`https://avalonline.firebaseio.com/games/${this.props.roomCode}`);
    gameRef.update({
      hasStarted: true,
    }).then(()=> {
      this.setState({isOnWaitingRoom: false});
    });
  }

  getPlayerRow(playerData) {
    const isCurrPlayer = playerData.playerName == this.props.playerName;
    return (
      <li className={isCurrPlayer ? "bold" : ""}>
        { playerData.playerName }
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

  getWaitingRoom() {
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

  getGameRoom() {
    return (
      <GameRoom
        roomCode={this.props.roomCode}
        isSpectator={this.props.isSpectator}
        playerName={this.props.playerName}
        players={this.state.players}
      />
    );
  }

  render() {
    if (this.state.isOnWaitingRoom) {
      return this.getWaitingRoom();
    }

    return this.getGameRoom();
  }
}

WaitingRoom.propTypes = propTypes;
