import React from 'react';
import JoinRoom from './JoinRoom.jsx';
import Firebase from 'firebase';
import GameRoom from './GameRoom.jsx'; //delete!
import SpectatorRoom from './SpectatorRoom.jsx'; //delete!
import _ from 'lodash';
import queryString from 'query-string';
import globals from '../globals.js'
const amplifyStore = require('amplify-store');


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOnMainMenu: true,
      roomCodes: [],
      currentRoomCode: null,
      players: [], //delete
      wantsToJoinLastHand: false,
    }
  }

  getURLParams() {
    return queryString.parse(location.search);
  }

  cleanupOldRooms() {
    var ref = new Firebase('https://avalonline.firebaseio.com/games');
    var now = Date.now();
    var cutoff = now - 4 * 60 * 60 * 1000;
    var old = ref.orderByChild('timestamp').startAt(cutoff).limitToLast(1);
    var listener = old.on('child_added', function(snapshot) {
        snapshot.ref().remove();
    });
  }

  componentDidMount() {
    this.cleanupOldRooms();

    const ref = new Firebase(`https://avalonline.firebaseio.com/games`);
    ref.on("value", (snapshot) => {
      let rooms = [];
      snapshot.forEach((childSnapshot) => {
        const room = childSnapshot.val();
        const roomCode = room.roomCode;
        const currTimeInMs = Date.now();
        if (true) {
        // if (room.dateCreated >= currTimeInMs - 1000*60*60*24*1) {
          rooms.push(room);
        }
      });

      const roomCodes = rooms.sort((a,b) => {
        return b.dateCreated - a.dateCreated;
      }).map(r => r.roomCode);
      this.setState({'roomCodes': roomCodes});
    });

    if (this.getURLParams().debug) {
      this.populatePlayerState();
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
      'dateCreated': Date.now(),
    };

    fbGame.update(roomCodeObj);
    this.setState(roomCodeObj);
  }

  lastHandClicked(lastHandState) {
    this.setState(lastHandState);
    this.wantsToJoinLastHand=true;
    this.roomCode=lastHandState.roomCode;
    this.setState({ wantsToJoinLastHand: true })
    this.populatePlayerState();
  }

  getMainMenu() {
    const lastHandState = amplifyStore(globals.lastHandStore);
    const lastHand = (
      <button type="button" onClick={this.lastHandClicked.bind(this, lastHandState)}>
        Join last hand
      </button>
    );

    return (
      <div>
        <h2>Avalonline 2.0</h2>
        { lastHandState ? lastHand : null }
        Create a new game:
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
    this.state.roomCodes.forEach( (roomCode) => {
      rooms.push(
        <div className='roomButtonDiv'>
          <button type="button" onClick={this.gameClicked.bind(this, roomCode )}>
            { roomCode }
          </button>
        </div>
      );
    });

    return rooms;
  }

  getDefaultRoomCode() {
    if (this.wantsToJoinLastHand || this.state.wantsToJoinLastHand) {
      return this.roomCode ? this.roomCode : this.state.roomCode;
    }
    return this.getURLParams().roomCode ? this.getURLParams().roomCode : 'cary';
  }

  //if debug==true vvvvvv -----------------------------------------------------------------------------------------------
  populatePlayerState() {
    const ref = new Firebase(`https://avalonline.firebaseio.com/games/${this.getDefaultRoomCode()}/players`);
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
        roomCode={this.getDefaultRoomCode()}
        playerName={this.state.wantsToJoinLastHand ? this.state.playerName : this.getURLParams().playerName}
        players={this.state.players}
      />
    );
  }

  getSpectatorRoom() {
    return (
      <SpectatorRoom
        roomCode={this.getDefaultRoomCode()}
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
    if (this.getURLParams().debug || this.state.wantsToJoinLastHand) {
      if (this.getURLParams().isSpectator || this.state.isSpectator) {
        return this.getSpectatorRoom();
      }
      return this.getGameRoom();
    }

    if (this.state.isOnMainMenu) {
      return this.getMainMenu();
    } else { // IN_GAME
      return this.getWaitingRoomScreen();
    }
  }
}
