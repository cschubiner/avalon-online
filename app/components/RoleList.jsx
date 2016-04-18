import React, { PropTypes } from 'react';
import Firebase from 'firebase';
import _ from 'lodash';

const propTypes = {
  players: PropTypes.object.isRequired,
};

export default class RoleList extends React.Component {
  constructor() {
    super();
    this.state = {
    }
  }

  render() {
    let roles = ['Merlin', 'Morgana', 'Percival', 'Assassin', 'Villager'];
    return (
      <div>
        <h3> Roles </h3>
        <p> Go to avalonline.com and enter the room code to join! </p>
      </div>
    );
  }
}

RoleList.propTypes = propTypes;
