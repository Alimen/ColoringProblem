var gameLogic = (function() {
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

	function reset(player) {
	}

	function draw() {
		ui.draw();

		var res;
		if(nextState != env.mainStates.unknown) {
			res = nextState;
			nextState = env.mainStates.unknown;
			return res;
		} else {
			return env.mainStates.unknown;
		}
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
		draw : draw,
		eventKeyUp : eventKeyUp,
		eventMouseMove : eventMouseMove,
		eventMouseClick : eventMouseClick
	};
})();
