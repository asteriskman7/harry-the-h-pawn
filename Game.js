"use strict"

/*
  base class for all games to extend
  won't necessarily do a lot other than standardizing interface
*/

class Game {
  constructor(gameOptionsString) {
    //init game and store options
    //return message to send with initial game state
    return { type: 'text', content: 'Game started' };
  }

  loadState(obj) { 
    //convert save object into game state
  }

  saveState() { 
    //convert game state into save object and return
    return { };
  }

  isGameOver() { 
    //return game over state and if game is over final message
    return { over: true, type: 'text', content: 'Game over'};
  }

  takeTurn(playerIndex, turn) { 
    //return game state message
    return { type: 'text', content: 'Turn taken'};
  }
}
