var gameLogic = (function() {
	// Environmental variables
	var backContext;
	var img;
	var env;

	// Return vairables
	var nextState;

	// Game variables
	var playerCount;
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
		console.log(_playerCount, _startLevel);

		nextState = env.mainStates.unknown;
		playerCount = _playerCount;
		level = _startLevel;
		
		ai.setupBoard();
		ui.resetSlideIn(0, 0);
	}

	function push() {
		ui.push();
		return nextState;
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
	}

	function eventMouseMove(e) {
	}
	
	function eventMouseClick(e) {
	}

///////////////////////////////////////////////////////////////////////////////
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
