import React from 'react';
import JoinRoom from './JoinRoom.jsx';
import Firebase from 'firebase';
import _ from 'lodash';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOnMainMenu: true,
      rooms: [],
      currentRoomCode: null,
    }
  }

  componentDidMount() {

    const ref = new Firebase(`https://avalonline.firebaseio.com/games`);
    ref.on("value", (snapshot) => {
      let rooms = [];
      snapshot.forEach((childSnapshot) => {
        let key = childSnapshot.key();
        let childData = childSnapshot.val();
        rooms.push(childData);
      });
      this.setState({'rooms': rooms});
    });

  }

  getNewRoomCode() {
    return this.randomString(4);
  }

  randomString(length) {
    var mask = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
    return result;
  }

  gameClicked(roomCode) {
    this.setState({ isOnMainMenu: false })

    // null roomCode means New Game was clicked and we need to create a new room
    if (roomCode == null) {
      roomCode = this.getNewRoomCode();
    }

    this.setState({ currentRoomCode: roomCode })

    const fbGame = new Firebase(`https://avalonline.firebaseio.com/games/${roomCode}`);
    const roomCodeObj = {
      'roomCode': roomCode,
    };

    fbGame.update(roomCodeObj);
    this.setState(roomCodeObj);
  }

  getMainMenu() {
    return (
      <div>
        <button type="button" onClick={this.gameClicked.bind(this, null)}>
          New Game
        </button>
        <br/>
        <br/>
        <p> Or join an existing game: </p>
        { this.getRoomList() }
      </div>
    );
  }

  getRoomList() {
    let rooms = [];
    this.state.rooms.forEach( (roomData) => {
      rooms.push(
        <div>
          <button type="button" onClick={this.gameClicked.bind(this, roomData.roomCode )}>
            { roomData.roomCode }
          </button>
        </div>
      );
    });

    return rooms;
  }

  getWaitingRoomScreen() {
    return <JoinRoom
      roomCode={this.state.currentRoomCode}
    />;
  }

  render() {

    if (this.state.isOnMainMenu) {
      return this.getMainMenu();
    } else { // IN_GAME
      return this.getWaitingRoomScreen();
    }

  }
}
