var gameLogic = (function() {
	// Environmental variables
	var backContext;
	var img;
	var env;

	// Game states
	const gameStates = {
		unknown		: -1,
		animating	: 0,
		selecting	: 1,
		colorSelect	: 2,
		resulting	: 3
	};
	var state;
	var nextGameState;

	// Return vairables
	var nextState;

	// Game variables
	var playerCount;
	var currentPlayer;
	var level;

///////////////////////////////////////////////////////////////////////////////
//
// Public functions
//
///////////////////////////////////////////////////////////////////////////////

	function init(_env, _img, _backContext) {
		env = _env;
		img = _img;
		backContext = _backContext;
	}

	function reset(_playerCount, _startLevel) {
		nextState = env.mainStates.unknown;
		playerCount = _playerCount;
		level = _startLevel;
		
		ai.setupBoard();
		ui.resetSlideIn(2, 1, 0);

		currentPlayer = 0;
		state = gameStates.animating;
		nextGameState = gameStates.selecting;
	}

	function push() {
		ui.push();
		if(ui.isIdle() == 1 && state == gameStates.animating) {
			state = nextGameState;
		}

		return env.mainStates.unknown;
	}

	function draw() {
		ui.draw();
	}

///////////////////////////////////////////////////////////////////////////////
//
// Event functions
//
///////////////////////////////////////////////////////////////////////////////

	function eventKeyUp(e) {
		if(e.keyCode == 65) { // 'A'
			if(state == gameStates.selecting) {
				ui.resetSlideOut(0, 0, 1);
				state = gameStates.animating;
				nextGameState = gameStates.unknown;
			} else if(state == gameStates.unknown) {
				ui.resetSlideIn(2, 1, 1);
				state = gameStates.animating;
				nextGameState = gameStates.selecting;
			}
		}
	}

	function eventMouseMove(e) {
	}
	
	function eventMouseClick(e) {
	}

//////////////////////////////////////////////////////////////////////////////
//
// Setup public access
//
///////////////////////////////////////////////////////////////////////////////

	return {
		init : init,
		reset : reset,
		push : push,
		draw : draw,
		eventKeyUp : eventKeyUp,
		eventMouseMove : eventMouseMove,
		eventMouseClick : eventMouseClick
	};
})();
