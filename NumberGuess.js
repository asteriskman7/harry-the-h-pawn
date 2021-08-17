"use strict"

const { Game } = require('./Game');


exports.NumberGuess = class extends Game {
  constructor(id, db, args) {
    super(id, db, args, [ 
      {name: 'minVal', default: 1, map: parseInt},
      {name: 'maxVal', default: 100, map: parseInt}
    ]);

    if (this.playerList.length < 1) {
      this.setupError += `Must have at least 1 player. `;
    }

    if (this.state.gameOptions.minVal >= this.state.gameOptions.maxVal) {
      this.setupError += `minVal must be less than maxVal. `;
    }

    this.loadState();

  }

  static getHelp() {
    return `A random number will be chosen. Players take turns guessing the ` +
    `number.
Options:
  minVal: Minimum random value. Default = 1
  maxVal: Maximum random value. Default = 100`;
  }

  loadState() { 
    //get state from db or initialize
    this.db.get(`${this.id},state`, (err, res) => {
      if (err || (res === null)) {
        //init
        this.state.number = Math.floor(Math.random() * (1 + this.state.gameOptions.maxVal - this.state.gameOptions.minVal) + this.state.gameOptions.minVal);
        this.state.playerTurn = 0;
        this.saveState();
      } else {
        //load
        this.state = JSON.parse(res);
      }
      //TODO: indidcate ready
    });
  }

  saveState() { 
    //convert game state into save object and save in db
    this.db.set(`${this.id},state`, JSON.stringify(this.state));
  }

  takeTurn(playerIndex, turn) { 
    if (this.state.over) {
      return {over: true, responses: [{type: 'text', content: 'The game is already over'}]};
    }

    if (!playerIndex === this.state.playerTurn) {
      return {over: false, responses: [{type: 'text', content: 'Not your turn'}]};
    }

    this.state.playerTurn = (this.state.playerTurn + 1) % this.playerList.length; 

    const guess = parseInt(turn);

    if (guess === this.state.number) {
      this.state.over = true;
      this.saveState();
      return {over: true, responses: [{type: 'text', content: 'Correct!'}]};
    } else {
      this.saveState();
      const msg = guess < this.state.number ? 'Too low' : 'Too high';
      return {over: false, responses: [{type: 'text', content: msg}, {type: 'text', content: 'keep trying!'}]};
    }
  }
}
