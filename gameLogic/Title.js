var title = (function() {
	// Environmental variables
	var backContext;
	var img;
	var env;
	var mouseX, mouseY;

	// Return variables
	var nextState;
	var playerCount;
	var startLevel;

///////////////////////////////////////////////////////////////////////////////
//
// Public functions
//
///////////////////////////////////////////////////////////////////////////////

	function init(_env, _img, _backContext) {
		env = _env;
		img = _img;
		backContext = _backContext;
		mouseX = env.screenWidth/2;
		mouseY = env.screenHeight/2;
	}

	function reset() {
		nextState = env.mainStates.unknown;
		playerCount = 0;
		startLevel = 0;
	}

	function push() {
		return [nextState, playerCount, startLevel];
	}

	function draw() {
		// Clear background
		backContext.drawImage(img.background, 0, 0);

		// Print text messages
		backContext.textBaseline = "bottom";	
		backContext.fillStyle = "#000000";
		backContext.font = "14px monospace";
		backContext.textAlign = "center";
		backContext.fillText("Press '1' for single player game", env.screenWidth / 2, env.screenHeight / 2 - 10);
		backContext.fillText("Press '2' for two player game", env.screenWidth / 2, env.screenHeight / 2 + 10);
	}

///////////////////////////////////////////////////////////////////////////////
//
// Event functions
//
///////////////////////////////////////////////////////////////////////////////

	function eventKeyUp(e) {
		if(e.keyCode == 49) { // '1' 
			nextState = env.mainStates.game;
			playerCount = 1;
			startLevel = 1;
		} else if(e.keyCode == 50) { // '2'
			nextState = env.mainStates.game;
			playerCount = 2;
			startLevel = 1;
		}
	}

	function eventMouseMove(x, y) {
		mouseX = x;
		mouseY = y;
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
