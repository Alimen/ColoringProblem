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
	var itemsToLoad = 2;
	var loadCount = 0;

	// Image resources
	var imgBackground = new Image();
	var imgTiles = new Image();

	// General variables
	var mouseX = 0;
	var mouseY = 0;
	
	// AI class
	var AI = new ColoringProblem();

	// Game board variables
	const tileW = 40, tileH = 46;
	var maxCol, maxRow, maxGraph;

	// Slide-in animation variables
	var slideT;
	var graphCanvas = new Array();
	var graphContext = new Array();

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

	function eventKeyUp(e) {
		if(e.keyCode == 188) {
			slideT--;
		} else if(e.keyCode == 190) {
			slideT++;
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
		document.addEventListener("keyup", eventKeyUp, true);

		imgBackground.src = "WhiteRoom.jpg";
		imgBackground.onload = eventItemLoaded;

		imgTiles.src = "Tile.png";
		imgTiles.onload = eventItemLoaded;

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
		AI.setupBoard();
		maxCol = AI.getMaxCol();
		maxRow = AI.getMaxRow();
		maxGraph = AI.getGraphSize();

		var i, rect;
		slideT = 0;
		graphCanvas.length = 0;
		graphContext.length = 0;
		for(i = 0; i < maxGraph; i++) {
			graphCanvas.push(document.createElement("canvas"));
		}

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
				offset = tileW/2;
			}
			for(j = 0; j < 10; j++) {
				backContext.drawImage(imgTiles, startX + j * tileW + offset, startY + i * tileH * 0.75);
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
		context.fillText(slideT, screenWidth, 14);
	}

	const FPS = 30;
	var intervalTime = 1000 / FPS;
	setInterval(timerTick, intervalTime);
}

