import React from 'react';
import JoinRoom from './JoinRoom.jsx';
import Firebase from 'firebase';
import GameRoom from './GameRoom.jsx'; //delete!
import _ from 'lodash';
import queryString from 'query-string';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOnMainMenu: true,
      rooms: [],
      currentRoomCode: null,
      players: [], //delete
    }
  }

  getURLParams() {
    return queryString.parse(location.search);
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

    if (this.getURLParams().debug) {
      this.populatePlayerState(); //delete!
    }
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

  //if debug==true vvvvvv -----------------------------------------------------------------------------------------------
  populatePlayerState() {
    const ref = new Firebase(`https://avalonline.firebaseio.com/games/cary/players`);
    ref.on("value", (snapshot) => {
      let players = [];
      snapshot.forEach((childSnapshot) => {
        let key = childSnapshot.key();
        let childData = childSnapshot.val();
        players.push(childData);
      });
      this.setState({'players': players});
    });
  }
  getGameRoom() {
    if (this.state.players.length < 3) return null;
    return (
      <GameRoom
        roomCode={this.getURLParams().roomCode ? this.getURLParams().roomCode : 'cary'}
        isSpectator={this.getURLParams().isSpectator ? true : false}
        playerName={this.getURLParams().playerName}
        players={this.state.players}
      />
    );
  }
  //end if debug==true ^^^^^ -----------------------------------------------------------------------------------------------

  getWaitingRoomScreen() {
    return <JoinRoom
      roomCode={this.state.currentRoomCode}
    />;
  }

  render() {
    if (this.getURLParams().debug) {
      return this.getGameRoom();
    }

    if (this.state.isOnMainMenu) {
      return this.getMainMenu();
    } else { // IN_GAME
      return this.getWaitingRoomScreen();
    }

  }
}
