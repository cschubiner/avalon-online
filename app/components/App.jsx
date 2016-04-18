import React from 'react';
import JoinRoom from './JoinRoom.jsx';
import Firebase from 'firebase';
import _ from 'lodash';


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameState: "MAIN_MENU",
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
    return _.sample(
      ['jizz', 'bang', 'joks', 'cary', 'a', 'b', 'c', 'd', 'e', 'f']
    );
  }

  newGameClicked() {
    this.setState({ gameState: "IN_GAME" })
    const roomCode = this.getNewRoomCode();
    const fbGame = new Firebase(`https://avalonline.firebaseio.com/games/${roomCode}`);
    const roomCodeObj = {
      'roomCode': roomCode,
    };

    fbGame.set(roomCodeObj);
    this.setState(roomCodeObj);
  }

  joinGameClicked(roomCode) {
    this.setState({ gameState: "IN_GAME", currentRoomCode: roomCode })

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
        <button type="button" onClick={this.newGameClicked.bind(this)}>
          New Game
        </button>
        <br/>
        <br/>
        { this.getRoomList() }
      </div>
    );
  }

  getRoomList() {
    let rooms = [];
    this.state.rooms.forEach( (roomData) => {
      rooms.push(
        <div>
          <button type="button" onClick={this.joinGameClicked.bind(this, roomData.roomCode )}>
            { roomData.roomCode }
          </button>
        </div>
      );
    });

    return rooms;
  }

  getJoinMenu() {
    return (
      <div>
        { this.getRoomList() }
      </div>
    );
  }

  getWaitingRoomScreen() {
    return <JoinRoom
      roomCode={this.state.roomCode}
      // roomCode={this.state.roomCode}
      playerName='Clay'
    />;
  }

  render() {

    if (this.state.gameState == "MAIN_MENU") {
      return this.getMainMenu();
    } else if (this.state.gameState == "JOIN_MENU") {
      return this.getJoinMenu();
    } else { // IN_GAME
      return this.getWaitingRoomScreen();
    }

    // return (
    //   <div>
    //     // { this.state.gameState == "MAIN_MENU" ? this.getMainMenu() : this.getJoinMenu() }
    //     if (this.state.gameState == "MAIN_MENU") {
    //       this.getMainMenu()
    //     } else if (this.state.gameState == "JOIN_MENU") {
    //       this.getJoinMenu()
    //     } else { // IN_GAME
    //       this.getGameScreen()
    //     }
    //   </div>
    // );
  }
}
