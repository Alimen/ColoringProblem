var gameLogic = (function() {
	// Environmental variables
	var backContext;
	var img;
	var env;
	var mouseX, mouseY;

	// Game states
	const gameStates = {
		unknown		: -1,
		reset		: 0,
		animating	: 1,
		selecting	: 2,
		colorSelect	: 3,
		aiSelect	: 4,
		switching	: 5,
		resulting	: 6,
		quit		: 7,
		leaving		: 8
	};
	var state;
	var nextGameState;

	// Game variables
	var soundon;
	var playerCount;
	var currentPlayer;
	var level;
	var warp;

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
		warp = 0;
		ui.setSoundon(soundon);
	}

	function reset(_playerCount, _startLevel) {
		playerCount = _playerCount;
		level = _startLevel;
		
		var groupCnt, px, py;
		if(playerCount == 1) {
			if(level < 11) {
				groupCnt = level + 4;
				px = 6; py = 3;
			} else if(level < 23) {
				groupCnt = level + 3;
				// px, py not decided
			} else {
				groupCnt = 25;
				px = 1; py = 1;
			}
		} else {
			groupCnt = 20;
			px = 1; py = 1;
		}
		ai.setupBoard(groupCnt, px, py);

		if(level%2 == 1) {
			ui.resetSlideIn(2, 1, warp);
			currentPlayer = 0;
		} else {
			ui.resetSlideIn(1, 2, warp);
			currentPlayer = 1;
		}
		warp = 0;

		state = gameStates.animating;
		if(playerCount == 1 && currentPlayer == 1) {
			nextGameState = gameStates.aiSelect;
		} else {
			nextGameState = gameStates.selecting;
		}
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
		case gameStates.reset:
			reset(playerCount, level+1);
			break;

		case gameStates.selecting:
			eventMouseMove(mouseX, mouseY);
			break;

		case gameStates.aiSelect:
			var tmp;
			tmp = ai.aiPick();
			ui.resetPaint(Math.floor(tmp/10), tmp%10, currentPlayer);
			selected = -1;
			ui.setSelect(-1, 0);
			state = gameStates.animating;
			nextGameState = gameStates.switching;
			break;

		case gameStates.switching:
			currentPlayer = (currentPlayer+1)%2;
			ui.resetSwitching(currentPlayer);
			state = gameStates.animating;
			if(ai.getUncoloredCount() == 0) {
				nextGameState = gameStates.resulting;
			} else {
				if(playerCount == 1 && currentPlayer == 1) {
					nextGameState = gameStates.aiSelect;
				} else {
					nextGameState = gameStates.selecting;
				}
			}
			break;

		case gameStates.resulting:
			if(playerCount == 2) {
				if(currentPlayer == 1) {
					dialog.popup("p1Wins");
				} else {
					dialog.popup("p2Wins");
				}
			} else {
				if(currentPlayer == 1) {
					dialog.popup("playerWins");
				} else {
					dialog.popup("aiWins");
				}
			}
			break;
		}
	}

///////////////////////////////////////////////////////////////////////////////
//
// Event functions
//
///////////////////////////////////////////////////////////////////////////////

	function eventKeyUp(e) {
	}

	function eventMouseMove(x, y) {
		mouseX = x;
		mouseY = y;

		switch(state) {
		case gameStates.selecting:
			ui.checkMousePassSound(x, y, currentPlayer);
			ui.checkMousePassTitle(x, y, currentPlayer);

			if(currentPlayer == 0) {
				arm1.setTarget(x, y);
			} else {
				arm2.setTarget(x, y);
			}
			
			selected = ui.selection(x, y);
			ui.setSelect(selected, currentPlayer);
			break;

		case gameStates.colorSelect:
			panel.select(x, y);
			break;

		case gameStates.resulting:
			dialog.checkPassSlot1(x, y, (currentPlayer+1)%2);
			dialog.checkPassSlot2(x, y, (currentPlayer+1)%2);
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
				panel.popup(mouseX, mouseY, selected, [0, 1, 2]);
				state = gameStates.colorSelect;
			}
			break;

		case gameStates.colorSelect:
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

		case gameStates.resulting:
			if(dialog.checkPassSlot1(mouseX, mouseY, currentPlayer) >= 0) {
				dialog.close();
				ui.resetSlideOut(2, 0, 0);
				state = gameStates.animating;
				nextGameState = gameStates.leaving;
			} else if(dialog.checkPassSlot2(mouseX, mouseY, currentPlayer) >= 0) {
				dialog.close();
				var nextLevel = level+1;
				if(nextLevel%4 == 1) {
					warp = 1;
					ui.resetSlideOut(0, 0, 1);
				} else {
					warp = 0;
					if(nextLevel%2 == 1) {
						ui.resetSlideOut(2, 1, 0);
					} else {
						ui.resetSlideOut(1, 2, 0);
					}
				}
				state = gameStates.animating;
				nextGameState = gameStates.reset;
			}
			break;

		case gameStates.quit:
			if(dialog.checkPassSlot1(mouseX, mouseY, currentPlayer) >= 0) {
				dialog.close();
				ui.resetSlideOut(2, 0, 0);
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
