var dialog = (function() {
	// Environmental variables
	var backContext;
	var img;
	var env;

	// Dialog variables
	const maxDialogT = 6;
	const panelW = 100, panelH = 90;
	var dialogT;
	var dialogCanvas, dialogContext;
	var dialogState;
	var x, y, w, h;
	var dx, dy, dw, dh;

	// Dialog dimension parameters
	const dialogTypes = {
		unknown 	: -1,
		p1Wins		: 1,
		p2Wins		: 2,
		aiWins		: 3,
		playerWins	: 4,
		quit		: 5
	};
	const params = [
		[dialogTypes.unknown,	"unknown",		400, 240, 20, 20],
		[dialogTypes.p1Wins,	"p1Wins",		400, 240, 380, 170],
		[dialogTypes.p2Wins,	"p2Wins",		400, 240, 380, 170],
		[dialogTypes.aiWins,	"aiWins",		400, 240, 380, 170],
		[dialogTypes.playerWins,"playerWins",	400, 240, 380, 170],
		[dialogTypes.quit,		"quit",			400, 240, 320, 160]
	];

	// Icon dimension parameters
	const icon = {
		none	: -1,
		next	: 0,
		skip	: 80,
		soundon	: 160,
		soundoff: 240,
		title	: 320,
		cancel	: 400
	};
	const iconW = 80, iconH = 64;
	var iconSlot1, iconSlot2;
	var iconPass1, iconPass2;

///////////////////////////////////////////////////////////////////////////////
//
// Public functions
//
///////////////////////////////////////////////////////////////////////////////

	function init(_env, _img, _backContext) {
		env = _env;
		img = _img;
		backContext = _backContext;

		// Initialize dialog variables
		dialogState = 0;
	
		// Create off-screen canvas for dialog
		dialogCanvas = document.createElement("canvas");
		dialogCanvas.width = env.screenWidth;
		dialogCanvas.height = env.screenHeight;
		dialogContext = dialogCanvas.getContext("2d");
	}

	function popup(type) {
		prepareDialog(type);
		dialogState = 2;
	}

	function close() {
		dialogState = 0;
	}

	function transform() {
	}

	function push() {
	}

	function draw() {
		if(dialogState == 0) {
			return;
		}

		// Draw focus
		backContext.fillStyle = "rgba(64, 64, 64, 0.5)";
		backContext.fillRect(0, 0, env.screenWidth, env.screenHeight);

		// Draw dialog
		backContext.drawImage(dialogCanvas, x-w/2, y-h/2);
		drawIcons();
	}

	function drawIcons() {
		if(dialogState != 2) {
			return;
		}

		// Draw icon slot#1
		var iconX, iconY;
		if(iconSlot1 != icon.none) {
			iconX = x-w/4-iconW/2;
			iconY = y-h/2+(h-iconH-10);
			if(iconPass1 >= 0) {
				backContext.drawImage(img.glow, iconPass1*80, 0, 80, 86, iconX, iconY-20, 80, 86);
			}
			backContext.drawImage(img.misc, iconSlot1, 0, 80, 64, iconX, iconY, 80, 64);
		}

		// Draw icon slot#2
		if(iconSlot2 != icon.none) {
			iconX = x+w/4-iconW/2;
			iconY = y-h/2+(h-iconH-10);
			if(iconPass2 >= 0) {
				backContext.drawImage(img.glow, iconPass2*80, 0, 80, 86, iconX, iconY-20, 80, 86);
			}
			backContext.drawImage(img.misc, iconSlot2, 0, 80, 64, iconX, iconY, 80, 64);
		}
	}

	function checkPassSlot1(mouseX, mouseY, turn) {
		if(dialogState != 2) {
			return -1;
		}

		if(mouseX > x-w/2 && mouseX <= x && mouseY > y-h/2+(h-iconH-10) && mouseY < y+h/2) {
			iconPass1 = turn;
		} else {
			iconPass1 = -1;
		}

		return iconPass1;
	}

	function checkPassSlot2(mouseX, mouseY, turn) {
		if(dialogState != 2) {
			return -1;
		}

		if(mouseX > x && mouseX <= x+w/2 && mouseY > y-h/2+(h-iconH-10) && mouseY < y+h/2) {
			iconPass2 = turn;
		} else {
			iconPass2 = -1;
		}

		return iconPass2;
	}

///////////////////////////////////////////////////////////////////////////////
//
// Private functions
//
///////////////////////////////////////////////////////////////////////////////

	function prepareDialog(type) {
		var param = getType(type);
		iconSlot1 = icon.none;
		iconSlot2 = icon.none;
		iconPass1 = -1;
		iconPass2 = -1;

		// Copy dimension (debug)
		x = param[2]; y = param[3]; w = param[4]; h = param[5];

		// Draw conners
		dialogContext.drawImage(img.panel, 0, 0, 10, 10, 0, 0, 10, 10);
		dialogContext.drawImage(img.panel, panelW-10, 0, 10, 10, param[4]-10, 0, 10, 10);
		dialogContext.drawImage(img.panel, panelW-10, panelH-10, 10, 10, param[4]-10, param[5]-10, 10, 10);
		dialogContext.drawImage(img.panel, 0, panelH-10, 10, 10, 0, param[5]-10, 10, 10);

		// Draw sides
		dialogContext.drawImage(img.panel, 0, 10, 10, panelH-20, 0, 10, 10, param[5]-20);
		dialogContext.drawImage(img.panel, 10, 0, panelW-20, 10, 10, 0, param[4]-20, 10);
		dialogContext.drawImage(img.panel, panelW-10, 10, 10, panelH-20, param[4]-10, 10, 10, param[5]-20);
		dialogContext.drawImage(img.panel, 10, panelH-10, panelW-20, 10, 10, param[5]-10, param[4]-20, 10);

		// Fill center
		dialogContext.drawImage(img.panel, 10, 10, 10, 10, 10, 10, param[4]-20, param[5]-20);

		// Draw content
		switch(param[0]) {
		case dialogTypes.p1Wins:
			break;
		case dialogTypes.p2Wins:
			break;
		case dialogTypes.aiWins:
			break;
		case dialogTypes.playerWins:
			break;
		case dialogTypes.quit:
			dialogContext.drawImage(img.dialog, 0, 130, 300, 60, param[4]/2-150, 10, 300, 60);
			iconSlot1 = icon.title;
			iconSlot2 = icon.cancel;
			break;
		}
	}

	function getType(input) {
		var i, output = params[0];

		for(i = 0; i < params.length; i++) {
			if(params[i][1] == input) {
				output = params[i];
				break;
			}
		}

		return output;
	}

///////////////////////////////////////////////////////////////////////////////
//
// Setup public access
//
///////////////////////////////////////////////////////////////////////////////

	return {
		init : init,
		popup : popup,
		close : close,
		transform : transform,
		push : push,
		draw : draw,
		checkPassSlot1 : checkPassSlot1,
		checkPassSlot2 : checkPassSlot2
	};
})();
