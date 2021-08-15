"use strict"

/*
  base class for all games to extend
  won't necessarily do a lot other than standardizing interface
*/

exports.Game = class {
  constructor(id, db, args, argInfo) {
    //init game and store options
    //return message to send with initial game state
    this.id = id;
    this.db = db;
    const [playerString, gameOptions] = args;
    this.playerList = playerString.split`,`;
    this.gameOptions = {};
    gameOptions.split`,`.forEach( v => {
      const [key, value] = v.split`=`;
      this.gameOptions[key] = value;
    });

    //set this to a non empty string if there is some config problem 
    this.setupError = "";
 
    argInfo.forEach( v => {
      const passedValue = this.gameOptions[v.name];
      if (passedValue !== undefined) {
        const val = v.map(passedValue);
        if (isNaN(val) || val === undefined) {
          this.setupError += `Invalid value for ${v.name} option. `;
        } else {
          this.gameOptions[v.name] = val;
        }
      } else {
        this.gameOptions[v.name] = v.default;
      }
    });

  }

  static getHelp() {
    //return help string including info about game options 
  }

  loadState() { 
    //get state from db or initialize
  }

  saveState() { 
    //convert game state into save object and save in db
  }

  takeTurn(playerIndex, turn) { 
    //return game over state and game state messages
    return {over: false, responses: [{ type: 'text', content: 'Turn taken'}]};
  }
}
