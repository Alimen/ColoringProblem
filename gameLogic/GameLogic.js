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
		switching	: 3,
		resulting	: 4,
		quit		: 5,
		leaving		: 6
	};
	var state;
	var nextGameState;

	// Game variables
	var soundon;
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
		soundon = 1;
		ui.setSoundon(soundon);
	}

	function reset(_playerCount, _startLevel) {
		playerCount = _playerCount;
		level = _startLevel;
		
		ai.setupBoard();
		if(level%2 == 1) {
			ui.resetSlideIn(2, 1, 0);
			currentPlayer = 0;
		} else {
			ui.resetSlideIn(1, 2, 0);
			currentPlayer = 1;
		}

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

		state = gameStates.animating;
		nextGameState = gameStates.selecting;
		selected = -1;
	}

	function push() {
		ui.push();
		if(ui.isIdle() == 1 && state == gameStates.animating) {
			changeState(nextGameState);
		}

		if(state == gameStates.leaving) {
			return env.mainStates.resetTitle;
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
		case gameStates.selecting:
			eventMouseMove(mouseX, mouseY);
			break;

		case gameStates.switching:
			currentPlayer = (currentPlayer+1)%2;
			ui.resetSwitching(currentPlayer);
			state = gameStates.animating;
			nextGameState = gameStates.selecting;
			break;
		}
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
			ui.checkMousePassSound(x, y, currentPlayer);
			ui.checkMousePassTitle(x, y, currentPlayer);

			if(currentPlayer == 0 && player1isHuman == 1) {
				arm1.setTarget(x, y);
			} else if(currentPlayer == 1 && player2isHuman == 1) {
				arm2.setTarget(x, y);
			}
			
			selected = ui.selection(x, y);
			ui.setSelect(selected, currentPlayer);
			break;

		case gameStates.colorSelecting:
			panel.select(x, y);
			break;

		case gameStates.quit:
			dialog.checkPassSlot1(x, y, currentPlayer);
			dialog.checkPassSlot2(x, y, currentPlayer);
			break;
		}
	}
	
	function eventMouseClick(e) {
		var res;

		switch(state) {
		case gameStates.selecting:
			if(ui.checkMousePassSound(mouseX, mouseY, currentPlayer) >= 0) {
				soundon = (soundon+1)%2;
				ui.setSoundon(soundon);
			}
			if(ui.checkMousePassTitle(mouseX, mouseY, currentPlayer) >= 0) {
				dialog.popup("quit");
				state = gameStates.quit;
				nextGameState = gameStates.selecting;
			}
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
				ui.setSelect(selected, currentPlayer);
			} else if(res >= 0) {
				panel.close();
				ui.resetPaint(selected, res+1, currentPlayer);
				selected = -1;
				ui.setSelect(-1, 0);
				state = gameStates.animating;
				nextGameState = gameStates.switching;
			}
			break;

		case gameStates.quit:
			if(dialog.checkPassSlot1(mouseX, mouseY, currentPlayer) >= 0) {
				dialog.close();
				ui.resetSlideOut(0, 0, 0);
				ui.checkMousePassSound(mouseX, mouseY, currentPlayer);
				ui.checkMousePassTitle(mouseX, mouseY, currentPlayer);
				state = gameStates.animating;
				nextGameState = gameStates.leaving;
			} else if(dialog.checkPassSlot2(mouseX, mouseY, currentPlayer) >= 0) {
				dialog.close();
				state = gameStates.selecting;
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
