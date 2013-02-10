var coloringProblem = (function() {
	if(!canvasSupport) {
		return;
	}
	
///////////////////////////////////////////////////////////////////////////////
//
// Variable declearations
//
///////////////////////////////////////////////////////////////////////////////

	// Canvas
	var theCanvas;
	var context;
	var backCanvas;
	var backContext;

	// Environmental constants
	const screenWidth = 800;
	const screenHeight = 480;

	// Image resources
	var imgTiles = new Image();
	var imgTileBorder = new Image();
	var imgBackground = new Image();
	var imgShadow = new Image();
	var imgGlow = new Image();
	var imgPanel = new Image();
	var imgBottons = new Image();

///////////////////////////////////////////////////////////////////////////////
//
// Main state machine
//
///////////////////////////////////////////////////////////////////////////////

	// State enumeration
	const mainStates = {
		unknown		: -1,
		initial		: 0, 
		preloading	: 1, 
		initLoader	: 2,
		loading		: 3,
		loadComplete: 4,
		showLogo	: 5,
		resetTitle	: 6,
		title		: 7,
		resetGame	: 8,
		game		: 9
	};
	var state = mainStates.initial;

	function timerTick() {
		var res;

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
			loader.draw(loadCount / itemsToLoad);
			flip();
			break;
		case mainStates.loadComplete:
			loadComplete();
			break;
		case mainStates.resetTitle:
			title.reset();
			state = mainStates.title;
			break;
		case mainStates.title:
			res = title.draw();
			flip();
			if(res != mainStates.unknown) {
				console.debug("State change to " + res);
				state = res;
			}
			break;
		case mainStates.resetGame:
			break;
		case mainStates.game:
			break;
		}

		return;
	}

	function eventKeyUp(e) {
		switch(state) {
		case mainStates.title:
			title.eventKeyUp(e);
			break;
		}
	}

	function eventMouseMove(e) {
		switch(state) {
		case mainStates.title:
			title.eventMouseMove(e);
			break;
		}
	}

	function eventMouseClick(e) {
		switch(state) {
		case mainStates.title:
			title.eventMouseClick(e);
			break;
		}
	}

///////////////////////////////////////////////////////////////////////////////
//
// Pre-loader subroutines & initialization
//
///////////////////////////////////////////////////////////////////////////////

	// Pre-loader counters
	var itemsToPreload = 3;	// ToDo: Finish loading screen
	var preloadCount = 0;

	// Prepare global variables
	var env = {
		mainStates : mainStates,
		screenWidth : screenWidth,
		screenHeight : screenHeight
	};

	function init() {
		// Setup javascript loader events
		loadjs("Loader.js", 1);

		// Setup image loader events
		imgTiles.src = "Tiles.png";
		imgTiles.onload = eventItemPreLoaded;
		imgTileBorder.src = "TileBorder.png";
		imgTileBorder.onload = eventItemPreLoaded;

		// Setup canvas
		theCanvas = document.getElementById("canvas");
		context = theCanvas.getContext("2d");
		backCanvas  = document.createElement("canvas");
		backCanvas.width = theCanvas.width;
		backCanvas.height = theCanvas.height;
		backContext = backCanvas.getContext("2d");

		// Setup keyboard events
		document.addEventListener("keyup", eventKeyUp, true);
	
		// Setup mouse events
		theCanvas.addEventListener("mousemove", eventMouseMove, true);
		theCanvas.addEventListener("click", eventMouseClick, true);	

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
			fileref.onload = eventItemLoaded;
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
		// Setup javascript loader events
		loadjs("Title.js", 0);
		loadjs("AI.js", 0);

		// Setup image loader events
		imgBackground.src = "WhiteRoom.jpg";
		imgBackground.onload = eventItemLoaded;
		imgShadow.src = "Shadow.png";
		imgShadow.onload = eventItemLoaded;
		imgGlow.src = "Glow.png";
		imgGlow.onload = eventItemLoaded;
		imgPanel.src = "Panel.png";
		imgPanel.onload = eventItemLoaded;
		imgBottons.src = "Bottons.png";
		imgBottons.onload = eventItemLoaded;

		// Pass resources to loader
		loader.init(env, {
			tiles : imgTiles,
			tileBorder : imgTileBorder
		},
		backContext);

		// Switch to next state
		state = mainStates.loading;
	}

	function eventItemLoaded(e) {
		loadCount++;
		if(loadCount == itemsToLoad) {
			state = mainStates.loadComplete;
		}
		return;
	}

	function loadComplete() {
		title.init(env, {
			tiles : imgTiles,
			tileBorder : imgTileBorder,
			background : imgBackground,
			shadow : imgShadow,
			glow : imgGlow,
			panel : imgPanel,
			bottons : imgBottons
		},
		backContext);

		state = mainStates.resetTitle;
	}

///////////////////////////////////////////////////////////////////////////////
//
// General utilities
//
///////////////////////////////////////////////////////////////////////////////

	function flip() {
		context.drawImage(backCanvas, 0, 0);
	}

///////////////////////////////////////////////////////////////////////////////
//
// Public Access
//
///////////////////////////////////////////////////////////////////////////////

	function startMessageLoop() {
		const FPS = 30;
		var intervalTime = 1000 / FPS;
		setInterval(timerTick, intervalTime);
	}

	return {
		startMessageLoop : startMessageLoop
	};
})();

function canvasSupport() {
	return !!document.createElement('testcanvas').getContext;
}

function eventWindowLoaded() {
	coloringProblem.startMessageLoop();
}
window.addEventListener('load', eventWindowLoaded, false);
