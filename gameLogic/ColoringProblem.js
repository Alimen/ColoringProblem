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
	var imgHTML5 = new Image();
	var imgBackground = new Image();
	var imgShadow = new Image();
	var imgGlow = new Image();
	var imgPanel = new Image();
	var imgBottons = new Image();
	var imgBeams = new Image();
	var imgSparks = new Image();
	var imgArm1 = new Image();
	var imgArm2 = new Image();
	var imgDot = new Image();
	var imgWarpLine = new Image();
	var imgHalo = new Image();

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
		game		: 8
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
			loader.draw(Math.ceil(loadCount * 100 / itemsToLoad));
			flip();
			break;
		case mainStates.loadComplete:
			loadComplete();
			break;
		case mainStates.showLogo:
			break;
		case mainStates.resetTitle:
			title.reset();
			state = mainStates.title;
			break;
		case mainStates.title:
			res = title.push();
			title.draw();
			flip();
			if(res[0] != mainStates.unknown) {
				state = res[0];
				gameLogic.reset(res[1], res[2]);
			}
			break;
		case mainStates.game:
			gameLogic.push();
			gameLogic.draw();
			flip();
			break;
		}
	}

///////////////////////////////////////////////////////////////////////////////
//
// Deliver events to submodules
//
///////////////////////////////////////////////////////////////////////////////

	// Mouse position variables
	var mouseX, mouseY;

	function eventKeyUp(e) {
		switch(state) {
		case mainStates.title:
			title.eventKeyUp(e);
			break;
		case mainStates.game:
			gameLogic.eventKeyUp(e);
			break;
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

		switch(state) {
		case mainStates.title:
			title.eventMouseMove(mouseX, mouseY);
			break;
		case mainStates.game:
			gameLogic.eventMouseMove(mouseX, mouseY);
			break;
		}
	}

	function eventMouseClick(e) {
		switch(state) {
		case mainStates.title:
			title.eventMouseClick(e);
			break;
		case mainStates.game:
			gameLogic.eventMouseClick(e);
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
	}

	function eventItemPreLoaded(e) {
		preloadCount++;
		if(preloadCount == itemsToPreload) {
			state = mainStates.initLoader;
		}
	}

///////////////////////////////////////////////////////////////////////////////
//
// Loader subroutines
//
///////////////////////////////////////////////////////////////////////////////

	// Loader counters
	var itemsToLoad = 21;
	var loadCount = 0;

	function initLoader() {
		// Setup javascript loader events
		loadjs("Title.js", 0);
		loadjs("GameLogic.js", 0);
		loadjs("UI.js", 0);
		loadjs("Dialog.js", 0);
		loadjs("Panel.js", 0);
		loadjs("RoboticArms.js", 0);
		loadjs("Warp.js");
		loadjs("AI.js", 0);

		// Setup image loader events
		imgHTML5.src = "https://sites.google.com/site/alimenstorage/html5-rocks/HTML5_Logo.png";
		imgHTML5.onload = eventItemLoaded;
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
		imgBeams.src = "Beam.png";
		imgBeams.onload = eventItemLoaded;
		imgSparks.src = "Sparks.png";
		imgSparks.onload = eventItemLoaded;
		imgArm1.src = "Arm1.png";
		imgArm1.onload = eventItemLoaded;
		imgArm2.src = "Arm2.png";
		imgArm2.onload = eventItemLoaded;
		imgDot.src = "Dot.png";
		imgDot.onload = eventItemLoaded;
		imgWarpLine.src = "Warpline.png";
		imgWarpLine.onload = eventItemLoaded;
		imgHalo.src = "Halos.jpg";
		imgHalo.onload = eventItemLoaded;

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
	}

	function loadComplete() {
		// Initialize sub modules
		title.init(env, {
			background : imgBackground
		}, backContext);

		gameLogic.init(env, {
		}, backContext);

		ui.init(env,  {
			tiles : imgTiles,
			tileBorder : imgTileBorder,
			background : imgBackground,
			shadow : imgShadow,
			glow : imgGlow,
			beams : imgBeams,
			sparks : imgSparks,
		}, backContext);

		dialog.init(env, {
			panel : imgPanel
		}, backContext);

		panel.init(env, {
			panel : imgPanel,
			bottons : imgBottons
		}, backContext);

		arm1.init(env, {
			arm1 : imgArm1
		}, backContext);

		arm2.init(env, {
			arm2 : imgArm2
		}, backContext);

		warp.init(env, {
			dot : imgDot,
			warpLine : imgWarpLine,
			halo : imgHalo
		}, backContext);

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
