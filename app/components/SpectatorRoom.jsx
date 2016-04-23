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

  // the game state that is always displayed
  getPermanentGameStateDiv() {
    if (!this.state.gameState) return null;

    return (
      <div>
        <div>
          Current Quest: {this.state.gameState.currentQuestNum + 1}
        </div>
        <div>
          # Players on Quests: {globals.numPlayersOnQuests.join(", ")}
        </div>
        <div>
          Quest Results: {this.state.gameState.questResults.join(", ")}
        </div>
        <div>
          # Failed Proposals: {this.state.gameState.numProposals}/5
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

      let postStr = ""
      if (this.state.gameState.lastProposalVotes) {
        postStr = ` (last vote: ${this.state.gameState.lastProposalVotes[player.playerName]})`
      }

      players.push(
        <div className="checkbox-div">
          <input type="checkbox" name="??" value={ player.playerName }
            checked={this.playerIsAProposedPlayer(player.playerName) ? true : false} className='checkbox'/>
          <span className={"checkboxtext" + (isLeader ? " bold" : "")} >
            { player.playerName + postStr }
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

  getProposalVoteDiv() {
    // console.log(this.state.gameState.isProposalVoting);
    if (!this.state.gameState.isProposalVoting) {

      if (this.state.gameState.isQuestVoting) {

        const questButtons = (
          <div>
            <button type="button" onClick={this.handleQuestVote.bind(this, true)}>
              Pass
            </button>
            <button type="button" onClick={this.handleQuestVote.bind(this, false)}>
              Fail
            </button>
          </div>
        );

      // this.state.gameState.isQuestVoting
      // if is quest voting and current player is part of proposed quests list, show questButtons

        const proposedPlayers = globals.fbArr(this.state.gameState.proposedPlayers);
        const questVotePlayersWhoVoted = globals.fbArr(this.state.gameState.questVotePlayersWhoVoted);
        const shouldShowVoteButtons = proposedPlayers.indexOf(this.getCurrentPlayer().playerName) != -1 && questVotePlayersWhoVoted.indexOf(this.getCurrentPlayer().playerName) == -1;

        let questVoteResults = globals.fbArr(this.state.gameState.questVoteResults);
        if (questVoteResults.length == globals.numPlayersOnQuests[this.state.gameState.currentQuestNum]) {
          this.updateCurrentState({ isQuestVoting: false });

          this.updateCurrentState({ questVoteResults: [] });
          this.updateCurrentState({ questVotePlayersWhoVoted: [] });

          this.updateCurrentState({ lastQuestVoteResults: _.shuffle(questVoteResults).join(", ") });

          this.advanceQuestLeader();

          let passes = 0;
          let fails = 0;
          questVoteResults.forEach( res => {
            if (res === "Pass") {
              passes += 1;
            } else {
              fails += 1;
            }
          });

          let tempResults = this.state.gameState.questResults;
          const currentQuestNum = this.state.gameState.currentQuestNum
          if (fails > 0) {
            tempResults[currentQuestNum] = "Fail";
          } else {
            tempResults[currentQuestNum] = "Pass";
          }
          this.updateCurrentState({ numProposals: 0 });
          this.updateCurrentState({ questResults: tempResults });
          this.updateCurrentState({ currentQuestNum: currentQuestNum + 1 });

        } else {
          return shouldShowVoteButtons ? questButtons : null;
        }
      } else {
        return <div/>;
      }

    } else {

      const haveIVoted = this.state.gameState.proposalVotes[this.getCurrentPlayer().playerName] != "n/a"

      const proposalButtons = (
        <div>
          <button type="button" onClick={this.handleProposalVote.bind(this, true)}>
            Approve
          </button>
          <button type="button" onClick={this.handleProposalVote.bind(this, false)}>
            Reject
          </button>
        </div>
      );

      const voteCountHeader = <h3>Votes ({ this.getNumPlayersWhoHaveProposalVoted() }/{this.props.players.length})</h3>

      return (
        <div>
          { this.haveAllPlayersProposalVoted() ? null : voteCountHeader }
          { haveIVoted ? null : proposalButtons }
        </div>
      );
    }
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


  render() {
    return (
      <div className={"outer-div spectator"}>
      <div className="inner-div">
        <h1>Hand Room: {this.props.roomCode}</h1>
        { this.getPermanentGameStateDiv() }
        <h3>Proposed Questees by {this.state.gameState.questLeader} ({globals.fbArrLen(this.state.gameState.proposedPlayers)}/{globals.numPlayersOnQuests[this.state.gameState.currentQuestNum]}):</h3>
        { this.getPlayerList() }
        { this.getProposalVoteDiv() }
        <h3>Most Recent Vote Results: { this.state.gameState.lastQuestVoteResults }</h3>
        <RoleList
          playerCount={this.props.players.length}
        />
      </div>
      </div>
    );
  }
}

GameRoom.propTypes = propTypes;
