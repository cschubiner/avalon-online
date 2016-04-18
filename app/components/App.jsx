import React from 'react';
import WaitingRoom from './WaitingRoom.jsx';
import Firebase from 'firebase';
import _ from 'lodash';


export default class App extends React.Component {
  constructor(props) {
    super(props);
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
    const roomCodeObj = {
      'roomCode': roomCode,
    };

    fbGame.set(roomCodeObj);
    this.setState(roomCodeObj);
  }

  waitingroom () {
    return <WaitingRoom
      roomCode='jizz'
      // roomCode={this.state.roomCode}
      playerName='Clay'
    />;
  }

  render() {
    return this.waitingroom();
    return (
      <div>
        <button type="button" onClick={this.newGameClicked.bind(this)}>
          New Game
        </button>
      </div>
    );
  }
}
