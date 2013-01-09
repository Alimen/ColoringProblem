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
	var itemsToLoad = 4;
	var loadCount = 0;

	// Image resources
	var imgBackground = new Image();
	var imgTiles = new Image();
	var imgBorderBlack = new Image();
	var imgBorderRed = new Image();

	// General variables
	var mouseX = 0;
	var mouseY = 0;

	// Boarders
	const maxBorder = 150;
	var borderStatus = new Array(maxBorder);
	var borderX = new Array(maxBorder);
	var borderY = new Array(maxBorder);

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
		imgBackground.src = "WhiteRoom.jpg";
		imgBackground.onload = eventItemLoaded;

		imgTiles.src = "Tile.png";
		imgTiles.onload = eventItemLoaded;

		imgBorderBlack.src = "BorderBlack.png";
		imgBorderBlack.onload = eventItemLoaded;

		imgBorderRed.src = "BorderRed.png";
		imgBorderRed.onload = eventItemloaded;

		if(itemsToLoad != 0) {
			state = stateLoading;
		} else {
			state = stateReset;
		}
	}

	// Loading screen
	function drawLoading() {
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
		resetBorder();
		state = stateTitle;
	}

	// Title screen
	function drawTitle() {
		// Clear background
		backContext.drawImage(imgBackground, 0, 0);

		// Try to draw tiles
		var startX = 200, startY = 100;
		var i, j, offset;
		for(i = 0; i < 6; i++) {
			if(i % 2 == 0) {
				offset = 0;
			} else {
				offset = 20;
			}
			for(j = 0; j < 10; j++) {
				backContext.drawImage(imgTiles, startX + j * 40 + offset, startY + i * 34); 
			}			
		}

		// Flip
		context.drawImage(backCanvas, 0, 0);

		// Debug message
		context.textBaseline = "top";	
		context.fillStyle = "#000000";
		context.font = "14px monospace";
		context.textAlign = "right";
		context.fillText("so far so good!", screenWidth, 0);
	}

	function resetBorder() {
		var i;
		for(i = 0; i < maxBorder; i++) {
			borderStatus[i] = -1;
			borderX[i] = -1;
			borderY[i] = -1;
		}
	}

	const FPS = 30;
	var intervalTime = 1000 / FPS;
	setInterval(timerTick, intervalTime);
}

