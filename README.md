# harry-the-h-pawn
Discord turn based game bot

Supports turn based games like tic-tac-toe, chess, and others

<img src="hpawn.png"
     alt="hpawn icon"
     width="128px" />
     

## Architecture Overview
The application uses discord.js for interface with discord.

[ Discord ] <=> [ Application ] <=> [ Game ]

The application handles sending and receiving information to/from discord so that individual games can be simpler. 

Data is persisted via Redis. Redis was chosen for speed and ease of use. No schemeas are necessary so it's easier to support arbitrary game types.

Games only need to handle their initilization and player turns. The game class returns responses to the application on each turn that the application will forward on to discord. Responses can be text or buffers containing images.

Game initialization can include player configurable parameters.

Bot interaction is done from a channel with a predefined name and all games are played in their own thread.

## Currently available games
* Number Guess (guess the randomly selected number in a given range)
* Tic-Tac-Toe

## In progress features
* Support for cpu players
* additional games like checkers & chess
* game/player stats
