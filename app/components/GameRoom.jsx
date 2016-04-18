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

  render() {
    return (
      <div>
        <h1>Game Room</h1>
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
