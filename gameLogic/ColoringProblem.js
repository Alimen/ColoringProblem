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

///////////////////////////////////////////////////////////////////////////////
//
// Start the message loop
//
///////////////////////////////////////////////////////////////////////////////

	const FPS = 30;
	var intervalTime = 1000 / FPS;
	setInterval(timerTick, intervalTime);
}
