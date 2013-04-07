var gameLogic = (function() {
	// Environmental variables
	var backContext;
	var img;
	var env;
	var mouseX, mouseY;

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
	var player1isHuman;
	var player2isHuman;
	var level;

	// Selecting state variables
	var selected;

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

	function reset(_playerCount, _startLevel) {
		nextState = env.mainStates.unknown;
		playerCount = _playerCount;
		level = _startLevel;
		
		ai.setupBoard();
		ui.resetSlideIn(2, 1, 0);

		if(playerCount == 2) {
			player1isHuman = 1;
			player2isHuman = 1;
		} else {
			if(level%2 == 1) {
				player1isHuman = 1;
				player2isHuman = 0;
			} else {
				player1isHuman = 0;
				player2isHuman = 1;
			}
		}

		currentPlayer = 0;
		state = gameStates.animating;
		nextGameState = gameStates.selecting;
		selected = -1;
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
		
		// Debug message
		backContext.textBaseline = "top";	
		backContext.fillStyle = "#000000";
		backContext.font = "14px monospace";
		backContext.textAlign = "right";
		backContext.fillText("mouse = (" + mouseX + ", " + mouseY + ")", env.screenWidth , 0);
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

	function eventMouseMove(x, y) {
		mouseX = x;
		mouseY = y;

		switch(state) {
		case gameStates.selecting:
			if(currentPlayer == 0 && player1isHuman == 1) {
				arm1.setTarget(x, y);
			} else if(currentPlayer == 1 && player2isHuman == 1) {
				arm2.setTarget(x, y);
			}
			
			selected = ui.selection(x, y);
			ui.setSelect(selected);
			break;

		case gameStates.colorSelecting:
			panel.select(x, y);
			break;
		}
	}
	
	function eventMouseClick(e) {
		var res;

		switch(state) {
		case gameStates.selecting:
			if(selected >= 0) {
				panel.popup(mouseX, mouseY, selected);
				state = gameStates.colorSelecting;
			}
			break;

		case gameStates.colorSelecting:
			res = panel.select(mouseX, mouseY);
			if(res == -1) {
				panel.close();
				state = gameStates.selecting;
				selected = ui.selection(mouseX, mouseY);
				ui.setSelect(selected);
			} else if(res >= 0) {
				panel.close();
				ui.resetPaint(selected, res+1);
				selected = -1;
				ui.setSelect(-1);
				state = gameStates.animating;
				nexState = gameStates.selecting;
			}
			break;
		}
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
