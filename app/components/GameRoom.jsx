import React, { PropTypes } from 'react';
import Firebase from 'firebase';
import _ from 'lodash';
import globals from '../globals.js'
import RoleList from './RoleList.jsx';
import YourInfo from './YourInfo.jsx';

const propTypes = {
  roomCode: PropTypes.string.isRequired,
  playerName: PropTypes.string.isRequired,
  isSpectator: PropTypes.bool.isRequired,
  players: PropTypes.array.isRequired,
};

export default class GameRoom extends React.Component {
  constructor() {
    super();
    this.state = {
      gameState: {
        numProposals: 0,
        currentQuestNum: 0,
        questLeader: null,
        proposedPlayers: [],
        questResults: ["N/A", "N/A", "N/A", "N/A", "N/A"],
        isProposalVoting: false,
        isQuestVoting: false,
      },
    }
  }

  // this is the controlling player. it is the player that corresponds to this browser
  getCurrentPlayer() {
    return this.props.players.find(p =>
      p.playerName === this.props.playerName
    );
  }

  setInitialGameState() {
    const gameStateRef = new Firebase(`https://avalonline.firebaseio.com/games/${this.props.roomCode}/gameState`);
    gameStateRef.once("value", (snapshot) => {
      const gameState = snapshot.val();
      if (!gameState || !gameState.questLeader) {
        gameStateRef.update({questLeader: _.sample(this.props.players).playerName});
      }
      if (!gameState || !gameState.numProposals) {
        gameStateRef.update({numProposals: 0});
      }
      if (!gameState || !gameState.currentQuestNum) {
        gameStateRef.update({currentQuestNum: 0});
      }
      if (!gameState || !gameState.proposedPlayers) {
        gameStateRef.update({proposedPlayers: []});
      }
      if (!gameState || !gameState.questResults) {
        gameStateRef.update({questResults: ["N/A", "N/A", "N/A", "N/A", "N/A"]});
      }
      if (!gameState || !gameState.isProposalVoting) {
        gameStateRef.update({isProposalVoting: false});
      }
      if (!gameState || !gameState.isQuestVoting) {
        gameStateRef.update({isQuestVoting: false});
      }
    });
  }

  componentDidMount() {
    const gameStateRef = new Firebase(`https://avalonline.firebaseio.com/games/${this.props.roomCode}/gameState`);
    gameStateRef.on("value", (snapshot) => {
      this.setState({'gameState': snapshot.val()})
    });

    this.setInitialGameState();
  }

  advanceQuestLeader(e) {
    if (e != null) {
      e.preventDefault();
    }
    let newLeader = null;
    let i = 0;
    this.sortedPlayers().forEach( player => {
      if (player.playerName === this.state.gameState.questLeader) {
        if (i == this.sortedPlayers().length - 1) {
          newLeader = this.sortedPlayers()[0];
        } else {
          newLeader = this.sortedPlayers()[i + 1];
        }
      }
      i += 1;
    });
    this.updateCurrentState({ questLeader: newLeader.playerName })
  }

  updateCurrentState(updatedState) {
    const gameStateRef = new Firebase(`https://avalonline.firebaseio.com/games/${this.props.roomCode}/gameState`);
    gameStateRef.update(updatedState);
  }

  // the game state that is always displayed
  getPermanentGameStateDiv() {
    if (!this.state.gameState) return null;

    return (
      <div>
        <div>
          currentQuestNum: {this.state.gameState.currentQuestNum + 1}
        </div>
        <div>
          numPlayersOnQuests: {globals.numPlayersOnQuests.join(", ")}
        </div>
        <div>
          questResults: {this.state.gameState.questResults.join(", ")}
        </div>
        <div>
          numProposals: {this.state.gameState.numProposals}
        </div>
        <div>
          questLeader: {this.state.gameState.questLeader}
        </div>
      </div>
    );
  }

  sortedPlayers() {
    return this.props.players.sort( (p1, p2) => {
      return p1.playerName.localeCompare(p2.playerName);
    });
  }

  // true if you are the quest leader, false otherwise
  isMeQuestLeader() {
    return this.getCurrentPlayer().playerName == this.state.gameState.questLeader
  }

  selectedPlayer(e) {
    // if the current player is not the quest leader, they can't check anything
    if (!this.isMeQuestLeader()) {
      e.preventDefault;
    } else {

      if (e.target.checked) {
        if (globals.fbArrLen(this.state.gameState.proposedPlayers) < globals.numPlayersOnQuests[this.state.gameState.currentQuestNum]) {

          let tempPlayers = globals.fbArr(this.state.gameState.proposedPlayers);

          tempPlayers.push(e.target.value)
          this.updateCurrentState({ proposedPlayers: tempPlayers })
        }
      } else {

        let tempPlayers = globals.fbArr(this.state.gameState.proposedPlayers);

        const ind = tempPlayers.indexOf(e.target.value);

        tempPlayers.splice(ind, 1);

        this.updateCurrentState({ proposedPlayers: tempPlayers })
      }

    }

  }

  getPlayerList() {

    let players = [];

    this.sortedPlayers().forEach( player => {
      const isLeader = player.playerName === this.state.gameState.questLeader
      const isAProposedPlayer = globals.fbArr(this.state.gameState.proposedPlayers).includes(player.playerName)

      players.push(
        <div>
          <input type="checkbox" name="??" value={ player.playerName } onClick={this.selectedPlayer.bind(this)}
          checked={isAProposedPlayer ? true : false} />
            <span className={ isLeader ? "bold" : ""}>{ player.playerName }</span>
          <br/>
        </div>
      );

    });

    return (
      <form>
        { players }
        {(this.isMeQuestLeader() ? <input type="submit" value="Propose Quest" onClick={this.advanceQuestLeader.bind(this)} /> : <span/>)}
      </form>
    );

  }

  handleProposeClicked(e) {
    e.preventDefault();
    this.advanceQuestLeader();

    this.updateCurrentState({ isProposalVoting: true })
  }

  handleProposalVote(votedYes, e) {
    e.preventDefault();

    this.updateCurrentState({ isProposalVoting: false })

    if (this.state.playerName.length <= 2 || this.state.playerName.length >= 21) {
      alert("Your name must be between 3 and 20 characters.");
    } else {
      this.setState({ playerName: this.state.playerName.trim(), isOnJoinRoom: false, isSpectator: isSpectator })
    }
  }

  getProposalVoteDiv() {
    console.log(this.state.gameState.isProposalVoting);
    if (!this.state.gameState.isProposalVoting) {
      return <div/>
    } else {
      return (
        <div>
          <button type="button" onClick={this.handleProposalVote.bind(this, true)}>
            Approve
          </button>
          <button type="button" onClick={this.handleProposalVote.bind(this, false)}>
            Reject
          </button>
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        <h1>Hand Room: {this.props.roomCode}</h1>
        { this.getPermanentGameStateDiv() }
        <h3>Proposed Questees ({globals.fbArrLen(this.state.gameState.proposedPlayers)}/{globals.numPlayersOnQuests[this.state.gameState.currentQuestNum]}):</h3>
        { this.getPlayerList() }
        <br/>
        { this.getProposalVoteDiv() }
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <h2>Up name q: <span className='bold'>{ this.props.playerName }</span></h2>
        <h2>Up role q: <span className='bold'>{ this.getCurrentPlayer().role }</span></h2>
        <YourInfo
          players={this.props.players}
          playerName={this.props.playerName}
        />
        <RoleList
          playerCount={this.props.players.length}
        />
      </div>
    );
  }
}

GameRoom.propTypes = propTypes;
