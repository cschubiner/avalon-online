import React, { PropTypes } from 'react';
import Firebase from 'firebase';
import _ from 'lodash';
import globals from '../globals.js'
import RoleList from './RoleList.jsx';
import YourInfo from './YourInfo.jsx';

const propTypes = {
  roomCode: PropTypes.string.isRequired,
  playerName: PropTypes.string.isRequired,
  isSpectator: PropTypes.bool.isRequired,
  players: PropTypes.array.isRequired,
};

export default class GameRoom extends React.Component {
  constructor() {
    super();
    this.state = {
    }
  }

  getCurrentPlayer() {
    return this.props.players.find(p =>
      p.playerName === this.props.playerName
    );
  }

  setInitialGameState() {
    const gameStateRef = new Firebase(`https://avalonline.firebaseio.com/games/${this.props.roomCode}/gameState`);
    gameStateRef.once("value", (snapshot) => {
      const gameState = snapshot.val();;
      if (!gameState || !gameState.questLeader) {
        gameStateRef.update({questLeader: _.sample(this.props.players).playerName});
      }
      if (!gameState || !gameState.numProposals) {
        gameStateRef.update({numProposals: 0});
      }
    });
  }

  componentDidMount() {
    const gameStateRef = new Firebase(`https://avalonline.firebaseio.com/games/${this.props.roomCode}/gameState`);
    gameStateRef.on("value", (snapshot) => {
      this.setState({'gameState': snapshot.val()})
    });

    this.setInitialGameState();
  }

  // the game state that is always displayed
  getPermanentGameState() {
    if (!this.state.gameState) return null;

    return (
      <div>
        <div>
          numProposals: {this.state.gameState.numProposals}
        </div>
        <div>
          questLeader: {this.state.gameState.questLeader}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <h1>Game Room</h1>
        { this.getPermanentGameState() }
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <h2>Up name q: <span className='bold'>{ this.props.playerName }</span></h2>
        <h2>Up role q: <span className='bold'>{ this.getCurrentPlayer().role }</span></h2>
        <YourInfo
          players={this.props.players}
          playerName={this.props.playerName}
        />
        <RoleList
          playerCount={this.props.players.length}
        />
      </div>
    );
  }
}

GameRoom.propTypes = propTypes;
