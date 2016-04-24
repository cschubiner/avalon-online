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
    const roleNames = globals.roleNamesForPlayerCount(this.props.playerCount).sort((t1, t2) => {
      if (globals.roleIsEvil(t1) === globals.roleIsEvil(t2)) {
        return t1 > t2;
      }
      if (globals.roleIsEvil(t1)) {
        return -1;
      }
      return 1;
    });

    let i = 0;
    const roles = [];
    roleNames.forEach((role) => {
      const isLast = i == roleNames.length - 1;
      i += 1;
      roles.push(
        <span className={globals.roleIsEvil(role) ? 'evil' : 'good'}>
          { role }{ !isLast ? ', ' : ''}
        </span>
      );
    });

    return (
      <div>
        <h3> Roles </h3>
        { roles }
      </div>
    );
  }
}

RoleList.propTypes = propTypes;
