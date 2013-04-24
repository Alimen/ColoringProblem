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
			-1, -1, -1, -1, -1, -1, 65, 64, 64, 63, 63, -1, -1, -1, -1, -1, -1, -1,
			  -1, -1, -1, -1, -1, -1, 66, 66, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
			-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
			  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		];
		ai.presetBoard(6, tmpBoard, 5, 3);
		ai.setColor(4, 2);
		ai.setColor(5, 3);
		hud.setInfo(0, 1);
		ui.resetSlideIn(2, 1, 2, 0);

		state = tutorialStates.animating;
		nextTutorialState = tutorialStates.dialog1;
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
		case tutorialStates.dialog1:
			dialog.popup("tutorial1");
			break;
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

		switch(state) {
		case tutorialStates.dialog1:
			dialog.checkPassSlot1(x, y, 0);
			dialog.checkPassSlot2(x, y, 0);
			break;
		}
	}

	function eventMouseClick(e) {
		switch(state) {
		case tutorialStates.dialog1:
			if(dialog.checkPassSlot1(mouseX, mouseY, 0) >= 0) {
				dialog.close();
				ui.resetSlideOut(2, 1, 1, 0);
				state = tutorialStates.animating;
				nextTutorialState = tutorialStates.leaving;
			}
			if(dialog.checkPassSlot2(mouseX, mouseY, 0) >= 0) {
			}
			break;
		}
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

