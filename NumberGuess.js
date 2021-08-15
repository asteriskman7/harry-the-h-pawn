"use strict"

const { Game } = require('./Game');


exports.NumberGuess = class extends Game {
  constructor(id, db, args) {
    super(id, db, args, [ 
      {name: 'minVal', default: 0, map: parseInt},
      {name: 'maxVal', default: 100, map: parseInt}
    ]);

    if (this.playerList.length < 1) {
      this.setupError += `Must have at least 1 player. `;
    }

    if (this.gameOptions.minVal >= this.gameOptions.maxVal) {
      this.setupError += `minVal must be less than maxVal. `;
    }

    this.loadState();

  }

  static getHelp() {
    return `A random number will be chosen. Players take turns guessing the ` +
    `number.
Options:
  maxVal: maximum random value. Default = 100`;
  }

  loadState() { 
    //get state from db or initialize
    db.get(`${this.id},state`, (err, res) => {
      if (err || (res === null)) {
        //init
        this.state = {
          number: Math.floor(Math.random() * (this.maxVal - this.minVal) + this.minVal),
          playerTurn: 0
        }
      } else {
        //load
        this.state = JSON.parse(res);
      }
      //TODO: indidcate ready
    });
  }

  saveState() { 
    //convert game state into save object and save in db
    db.set(`${this.id},state`, JSON.stringify(this.state));
  }

  takeTurn(playerIndex, turn) { 
    if (!playerIndex === this.state.playerTurn) {
      return {over: false, responses: [{type: 'text', content: 'Not your turn'}]};
    }

    this.state.playerTurn = (this.state.playerTurn + 1) % this.playerList.length; 

    const guess = parseInt(turn);

    if (guess === this.state.number) {
      return {over: true, responses: [{type: 'text', content: 'Correct!'}]};
    } else {
      const msg = guess < this.state.number ? 'Too low' : 'Too high';
      return {over: false, responses: [{type: 'text', content: msg}]};
    }
  }
}
