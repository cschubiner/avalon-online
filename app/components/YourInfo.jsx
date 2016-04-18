import React, { PropTypes } from 'react';
import Firebase from 'firebase';
import _ from 'lodash';
import globals from '../globals.js'

const propTypes = {
  playerName: PropTypes.string.isRequired,
  players: PropTypes.array.isRequired,
};

export default class YourInfo extends React.Component {
  constructor() {
    super();
    this.state = {
    }
  }

  getRoleRow(role, playerName=null) {
    let nameSpan;
    if (playerName) {
      nameSpan = <span className='black'>{ playerName }</span>
    }
    return (
      <li className={globals.roleIsEvil(role) ? 'evil' : 'good'}>
        <span>{ role } </span>{nameSpan}
      </li>
    );
  }

  getPlayerNameForRole(role) {
    return this.props.players.find(p =>
      p.role.toUpperCase() === role.toUpperCase()
    ).playerName;
  }

  getCurrentPlayer() {
    return this.props.players.find(p =>
      p.playerName === this.props.playerName
    );
  }

  getRoles(roleNames) {
    return roleNames.map((role) => {
      this.getRoleRow(role);
    });
  }

  getRolesAndPlayerNames(roleNames) {
    const currentPlayer = this.getCurrentPlayer();
    const currentRole = currentPlayer.role;
    const showEvil = ['MERLIN', 'MORGANA', 'MINION', 'ASSASSIN'].includes(currentRole.toUpperCase());
    const showMerlinMorgana = ['PERCIVAL'].includes(currentRole.toUpperCase());

    return roleNames.map((role) => {
      let showName = false;
      if (['MERLIN', 'MORGANA'].includes(role.toUpperCase()) && showMerlinMorgana) {
        showName = true;
      }
      if (globals.roleIsEvil(role) && showEvil) {
        showName = true;
      }
      return this.getRoleRow(role, showName ? this.getPlayerNameForRole(role) : null);
    });
  }

  render() {
    const currentPlayer = this.getCurrentPlayer();
    // const currentRole = 'MORGANA';
    const currentRole = currentPlayer.role;

    if (['VILLAGER'].includes(currentRole.toUpperCase())) {
      return null;
    }

    let playerNames;

    if (['PERCIVAL'].includes(currentRole.toUpperCase())) {
      playerNames = this.props.players.filter(p => {
        return ['MERLIN', 'MORGANA'].includes(p.role.toUpperCase())
      })
    }

    if (['MERLIN', 'MORGANA', 'MINION', 'ASSASSIN'].includes(currentRole.toUpperCase())) {
      playerNames = this.props.players.filter(p => {
        return globals.roleIsEvil(p.role)
      })
    }
    playerNames = playerNames.map(p => {
      return p.playerName
    });
    playerNames = _.shuffle(playerNames).map(playerName => {
      return <div>
        {playerName}
      </div>
    });

    let message = 'The following people are evil:';
    if (['PERCIVAL'].includes(currentRole.toUpperCase())) {
      message = 'The following people are Merlin/Morgana:'
    }
    return (
      <div>
        <h3> Secret information </h3>
        <div>
          { message }
          <ul>
            {playerNames}
          </ul>
        </div>
      </div>
    );
  }
}

YourInfo.propTypes = propTypes;
