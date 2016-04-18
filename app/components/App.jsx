import React from 'react';
import Note from './Note.jsx';
import Firebase from 'firebase';
import _ from 'lodash';


export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
    }
  }

  componentDidMount() {
    // this.currentTrackURIRef.on("value", (dataSnapshot) => {
    //   let trackURI = dataSnapshot.val();
    //   console.log(trackURI);
    // });
  }

  getNewRoomCode() {
    return _.sample(
      ['jizz', 'bang', 'joks', 'cary']
    );
  }

  newGameClicked() {
    const roomCode = this.getNewRoomCode();
    const fbGame = new Firebase(`https://avalonline.firebaseio.com/games/${roomCode}`);
    fbGame.set({
      'roomCode': roomCode,
    });
  }

  render() {
    return (
      <div>
        <button type="button" onClick={this.newGameClicked.bind(this)}>
          New Game
        </button>
      </div>
    );
  }
}
