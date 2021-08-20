"use strict"

const { Game } = require('./Game');
const { createCanvas } = require('canvas');


exports.TicTacToe = class extends Game {
  constructor(id, db, users, args) {
    super(id, db, users, args, [ 
    ]);

    if (this.playerList.length !== 2) {
      this.setupError += `Must have exactly 2 players. `;
    }

    this.loadState();

  }

  static getHelp() {
    return `Play a traditional game of tic-tac-toe. Specify the cell # to play.` +
    `
Options:
  None`;
  }

  loadState() { 
    //get state from db or initialize
    this.db.get(`${this.id},state`, (err, res) => {
      if (err || (res === null)) {
        //init
        this.state.board = (new Array(9)).fill('');
        this.state.playerTurn = 0;
        this.saveState();
      } else {
        //load
        this.state = JSON.parse(res);
      }
      //TODO: indidcate ready
    });
  }

  getInitialResponses() {
    const boardBuffer = this.boardToBuffer();
    const nextPlayerID = this.state.users[this.state.playerTurn];
    return {over: false, responses: [{type: 'image', content: boardBuffer}, 
      {type: 'text', content: `Your turn <@${nextPlayerID}> (you play Xs)`}]};
  }

  takeTurn(playerID, turn) { 
    if (this.state.over) {
      return {over: true, responses: [{type: 'text', content: 'The game is already over'}]};
    }

    if (!(playerID === this.state.users[this.state.playerTurn])) {
      return {over: false, responses: [{type: 'text', content: 'Not your turn'}]};
    }

    const move = parseInt(turn);
    
    if (this.state.board[move] !== '') {
      return {over: false, responses: [{type: 'text', content: 'Please select an empty square'}]};
    }

    this.state.board[move] = 'XO'[this.state.playerTurn];
    const boardBuffer = this.boardToBuffer();

    //check for win condition
    const overState = this.gameIsOver();
    if (overState === true || overState === null) {
      this.state.over = true;
      this.saveState();

      if (overState === true) {
        return {over: true, responses: [{type: 'image', content: boardBuffer}, 
          {type: 'text', content: `WINNER is <@${playerID}>!`}]};
      } else {
        return {over: true, responses: [{type: 'image', content: boardBuffer}, 
          {type: 'text', content: `Game over. Tie!`}]};
      }
    } else {
      this.saveState();

      this.state.playerTurn = (this.state.playerTurn + 1) % this.playerList.length; 
      const nextPlayerID = this.state.users[this.state.playerTurn];
      return {over: false, responses: [{type: 'image', content: boardBuffer}, 
        {type: 'text', content: `Your turn <@${nextPlayerID}> (you play ${'XO'[this.state.playerTurn]}s)`}]};
    }
  }

  coordToIndex(x, y) {
    return x + y * 3;
  }

  //return true if game is over and a win, false if not over, and null if it's a tie
  gameIsOver() {
    //check horizontal wins
    for (let x = 0; x < 3; x++) {
      if (this.state.board[this.coordToIndex(x, 0)] !== '') {
        if (this.state.board[this.coordToIndex(x, 0)] === this.state.board[this.coordToIndex(x, 1)] &&
          this.state.board[this.coordToIndex(x, 1)] === this.state.board[this.coordToIndex(x, 2)]) {
            return true;
        }
      }
    }

    //check vertical wins
    for (let y = 0; y < 3; y++) {
      if (this.state.board[this.coordToIndex(0, y)] !== '') {
        if (this.state.board[this.coordToIndex(0, y)] === this.state.board[this.coordToIndex(1, y)] &&
          this.state.board[this.coordToIndex(1, y)] === this.state.board[this.coordToIndex(2, y)]) {
            return true;
        }
      }
    }
    //check diagonal wins
    if (this.state.board[this.coordToIndex(0, 0)] !== '') {
      if (this.state.board[this.coordToIndex(0, 0)] === this.state.board[this.coordToIndex(1, 1)] &&
        this.state.board[this.coordToIndex(1, 1)] === this.state.board[this.coordToIndex(2, 2)]) {
          return true;
      }
    }
    if (this.state.board[this.coordToIndex(2, 0)] !== '') {
      if (this.state.board[this.coordToIndex(2, 0)] === this.state.board[this.coordToIndex(1, 1)] &&
        this.state.board[this.coordToIndex(1, 1)] === this.state.board[this.coordToIndex(0, 2)]) {
          return true;
      }
    }

    for (let i = 0; i < 9; i++) {
      if (this.state.board[i] === '') {
        return false;
      }
    }

    return null;
  }

  boardToBuffer() {
    const squareSize = 40;
    const borderSize = 20;
    const width = 2 * borderSize + 3 * squareSize;
    const height = width;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    //print v lines
    ctx.moveTo(borderSize + squareSize, borderSize);
    ctx.lineTo(borderSize + squareSize, height - borderSize);
    ctx.moveTo(borderSize + 2 * squareSize, borderSize);
    ctx.lineTo(borderSize + 2 * squareSize, height - borderSize);

    //print h lines
    ctx.moveTo(borderSize, borderSize + squareSize);
    ctx.lineTo(width - borderSize, borderSize + squareSize);
    ctx.moveTo(borderSize, borderSize + 2 * squareSize);
    ctx.lineTo(width - borderSize, borderSize + 2 * squareSize);

    ctx.stroke();
    //print board state (light numbers in empty squares)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        const i = x + 3 * y;
        let cell = this.state.board[i];
        if (cell.length > 0) {
          ctx.fillStyle = 'black';
          ctx.font = '20px Arial';
        } else {
          cell = (i).toString();
          ctx.fillStyle = '#cccccc';
          ctx.font = '15px Arial';
        }
        ctx.fillText(cell, borderSize + squareSize * 0.5 + squareSize * x,
          borderSize + squareSize * 0.5 + squareSize * y);
      }
    }

    return canvas.toBuffer('image/png', {compressionLevel: 9});
  }
}
