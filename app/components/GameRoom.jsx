import React, { PropTypes } from 'react';
import Firebase from 'firebase';
import _ from 'lodash';
import globals from '../globals.js'
import RoleList from './RoleList.jsx';
import YourInfo from './YourInfo.jsx';

const propTypes = {
  roomCode: PropTypes.string.isRequired,
  playerName: PropTypes.string.isRequired,
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

  // this is the controlling player. it is the player that corresponds to this browser
  getCurrentPlayer() {
    return this.props.players.find(p =>
      p.playerName === this.props.playerName
    );
  }

  amIEvil() {
    return globals.roleIsEvil(this.getCurrentPlayer().role);
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
      if (!gameState || !gameState.lastProposedPlayers) {
        gameStateRef.update({lastProposedPlayers: []});
      }
      if (!gameState || !gameState.questResults) {
        gameStateRef.update({questResults: ["N/A", "N/A", "N/A", "N/A", "N/A"]});
      }
      if (!gameState || !gameState.questVoteResults) {
        gameStateRef.update({ questVoteResults: [] });
      }
      if (!gameState || !gameState.questVotePlayersWhoVoted) {
        gameStateRef.update({ questVotePlayersWhoVoted: [] });
      }
      if (!gameState || !gameState.lastQuestVoteResults) {
        gameStateRef.update({ lastQuestVoteResults: "n/a" });
      }
      if (!gameState || !gameState.isProposalVoting) {
        gameStateRef.update({isProposalVoting: false});
      }

      let proposalVotes = this.getEmptyProposalVotes();
      if (!gameState || !gameState.proposalVotes) {
        gameStateRef.update({proposalVotes: proposalVotes});
        gameStateRef.update({lastProposalVotes: proposalVotes});
      }

      if (!gameState || !gameState.isQuestVoting) {
        gameStateRef.update({isQuestVoting: false});
      }
    });
  }

  getEmptyProposalVotes() {
    let proposalVotes = {}
    this.sortedPlayers().forEach( player => {
      // 'n' for null, 'Approve' for approve, 'Reject' for reject
      proposalVotes[player.playerName] = "n/a";
    });
    return proposalVotes;
  }

  componentDidMount() {
    const gameStateRef = new Firebase(`https://avalonline.firebaseio.com/games/${this.props.roomCode}/gameState`);
    gameStateRef.on("value", snapshot => {
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
    return newLeader.playerName;
  }

  numPlayersOnQuests() {
    return globals.numPlayersOnQuests(this.props.players.length);
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
          Current Quest: {this.state.gameState.currentQuestNum + 1}
        </div>
        <div>
          # Players on Quests: {this.numPlayersOnQuests().join(", ")}
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

  // true if you are the quest leader, false otherwise
  isMeQuestLeader() {
    return this.getCurrentPlayer().playerName == this.state.gameState.questLeader;
  }

  playerIsAProposedPlayer(playerName) {
      return globals.fbArr(this.state.gameState.proposedPlayers).includes(playerName);
  }

  selectedPlayer(selectedPlayerName, e) {
    // if the current player is not the quest leader, they can't check anything
    if (
      !this.isMeQuestLeader() ||
      this.state.gameState.isProposalVoting ||
      this.state.gameState.isQuestVoting
    ) {
      e.preventDefault;
      return;
    }

    console.log(selectedPlayerName);
    if (!this.playerIsAProposedPlayer(selectedPlayerName)) {
      if (globals.fbArrLen(this.state.gameState.proposedPlayers) < this.numPlayersOnQuests()[this.state.gameState.currentQuestNum]) {

        let tempPlayers = globals.fbArr(this.state.gameState.proposedPlayers);

        tempPlayers.push(selectedPlayerName)
        this.updateCurrentState({ proposedPlayers: tempPlayers })
      }
    } else {
      let tempPlayers = globals.fbArr(this.state.gameState.proposedPlayers);

      const ind = tempPlayers.indexOf(selectedPlayerName);

      tempPlayers.splice(ind, 1);

      this.updateCurrentState({ proposedPlayers: tempPlayers })
    }
  }

  setGameMessage(s, messageType = NEUTRAL) {
    this.updateCurrentState({
      gameMessage: s,
      gameMessageType: messageType,
    });
  }

  setNextActionMessage(s) {
    this.updateCurrentState({
      nextActionMessage: s,
    });
  }

  getPlayerList() {
    let players = [];

    this.sortedPlayers().forEach( player => {
      const isLeader = player.playerName === this.state.gameState.questLeader;

      if (this.haveAllPlayersProposalVoted() && this.state.gameState.isProposalVoting) {
        let passes = 0
        let fails = 0
        for (var key in this.state.gameState.proposalVotes) {
          if (this.state.gameState.proposalVotes.hasOwnProperty(key)) {
            if (this.state.gameState.proposalVotes[key] === "Approve") {
              passes += 1
            } else {
              fails += 1
            }
          }
        }

        const ratioString = `${passes}-${fails}`;
        this.updateCurrentState({ isProposalVoting: false });
        if (passes >= fails) {
          // console.log("AAAAAAAAAAAAAAAAAAA");
          this.setGameMessage(
            `Quest is approved (${ratioString})!`,
            globals.MESSAGE_GOOD
          );
          this.setNextActionMessage('Quest-goers, choose pass or fail!')
          this.updateCurrentState({ isQuestVoting: true });
        } else {
          const newLeader = this.advanceQuestLeader();
          // console.log("BBBBBBBBBBBBBBBBBBB");
          this.setGameMessage(`Quest is rejected (${ratioString})!`, globals.MESSAGE_EVIL);
          this.setNextActionMessage(`${newLeader}, propose the next quest!`)
          this.updateCurrentState({ numProposals: this.state.gameState.numProposals + 1 });
        }

        this.updateCurrentState({lastProposalVotes: this.state.gameState.proposalVotes});
        this.updateCurrentState({proposalVotes: this.getEmptyProposalVotes()});
      }

      let postStr = ""
      if (this.state.gameState.lastProposalVotes) {
        postStr = ` (last vote: ${this.state.gameState.lastProposalVotes[player.playerName]})`
      }

      players.push(
        <div className="checkbox-div">
          <input type="checkbox" name="??" value={ player.playerName } onClick={this.selectedPlayer.bind(this, player.playerName)}
            checked={this.playerIsAProposedPlayer(player.playerName) ? true : false} className='checkbox'/>
          <span className={"checkboxtext" + (isLeader ? " bold" : "")} onClick={this.selectedPlayer.bind(this, player.playerName)}>
            { player.playerName + postStr }
          </span>
          <br/>
        </div>
      );

    });

    const shouldShowProposeButton = this.isMeQuestLeader() && !this.state.gameState.isProposalVoting && !this.state.gameState.isQuestVoting

    return (
      <form>
        { players }
        <br/>
        {(shouldShowProposeButton ? <input type="submit" value="Propose Quest" onClick={this.handleProposeClicked.bind(this)} /> : null)}
      </form>
    );

  }

  handleProposeClicked(e) {
    e.preventDefault();

    if (globals.fbArrLen(this.state.gameState.proposedPlayers) == this.numPlayersOnQuests()[this.state.gameState.currentQuestNum]) {
      this.setGameMessage(
        `Quest is proposed!`,
        globals.MESSAGE_NEUTRAL
      );
      this.setNextActionMessage("Everyone, choose 'approve' or 'fail'.");
      this.updateCurrentState({ isProposalVoting: true })
    }

  }

  handleProposalVote(votedYes, e) {
    e.preventDefault();

    // this.updateCurrentState({ isProposalVoting: false })

    // console.log(this.state.gameState);

    let proposalVotes = this.state.gameState.proposalVotes;
    console.log(proposalVotes);
    proposalVotes[this.getCurrentPlayer().playerName] = votedYes ? "Approve" : "Reject";
    this.updateCurrentState({ proposalVotes: proposalVotes });

    console.log(proposalVotes);

  }

  handleQuestVote(votedPass, e) {
    e.preventDefault();
    if (!votedPass && !this.amIEvil()) {
      return;
    }
    // this.updateCurrentState({ isProposalVoting: false })

    // console.log(this.state.gameState);

    let tempResults = globals.fbArr(this.state.gameState.questVoteResults);
    tempResults.push(votedPass ? "Pass" : "Fail");
    this.updateCurrentState({ questVoteResults: tempResults });

    let tempPlayers = globals.fbArr(this.state.gameState.questVotePlayersWhoVoted);
    tempPlayers.push(this.getCurrentPlayer().playerName);
    this.updateCurrentState({ questVotePlayersWhoVoted: tempPlayers })

  }

  getProposalVoteDiv() {
    // console.log(this.state.gameState.isProposalVoting);
    if (!this.state.gameState.isProposalVoting) {
      if (this.state.gameState.isQuestVoting) {

        const questButtons = (
          <div>
            <div>You're on the quest! Choose to pass or fail</div>
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
        if (questVoteResults.length == this.numPlayersOnQuests()[this.state.gameState.currentQuestNum]) {
          this.updateCurrentState({ isQuestVoting: false });

          this.updateCurrentState({ questVoteResults: [] });
          this.updateCurrentState({ questVotePlayersWhoVoted: [] });

          this.updateCurrentState({ lastQuestVoteResults: _.shuffle(questVoteResults).join(", ") });

          const newLeader = this.advanceQuestLeader();

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
          let tempMessage = '';
          let questFailed = false;
          if (fails >= globals.numFailsToFail(currentQuestNum, this.props.players.length)) {
            questFailed = true;
            tempResults[currentQuestNum] = "Fail";
            tempMessage += `Quest fails with ${fails} fail${fails === 1 ? '' : 's'}!`;
          } else {
            tempMessage += `Quest passes with ${fails} fail${fails === 1 ? '' : 's'}!`;
            tempResults[currentQuestNum] = "Pass";
          }
          this.setGameMessage(tempMessage, questFailed ? globals.MESSAGE_EVIL : globals.MESSAGE_GOOD);
          this.setNextActionMessage(`${newLeader}, propose the next quest!`)
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

  restartHand(e) {
    e.preventDefault();

    if (confirm("Are you want to restart the game and lose all progress?")) {
      const gameStateRef = new Firebase(`https://avalonline.firebaseio.com/games/${this.props.roomCode}/gameState`);
      gameStateRef.set({});

      location.reload();
    }

  }

        // <button type="button" onClick={this.restartHand.bind(this)}>
        //   RestartHand
        // </button>
  render() {
    return (
      <div className={"outer-div"}>
      <div className="inner-div">
        <h1>Game Room: {this.props.roomCode}</h1>
        { this.getPermanentGameStateDiv() }
        <h3>Proposed Questers by {this.state.gameState.questLeader} ({globals.fbArrLen(this.state.gameState.proposedPlayers)}/{this.numPlayersOnQuests()[this.state.gameState.currentQuestNum]}):</h3>
        { this.getPlayerList() }
        { this.getProposalVoteDiv() }
        <h3>Most Recent Vote Results: { this.state.gameState.lastQuestVoteResults }</h3>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <h2>Your name is: <span className='bold'>{ this.props.playerName }</span></h2>
        <h2>Your role is: <span className='bold'>{ this.getCurrentPlayer().role }</span></h2>
        <YourInfo
          players={this.props.players}
          playerName={this.props.playerName}
        />
        <RoleList
          playerCount={this.props.players.length}
        />
      </div>
      </div>
    );
  }
}

GameRoom.propTypes = propTypes;
