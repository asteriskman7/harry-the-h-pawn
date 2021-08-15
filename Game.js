"use strict"

/*
  base class for all games to extend
  won't necessarily do a lot other than standardizing interface
*/

class Game {
  constructor(gameid, db, gameOptionsString) {
    //init game and store options
    //return message to send with initial game state
    this.gameid = gameid;
    this.db = db;
    return {responses: [{ type: 'text', content: 'Game started' }]};
  }

  loadState() { 
    //get state from db or initialize
  }

  saveState() { 
    //convert game state into save object and save in db
  }

  isGameOver() { 
    //return game over state and if game is over final message
    return { over: true, responses: [{type: 'text', content: 'Game over'}]};
  }

  takeTurn(playerIndex, turn) { 
    //return game state message
    return {responses [{ type: 'text', content: 'Turn taken'}]};
  }
}
