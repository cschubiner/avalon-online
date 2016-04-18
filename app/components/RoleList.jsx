import React, { PropTypes } from 'react';
import Firebase from 'firebase';
import _ from 'lodash';
import globals from '../globals.js'

const propTypes = {
  playerCount: PropTypes.number.isRequired,
  playerName: PropTypes.string,
  players: PropTypes.array,
};

export default class RoleList extends React.Component {
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
      p.role === role
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
    const roleNames = globals.roleListForPlayerCount(this.props.playerCount).sort((t1, t2) => {
      if (globals.roleIsEvil(t1) === globals.roleIsEvil(t2)) {
        return t1 > t2;
      }
      if (globals.roleIsEvil(t1)) {
        return -1;
      }
      return 1;
    });

    const roles = this.props.players ? this.getRolesAndPlayerNames(roleNames) : this.getRoles(roleNames);

    return (
      <div>
        <h3> Roles </h3>
        <ul>
          { roles }
        </ul>
        <p> Go to avalonline.com and enter the room code to join! </p>
      </div>
    );
  }
}

RoleList.propTypes = propTypes;
