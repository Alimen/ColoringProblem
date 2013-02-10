var title = (function() {
	var backContext;
	var img;
	var env;
	var nextState;

	function init(_env, _img, _backContext) {
		env = _env;
		img = _img;
		backContext = _backContext;
		nextState = env.mainStates.unknown;
	}

	function reset() {
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

		var res;
		if(nextState != env.mainStates.unknown) {
			res = nextState;
			nextState = env.mainStates.unknown;
			return res;
		} else {
			return env.mainStates.unknown;
		}
	}

	function eventKeyUp(e) {
		if(e.keyCode == 49) { // '1' 
			console.debug("'1' pressed (dummy)");
		} else if(e.keyCode == 50) { // '2'
			console.debug("'2' pressed");
			nextState = env.mainStates.resetGame;
		}
	}

	function eventMouseMove(e) {
	}
	
	function eventMouseClick(e) {
	}

	return {
		init : init,
		reset : reset,
		draw : draw,
		eventKeyUp : eventKeyUp,
		eventMouseMove : eventMouseMove,
		eventMouseClick : eventMouseClick
	};
})();
