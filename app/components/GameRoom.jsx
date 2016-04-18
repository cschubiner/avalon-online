import React, { PropTypes } from 'react';
import Firebase from 'firebase';
import _ from 'lodash';
import globals from '../globals.js'
import RoleList from './RoleList.jsx';

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

  render() {
    return (
      <div>
        <h1> Game Room </h1>
        <RoleList
          playerCount={this.props.players.length}
          players={this.props.players}
          playerName={this.props.playerName}
        />
      </div>
    );
  }
}

GameRoom.propTypes = propTypes;
