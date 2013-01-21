window.addEventListener('load', eventWindowLoaded, false);
function eventWindowLoaded() {
	canvasApp();
}

function canvasSupport() {
	return !!document.createElement('testcanvas').getContext;
}

function canvasApp() {
	if(!canvasSupport) {
		return;
	} else {
		var theCanvas = document.getElementById("canvas");
		var context = theCanvas.getContext("2d");
		var backCanvas  = document.createElement("canvas");
		backCanvas.width = theCanvas.width;
		backCanvas.height = theCanvas.height;
		var backContext = backCanvas.getContext("2d");
	}

///////////////////////////////////////////////////////////////////////////////
//
// Variable declearation
//
///////////////////////////////////////////////////////////////////////////////

	// Environmental constants
	const screenWidth = 800;
	const screenHeight = 480;

	// Game states
	const stateInitial = 0;
	const stateLoading = 1;
	const stateReset = 2;
	const stateTitle = 3;
	var state = stateInitial;

	// Loader variables
	var itemsToLoad = 3;
	var loadCount = 0;

	// Image resources
	var imgBackground = new Image();
	var imgPanel = new Image();
	var imgBottons = new Image();

	// Panel variables
	const maxPanelT = 4;
	var panelState;
	var panelT;
	var panelX, panelY;
	const bottonW = 80, bottonH = 20;
	var bottonShowed;
	var bottonPress;

	// General variables
	var mouseX = 0;
	var mouseY = 0;

///////////////////////////////////////////////////////////////////////////////
//
// Event functions
//
///////////////////////////////////////////////////////////////////////////////

	function eventItemLoaded(e) {
		loadCount = loadCount + 1;
		if(loadCount == itemsToLoad) {
			state = stateReset;
		}
	}

	function eventMouseMove(e) {
		if(e.offsetX || e.offsetX == 0) {
			mouseX = e.offsetX;
			mouseY = e.offsetY;
		} else if(e.layerX || e.layerX == 0) {
			mouseX = e.layerX - theCanvas.offsetLeft;
			mouseY = e.layerY - theCanvas.offsetTop;
		}

		if(panelState == 2) {
			if(mouseX > panelX+10 && mouseX < panelX+10+bottonW && mouseY > panelY+10 && mouseY < panelY+10+bottonH) {
				bottonPress = 0;
			} else if(mouseX > panelX+10 && mouseX < panelX+10+bottonW && mouseY > panelY+35 && mouseY < panelY+35+bottonH) {
				bottonPress = 1;
			} else if(mouseX > panelX+10 && mouseX < panelX+10+bottonW && mouseY > panelY+60 && mouseY < panelY+60+bottonH) {
				bottonPress = 2;
			} else {
				bottonPress = -1;
			}
		}
	}
	
	function eventMouseClick(e) {
		if(panelState == 0) {
			panelX = mouseX ;
			panelY = mouseY - 45;
			panelT = 0;
			panelState = 1;
		} else if(panelState == 2) {
			panelState = 3;
		}
	}

///////////////////////////////////////////////////////////////////////////////
//
// Subroutines
//
///////////////////////////////////////////////////////////////////////////////

	// Main Loop
	function timerTick() {
		switch(state) {
		case stateInitial:
			init();
			break;
		case stateLoading:
			drawLoading();
			break;
		case stateReset:
			reset();
			break;
		case stateTitle:
			drawTitle();
			break;
		}
	}

	// Initializations
	function init() {
		// Setup mouse events
		theCanvas.addEventListener("mousemove", eventMouseMove, true);
		theCanvas.addEventListener("click", eventMouseClick, true);

		// Setup image loader events
		imgBackground.src = "WhiteRoom.jpg";
		imgBackground.onload = eventItemLoaded;
		imgPanel.src = "Panel.png";
		imgPanel.onload = eventItemLoaded;
		imgBottons.src = "Bottons.png";
		imgBottons.onload = eventItemLoaded;

		// Switch to next state
		if(itemsToLoad != 0) {
			state = stateLoading;
		} else {
			state = stateReset;
		}
	}

	// Loading screen
	function drawLoading() {
		// Caculate loader
		var percentage = Math.round(loadCount / itemsToLoad * 100);

		// Clear Background
		context.fillStyle = "#FFFFFF";
		context.fillRect(0, 0, screenWidth, screenHeight);

		// Print percentage
		context.textBaseline = "bottom";	
		context.fillStyle = "#000000";
		context.font = "14px monospace";
		context.textAlign = "center";
		context.fillText(percentage + "%", screenWidth / 2, screenHeight / 2);
	}

	function reset() {
		panelState = 0;
		bottonShowed = [4, 5, 6];
		bottonPress = -1;
		state = stateTitle;
	}

	// Title screen
	function drawTitle() {
		pushPanel();

		// Clear background
		backContext.drawImage(imgBackground, 0, 0);

		// Draw panel
		drawPanel();

		// Flip
		context.drawImage(backCanvas, 0, 0);

		// Debug message
		context.textBaseline = "top";	
		context.fillStyle = "#000000";
		context.font = "14px monospace";
		context.textAlign = "right";
		context.fillText("so far so good!", screenWidth, 0);
		context.fillText("mouse = (" + mouseX + ", " + mouseY + ")", screenWidth , 15);
		context.fillText("panelState = " + panelState, screenWidth, 30);
	}

	function drawPanel() {
		var w;
		if(panelState == 0) {
			return;
		} else if(panelState == 2) {
			backContext.drawImage(imgPanel, panelX, panelY);

			if(bottonPress == 0) {
				backContext.drawImage(imgBottons, bottonW, bottonH * bottonShowed[0], bottonW, bottonH, panelX+10, panelY+10, bottonW, bottonH);
			} else {
				backContext.drawImage(imgBottons, 0, bottonH * bottonShowed[0], bottonW, bottonH, panelX+10, panelY+10, bottonW, bottonH);
			}

			if(bottonPress == 1) {
				backContext.drawImage(imgBottons, bottonW, bottonH * bottonShowed[1], bottonW, bottonH, panelX+10, panelY+35, bottonW, bottonH);
			} else {
				backContext.drawImage(imgBottons, 0, bottonH * bottonShowed[1], bottonW, bottonH, panelX+10, panelY+35, bottonW, bottonH);
			}

			if(bottonPress == 2) {
				backContext.drawImage(imgBottons, bottonW, bottonH * bottonShowed[2], bottonW, bottonH, panelX+10, panelY+60, bottonW, bottonH);
			} else {
				backContext.drawImage(imgBottons, 0, bottonH * bottonShowed[2], bottonW, bottonH, panelX+10, panelY+60, bottonW, bottonH);
			}
		} else if(panelState == 1 || panelState == 3) {
			w = 80 / maxPanelT * panelT;
			backContext.drawImage(imgPanel, 0, 0, 10, 90, panelX, panelY, 10, 90);
			backContext.drawImage(imgPanel, 90-w, 0, 10+w, 90, panelX+10, panelY, 10+w, 90);
		}
	}
	
	function pushPanel() {
		if(panelT < 0) {
			return;
		}

		switch(panelState) {
		case 0:
			break;
		case 1:
			panelT++;
			if(panelT == maxPanelT) {
				panelState++;
			}
			break;
		case 2:
			break;
		case 3:
			panelState = 0;
			panelT = -1;
			break;
		}
	}

	const FPS = 30;
	var intervalTime = 1000 / FPS;
	setInterval(timerTick, intervalTime);
}

