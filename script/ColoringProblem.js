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
	var imgMisc = new Image();
	var imgDialog = new Image();
	var imgTitle = new Image();
	var imgNumbers = new Image();
	var imgHUD = new Image();

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
		tutorial	: 8,
		game		: 9
	};
	var state = mainStates.initial;
	var gameParam;

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
			gameParam = title.push();
			title.draw();
			flip();
			if(gameParam[0] != mainStates.unknown) {
				if(tutorialStart == 1) {
					tutorialStart = 0;
					tutorial.reset();
					state = mainStates.tutorial;
				} else {
					state = mainStates.game;
					gameLogic.reset(gameParam[1], gameParam[2]);
				}
			}
			break;
		case mainStates.tutorial:
			res = tutorial.push();
			tutorial.draw();
			flip();
			if(res != mainStates.unknown) {
				state = mainStates.game;
				gameLogic.reset(gameParam[1], gameParam[2]);
			}
			break;
		case mainStates.game:
			res = gameLogic.push();
			gameLogic.draw();
			flip();
			if(res != mainStates.unknown) {
				state = res;
			}
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
		case mainStates.tutorial:
			tutorial.eventMouseMove(mouseX, mouseY);
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
		case mainStates.tutorial:
			tutorial.eventMouseClick(e);
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

	// Go to tutorial if the player is first time play the game.
	var tutorialStart;

	function init() {
		// Setup javascript loader events
		loadjs("script/Loader.js", 1);

		// Setup image loader events
		imgTiles.src = "image/Tiles.png";
		imgTiles.onload = eventItemPreLoaded;
		imgTileBorder.src = "image/TileBorder.png";
		imgTileBorder.onload = eventItemPreLoaded;

		// Setup canvas
		theCanvas = document.getElementById("canvas");
		context = theCanvas.getContext("2d");
		backCanvas  = document.createElement("canvas");
		backCanvas.width = theCanvas.width;
		backCanvas.height = theCanvas.height;
		backContext = backCanvas.getContext("2d");

		// Setup mouse events
		theCanvas.addEventListener("mousemove", eventMouseMove, true);
		theCanvas.addEventListener("click", eventMouseClick, true);	

		// Goto tutorial mode before first game start
		tutorialStart = 1;

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
	var itemsToLoad = 28;
	var loadCount = 0;

	function initLoader() {
		// Setup javascript loader events
		loadjs("script/Title.js", 0);
		loadjs("script/GameLogic.js", 0);
		loadjs("script/UI.js", 0);
		loadjs("script/Dialog.js", 0);
		loadjs("script/Panel.js", 0);
		loadjs("script/RoboticArms.js", 0);
		loadjs("script/HUD.js", 0);
		loadjs("script/Warp.js");
		loadjs("script/AI.js", 0);
		loadjs("script/Tutorial.js", 0);

		// Setup image loader events
		imgHTML5.src = "https://sites.google.com/site/alimenstorage/html5-rocks/HTML5_Logo.png";
		imgHTML5.onload = eventItemLoaded;
		imgBackground.src = "image/Background0.jpg";
		imgBackground.onload = eventItemLoaded;
		imgShadow.src = "image/Shadow.png";
		imgShadow.onload = eventItemLoaded;
		imgGlow.src = "image/Glow.png";
		imgGlow.onload = eventItemLoaded;
		imgPanel.src = "image/Panel.png";
		imgPanel.onload = eventItemLoaded;
		imgBottons.src = "image/Bottons.png";
		imgBottons.onload = eventItemLoaded;
		imgBeams.src = "image/Beam.png";
		imgBeams.onload = eventItemLoaded;
		imgSparks.src = "image/Sparks.png";
		imgSparks.onload = eventItemLoaded;
		imgArm1.src = "image/Arm1.png";
		imgArm1.onload = eventItemLoaded;
		imgArm2.src = "image/Arm2.png";
		imgArm2.onload = eventItemLoaded;
		imgDot.src = "image/Dot.png";
		imgDot.onload = eventItemLoaded;
		imgWarpLine.src = "image/Warpline.png";
		imgWarpLine.onload = eventItemLoaded;
		imgHalo.src = "image/Halos.jpg";
		imgHalo.onload = eventItemLoaded;
		imgMisc.src = "image/Misc.png";
		imgMisc.onload = eventItemLoaded;
		imgDialog.src = "image/Dialog.jpg";
		imgDialog.onload = eventItemLoaded;
		imgTitle.src = "image/Title.png";
		imgTitle.onload = eventItemLoaded;
		imgNumbers.src = "image/Numbers.png";
		imgNumbers.onload = eventItemLoaded;
		imgHUD.src = "image/HUD.png";
		imgHUD.onload = eventItemLoaded;

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
		}, backContext);

		gameLogic.init(env, {
		}, backContext);

		ui.init(env,  {
			tiles : imgTiles,
			tileBorder : imgTileBorder,
			background : imgBackground,
			shadow : imgShadow,
			glow : imgGlow,
			title : imgTitle,
			beams : imgBeams,
			sparks : imgSparks,
			misc : imgMisc,
			numbers : imgNumbers
		}, backContext);

		dialog.init(env, {
			panel : imgPanel,
			glow : imgGlow,
			misc : imgMisc,
			dialog : imgDialog
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

		hud.init(env, {
			glow : imgGlow,
			misc : imgMisc,
			hud : imgHUD,
			title : imgTitle,
			dialog : imgDialog
		}, backContext);

		warp.init(env, {
			dot : imgDot,
			warpLine : imgWarpLine,
			halo : imgHalo
		}, backContext);

		tutorial.init(env, {
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

