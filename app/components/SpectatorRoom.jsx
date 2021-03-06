import React, { PropTypes } from 'react';
import Firebase from 'firebase';
import _ from 'lodash';
import globals from '../globals.js'
import RoleList from './RoleList.jsx';
import YourInfo from './YourInfo.jsx';

const propTypes = {
  roomCode: PropTypes.string.isRequired,
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
        lastProposedPlayers: [],
        questResults: ["N/A", "N/A", "N/A", "N/A", "N/A"],
        questVoteResults: [],
        questVotePlayersWhoVoted: [],
        lastQuestVoteResults: "n/a",
        isProposalVoting: false,
        // proposalVotes: {},
        // lastProposalVotes: {},
        isQuestVoting: false,
      },
    }
  }

  componentDidMount() {
    const gameStateRef = new Firebase(`https://avalonline.firebaseio.com/games/${this.props.roomCode}/gameState`);
    gameStateRef.on("value", snapshot => {
      this.setState({'gameState': snapshot.val()})
    });
  }


  numPlayersOnQuests() {
    return globals.numPlayersOnQuests(this.props.players.length);
  }

  getQuestCircles() {
    // this.state.gameState.questResults
    const circles = [];
    let i = 0;
    globals.numPlayersOnQuests(this.props.players.length).forEach( numPlayers => {
      const questFailed = this.state.gameState.questResults[i] === 'Fail';
      const questSucceeded = this.state.gameState.questResults[i] === 'Pass';
      const twoFailsNeeded = globals.numFailsToFail(i, this.props.players.length) == 2;
      circles.push(
        <div className={`numberCircle ${questFailed ? 'failedQuest' : (questSucceeded ? 'succeededQuest' :'')}`}>
          {numPlayers}{ twoFailsNeeded ? '*' : ''}
        </div>
      );

      i += 1;
    });
    return circles;
  }

  // the game state that is always displayed
  getPermanentGameStateDiv() {
    if (!this.state.gameState) return null;

    return (
      <div>
        { this.getQuestCircles() }
        <div className='failed-proposals flex-center-horiz'>
          <span>Number Failed Proposals: {this.state.gameState.numProposals}/5</span>
        </div>
      </div>
    );
  }

  sortedPlayers() {
    return this.props.players.sort( (p1, p2) => {
      return p1.playerName.localeCompare(p2.playerName);
    });
  }

  playerIsAProposedPlayer(playerName) {
      return globals.fbArr(this.state.gameState.proposedPlayers).includes(playerName);
  }

  getPlayerList() {
    let players = [];

    this.sortedPlayers().forEach( player => {
      const isLeader = player.playerName === this.state.gameState.questLeader;

      let postSpan;
      if (this.state.gameState.lastProposalVotes) {
        const lastVote = this.state.gameState.lastProposalVotes[player.playerName];
        postSpan = (
          <span>
            {'(last vote: '}
            <span className={lastVote === 'Approve' ? 'blue' : 'yellow'}>
              {`${lastVote}`}
            </span>)
            </span>
        );
      }

      players.push(
        <div className="checkbox-div">
          <span className={"checkboxtext" + (isLeader ? " bold" : "") + (this.playerIsAProposedPlayer(player.playerName) ? " green" : "")} >
            {isLeader ? '-' : ''} { player.playerName } {postSpan}
          </span>
          <br/>
        </div>
      );

    });

    return (
      <form>
        { players }
        <br/>
      </form>
    );

  }

  getNumPlayersWhoHaveProposalVoted() {
    var voteCount = 0;
    for (var key in this.state.gameState.proposalVotes) {
      if (this.state.gameState.proposalVotes.hasOwnProperty(key)) {
        // alert(key + " -> " + this.state.gameState.proposalVotes[key]);
        if (this.state.gameState.proposalVotes[key] != "n/a") {
          voteCount += 1;
        }
      }
    }
    return voteCount;
  }

  haveAllPlayersProposalVoted() {
    return this.getNumPlayersWhoHaveProposalVoted() === this.props.players.length;
  }

  playerIsAProposedPlayer(playerName) {
      return globals.fbArr(this.state.gameState.proposedPlayers).includes(playerName);
  }

  renderGameMessage() {
    if (!this.state.gameState.gameMessage) return null;

    const msgType = this.state.gameState.gameMessageType;
    let messageClass = globals.MESSAGE_NEUTRAL;
    if (msgType) {
      messageClass = msgType;
    }
    return (
      <h4 className={`gameMessage ${messageClass}`}>{this.state.gameState.gameMessage}</h4>
    );
  }

  renderNextActionMessage() {
    if (!this.state.gameState.nextActionMessage) return null;

    const messageClass = globals.MESSAGE_NEUTRAL;

    return (
      <h4 className={`gameMessage ${messageClass}`}>{this.state.gameState.nextActionMessage}</h4>
    );
  }


  render() {
    const recentVoteResults = (
      <h3>Most Recent Vote Results: { this.state.gameState.lastQuestVoteResults }</h3>
    );
    return (
      <div className={"outer-div spectator"}>
      <div className="inner-div inner-spectator">
        <div className="flex-center-horiz">
          <h1>Avalonline</h1>
          <span className='roomCode'>{this.props.roomCode}</span>
        </div>
        { this.getPermanentGameStateDiv() }
        { this.renderGameMessage() }
        { this.renderNextActionMessage() }
        <h3>{this.state.gameState.questLeader}'s Proposed Questers ({globals.fbArrLen(this.state.gameState.proposedPlayers)}/{this.numPlayersOnQuests()[this.state.gameState.currentQuestNum]}):</h3>
        { this.getPlayerList() }
        { this.state.gameState.lastQuestVoteResults !== 'n/a' ? recentVoteResults : null }
        <RoleList
          playerCount={this.props.players.length}
        />
      </div>
      </div>
    );
  }
}

GameRoom.propTypes = propTypes;
