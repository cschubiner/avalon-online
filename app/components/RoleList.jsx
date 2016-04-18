import React, { PropTypes } from 'react';
import Firebase from 'firebase';
import _ from 'lodash';
import globals from '../globals.js'

const propTypes = {
  playerCount: PropTypes.number.isRequired,
};

export default class RoleList extends React.Component {
  constructor() {
    super();
    this.state = {
    }
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

    const roles = roleNames.map((role) => {
      return (
        <li className={globals.roleIsEvil(role) ? 'evil' : 'good'}>
          { role }
        </li>
      );
    });

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
