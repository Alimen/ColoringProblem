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
	}
	
///////////////////////////////////////////////////////////////////////////////
//
// Variable declearations
//
///////////////////////////////////////////////////////////////////////////////

	// Canvas
	var theCanvas = document.getElementById("canvas");
	var context = theCanvas.getContext("2d");
	var backCanvas  = document.createElement("canvas");
	backCanvas.width = theCanvas.width;
	backCanvas.height = theCanvas.height;
	var backContext = backCanvas.getContext("2d");

	// Environmental constants
	const screenWidth = 800;
	const screenHeight = 480;

	// Image resources
	var imgTiles = new Image();
	var imgTileBorder = new Image();
	var imgLoading = new Image();


///////////////////////////////////////////////////////////////////////////////
//
// Main state machine
//
///////////////////////////////////////////////////////////////////////////////

	// State enumeration
	const mainStates = {"initial":0, "preloading":1, "initLoader":2, "loading":3,
		"resetTitle":4, "title":5, "resetGame":6, "game":7};
	var state = mainStates.initial;

	function timerTick() {
		switch(state) {
		case mainStates.initial:
			init();
			break;
		case mainStates.preloading:
			drawPreload();
			break;
		case mainStates.initLoader:
			initLoader();
			break;
		case mainStates.loading:
			break;
		case mainStates.resetTitle:
			break;
		case mainStates.title:
			break;
		case mainStates.resetGame:
			break;
		case mainStates.game:
			break;
		}

		return;
	}

///////////////////////////////////////////////////////////////////////////////
//
// Pre-loader subroutines & initialization
//
///////////////////////////////////////////////////////////////////////////////

	// Pre-loader counters
	var itemsToPreload = 3;	// ToDo: Finish loading screen
	var preloadCount = 0;

	function init() {
		// Setup javascript loader events
		loadjs("Loader.js", 1);

		// Setup image loader events
		imgTiles.src = "Tiles.png";
		imgTiles.onload = eventItemPreLoaded;
		imgTileBorder.src = "TileBorder.png";
		imgTileBorder.onload = eventItemPreLoaded;

		// Switch to next state
		state = mainStates.preloading;
	}

	function drawPreload() {
		// Caculate loader
		var percentage = Math.round(preloadCount / itemsToPreload * 100);

		// Clear Background
		context.fillStyle = "#FFFFFF";
		context.fillRect(0, 0, screenWidth, screenHeight);

		// Print percentage
		context.textBaseline = "bottom";	
		context.fillStyle = "#000000";
		context.font = "14px monospace";
		context.textAlign = "center";
		context.fillText(percentage + "%", screenWidth / 2, screenHeight / 2);

		return;
	}
	
	function loadjs(filename, preload) {
		var fileref = document.createElement("script");
		fileref.setAttribute("type", "text/javascript");
		fileref.setAttribute("src", filename);
		
		if(preload == 1) {
			fileref.onload = eventItemPreLoaded;
		} else {
		}

		document.getElementsByTagName("head")[0].appendChild(fileref);
		return;
	}

	function eventItemPreLoaded(e) {
		preloadCount++;
		if(preloadCount == itemsToPreload) {
			state = mainStates.initLoader;
		}
		return;
	}

///////////////////////////////////////////////////////////////////////////////
//
// Loader subroutines
//
///////////////////////////////////////////////////////////////////////////////

	// Loader counters
	var itemsToLoad = 7;
	var loadCount = 0;

	function initLoader() {
		// Just for debug
		context.textBaseline = "top";	
		context.fillStyle = "#000000";
		context.font = "14px monospace";
		context.textAlign = "right";
		context.fillText("so far so good!", screenWidth, 0);
	}

///////////////////////////////////////////////////////////////////////////////
//
// Start the message loop
//
///////////////////////////////////////////////////////////////////////////////

	const FPS = 30;
	var intervalTime = 1000 / FPS;
	setInterval(timerTick, intervalTime);
}
