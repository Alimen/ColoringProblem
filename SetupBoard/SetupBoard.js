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
	const maxCanvas = 20;
	var slideT;
	var graphCanvas = new Array(maxCanvas);
	var graphContext = new Array();
	var graphX = new Array()
	var graphY = new Array();

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
		// Setup keyboard events
		document.addEventListener("keyup", eventKeyUp, true);

		// Setup image loader events
		imgBackground.src = "WhiteRoom.jpg";
		imgBackground.onload = eventItemLoaded;

		imgTiles.src = "Tile.png";
		imgTiles.onload = eventItemLoaded;
		
		// Create off-screen canvas
		for(var i = 0; i < maxCanvas; i++) {
			graphCanvas[i] = document.createElement("canvas");
		}

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
		AI.setupBoard();
		maxCol = AI.getMaxCol();
		maxRow = AI.getMaxRow();
		maxGraph = AI.getGraphSize();

		slideT = 0;
		prepareSubGraph();

		state = stateTitle;
	}

	// Title screen
	function drawTitle() {
		// Clear background
		backContext.drawImage(imgBackground, 0, 0);

		// draw graphs to backCanvas
		var board = AI.getBoard();
		var i;
		for(i = 0; i < maxGraph; i++) {
			backContext.drawImage(graphCanvas[i], graphX[i] * slideT/5, graphY[i]);
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

	function prepareSubGraph() {
		var i, j, curRow;
		var w, h;
		var startX = 100, startY = 50, offset;

		graphContext.length = 0;
		graphX.length = 0;
		graphY.length = 0;
		for(i = 0; i < maxGraph; i++) {
			rect = AI.findBorder(i + 61);
			graphCanvas[i].width = (rect[1] - rect[3] + 1) * tileW;
			graphCanvas[i].height = (rect[2] - rect[0]) * tileH * 0.75 + tileH;
			graphContext.push(graphCanvas[i].getContext("2d"));

			drawSubGraph(i, rect);

			graphX.push(startX + rect[3] * tileW);
			graphY.push(startY + rect[0] * tileH * 0.75);
		}
	}

	function drawSubGraph(target, rect) {
		var w = Math.floor(rect[1])-Math.floor(rect[3])+1, h = rect[2]-rect[0]+1;
		var t = rect[0], l = rect[3];
		var odd = (l-Math.floor(l) > 0)? 1: 0;
		var i, j, curRow, offset;
		var subGraph = AI.subGraph(target+61);

		for(i = 0; i < h; i++) {
			curRow = i * w;
			if( ((odd==1)&&((t+i)%2==0)) || ((odd==0)&&((t+i)%2==1)) ) {
				offset = tileW/2;
			} else {
				offset = 0;
			}

			for(j = 0; j < w; j++) {
				if(subGraph[curRow+j] != ' ') {
					graphContext[target].drawImage(imgTiles, j * tileW + offset, i * tileH * 0.75);
				}
			}
		}
	}

	const FPS = 30;
	var intervalTime = 1000 / FPS;
	setInterval(timerTick, intervalTime);
}

