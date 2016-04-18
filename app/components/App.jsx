import React from 'react';
import WaitingRoom from './WaitingRoom.jsx';
import Firebase from 'firebase';
import _ from 'lodash';


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameState: "MAIN_MENU",
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

      rooms.forEach((hi) => {
        console.log(hi);
      })
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

  joinExistingHandClicked() {
    this.setState({ gameState: "JOIN_MENU" })

    // let a = fbGame.value();
    // console.log(a);
  }

  getMainMenu() {
    return (
      <div>
        <button type="button" onClick={this.newGameClicked.bind(this)}>
          New Game
        </button>

        <button type="button" onClick={this.joinExistingHandClicked.bind(this)}>
          Join Existing Hand
        </button>
      </div>
    );
  }

  getRoomList() {
    let rooms = [];
    this.state.rooms.forEach( (roomData) => {
      rooms.push(<li> { roomData.roomCode } </li>);
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
    return <WaitingRoom
      roomCode='jizz'
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
