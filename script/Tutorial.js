var tutorial = (function() {
	// Environmental variables
	var backContext;
	var img;
	var env;
	var mouseX, mouseY;

	// tutorial states
	const tutorialStates = {
		unknown		: -1,
		animating	: 0,
		dialog1		: 1,
		dialog2		: 2,
		leaving		: 3
	};
	var state;
	var nextTutorialState;

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
		var tmpBoard = [
			-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
			 -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
			-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
			 -1, -1, -1, -1, -1, -1, 61, 61, 62, 62, 62, -1, -1, -1, -1, -1, -1, -1,
			-1, -1, -1, -1, -1, -1, 61, 61, 62, 62, 62, 62, -1, -1, -1, -1, -1, -1,
			 -1, -1, -1, -1, -1, 61, 61, 61, 63, 63, 63, -1, -1, -1, -1, -1, -1, -1,
			-1, -1, -1, -1, -1, -1, 64, 64, 64, 63, 63, -1, -1, -1, -1, -1, -1, -1,
			 -1, -1, -1, -1, -1, 65, 64, 64, 63, 63, 63, -1, -1, -1, -1, -1, -1, -1,
			-1, -1, -1, -1, -1, 65, 64, 64, 64, 63, 63, -1, -1, -1, -1, -1, -1, -1,
			 -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
			-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
			 -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		];
		ai.presetBoard(5, tmpBoard, 5, 3);
		hud.setInfo(2, 1);
		ui.resetSlideIn(2, 1, 2, 0);

		state = tutorialStates.animating;
		nextTitleState = tutorialStates.dialog1;
	}

	function push() {
		ui.push();
		if(ui.isIdle() == 1 && state == tutorialStates.animating) {
			changeState(nextTutorialState);
		}

		if(state == tutorialStates.leaving) {
			return env.mainStates.game;
		} else {
			return env.mainStates.unknown;
		}
	}

	function draw() {
		ui.draw();
	}

///////////////////////////////////////////////////////////////////////////////
//
// Private functions
//
///////////////////////////////////////////////////////////////////////////////

	function changeState(next) {
		state = next;
		switch(state) {
		}
	}

///////////////////////////////////////////////////////////////////////////////
//
// Event functions
//
///////////////////////////////////////////////////////////////////////////////

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
		eventMouseMove : eventMouseMove,
		eventMouseClick : eventMouseClick
	};
})();

