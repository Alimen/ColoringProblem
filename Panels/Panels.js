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

	var theCanvas = document.getElementById("canvas");
	var context = theCanvas.getContext("2d");
	var backCanvas  = document.createElement("canvas");
	backCanvas.width = theCanvas.width;
	backCanvas.height = theCanvas.height;
	var backContext = backCanvas.getContext("2d");
	
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
	var itemsToLoad = 6;
	var loadCount = 0;

	// Image resources
	var imgBackground = new Image();
	var imgPanel = new Image();
	var imgBottons = new Image();
	var imgBeams = new Image();
	var imgSparks = new Image();
	var imgArm1 = new Image();

	// Panel variables
	const maxPanelT = 4;
	const panelW = 100, panelH = 90;
	var panelState;
	var panelT;
	var panelX, panelY;
	var panelCanvas, panelContext;
	const bottonW = 80, bottonH = 20;
	var bottonShowed;
	var bottonPress;

	// Beams variables
	const maxBeamT = 25;
	var beamT;
	var beamFromX, beamFromY, beamToX, beamToY;
	var beamSweepFromX, beamSweepFromY, beamSweepToX, beamSweepToY;
	var beamColor;
	var currentSpark;

	// General variables
	var mouseX = screenWidth/2;
	var mouseY = screenHeight/2;

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
			panelY = mouseY - panelH;
			panelT = 0;
			panelState = 1;
		} else if(panelState == 2) {
			panelState = 3;
			if(bottonPress != -1) {
				resetBeam();
			}
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
		imgBeams.src = "Beam.png";
		imgBeams.onload = eventItemLoaded;
		imgSparks.src = "Sparks.png";
		imgSparks.onload = eventItemLoaded;
		imgArm1.src = "Arm1.png";
		imgArm1.onload = eventItemLoaded;
	
		// Create off-screen canvas
		panelCanvas = document.createElement("canvas");
		panelCanvas.width = panelW;
		panelCanvas.height = panelH;
		panelContext = panelCanvas.getContext("2d");

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
		bottonShowed = [0, 1, 2];
		bottonPress = -1;
		beamT = -1;
		state = stateTitle;
	}

	// Title screen
	function drawTitle() {
		pushPanel();
		pushBeam();

		// Clear background
		backContext.drawImage(imgBackground, 0, 0);

		// Draw panel
		drawPanel();

		// Draw Arm1
		drawArm1();

		// Draw beam
		drawBeam();

		// Flip
		context.drawImage(backCanvas, 0, 0);

		// Debug message
		context.textBaseline = "top";	
		context.fillStyle = "#000000";
		context.font = "14px monospace";
		context.textAlign = "right";
		context.fillText("so far so good!", screenWidth, 0);
		context.fillText("mouse = (" + mouseX + ", " + mouseY + ")", screenWidth , 15);
		context.fillText("beamT = " + beamT, screenWidth, 30);
	}

	function drawPanel() {
		if(panelState == 0) {
			return;
		}

		var w, h;
		panelContext.drawImage(imgPanel, 0, 0);
		if(bottonPress == 0) {
			panelContext.drawImage(imgBottons, bottonW, bottonH * bottonShowed[0], bottonW, bottonH, 10, 10, bottonW, bottonH);
		} else {
			panelContext.drawImage(imgBottons, 0, bottonH * bottonShowed[0], bottonW, bottonH, 10, 10, bottonW, bottonH);
		}
		if(bottonPress == 1) {
			panelContext.drawImage(imgBottons, bottonW, bottonH * bottonShowed[1], bottonW, bottonH, 10, 35, bottonW, bottonH);
		} else {
			panelContext.drawImage(imgBottons, 0, bottonH * bottonShowed[1], bottonW, bottonH, 10, 35, bottonW, bottonH);
		}
		if(bottonPress == 2) {
			panelContext.drawImage(imgBottons, bottonW, bottonH * bottonShowed[2], bottonW, bottonH, 10, 60, bottonW, bottonH);
		} else {
			panelContext.drawImage(imgBottons, 0, bottonH * bottonShowed[2], bottonW, bottonH, 10, 60, bottonW, bottonH);
		}
		
		if(panelState == 2) {
			backContext.drawImage(panelCanvas, panelX, panelY);
		} else if(panelState == 1 || panelState == 3) {
			w = (panelW - 20) / maxPanelT * panelT;
			h = (panelH - 20) / maxPanelT * panelT;
		
			backContext.drawImage(panelCanvas, 0, panelH-10, 10+w, 10, panelX, panelY+panelH-10, 10+w, 10);
			backContext.drawImage(panelCanvas, panelW-10, panelH-10, 10, 10, panelX+10+w, panelY+panelH-10, 10, 10);
			backContext.drawImage(panelCanvas, 0, 0, 10+w, 10+h, panelX, panelY+panelH-20-h, 10+w, 10+h);
			backContext.drawImage(panelCanvas, panelW-10, 0, 10, 10+h, panelX+10+w, panelY+panelH-20-h, 10, 10+h);
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
			panelT--;
			if(panelT < 0) {
					panelState = 0;
			}
			break;
		}
	}

	function drawArm1() {
		// Reference
		//backContext.drawImage(imgArm1, 0, 480-231);

		// Bottom rare
		backContext.drawImage(imgArm1, 165, 231-160, 35, 15, 115, 398, 35, 15);

		// Caculate lower arm angle
		var lowerArmX = 125;
		var lowerArmY = 392;
		var l = (mouseX-lowerArmX)*(mouseX-lowerArmX) + (mouseY-lowerArmY)*(mouseY-lowerArmY);
		var l = Math.sqrt(l);
		var r1 = Math.asin((mouseY-lowerArmY) / l) - Math.PI + 0.12;
		if(mouseX < lowerArmX) {
			r1 = (-1)*(r1+Math.PI-0.24);
		}

		// Lower arm
		backContext.save();
		backContext.setTransform(1, 0, 0, 1, 0, 0);
		backContext.translate(lowerArmX, lowerArmY);
		backContext.rotate(r1);
		backContext.drawImage(imgArm1, 0, 231-165, 150, 54, -132, -26, 150, 54);
		backContext.restore();

		// Caculate upper arm angle
		var upperArmX = lowerArmX + Math.cos(r1 + Math.PI) * 130 - 40;
		var upperArmY = lowerArmY + Math.sin(r1 + Math.PI) * 130 - 35;

		// Upper Arm
		backContext.drawImage(imgArm1, 0, 0, 158, 65, upperArmX, upperArmY, 158, 65);
		
		// Bottom front
		backContext.drawImage(imgArm1, 0, 231-110, 171, 110, 0, 480-110, 171, 110);
	}

	function resetBeam() {
		beamT = 0;
		beamFromX = 50;
		beamFromY = 430;
		beamSweepFromX = panelX;
		beamSweepFromY = panelY + panelH;
		beamSweepToX = beamSweepFromX + 100;
		beamSweepToY = beamSweepFromY + 200;
		beamToX = beamSweepFromX;
		beamToY = beamSweepFromY;
		beamColor = bottonPress;
		currentSpark = 0;
	}

	function drawBeam() {
		if(beamT < 0) {
			return;
		}

		var l = Math.sqrt( (beamToX-beamFromX)*(beamToX-beamFromX) + (beamToY-beamFromY)*(beamToY-beamFromY) );
		var r = Math.asin( (beamToY-beamFromY) / l );

		backContext.save();
		backContext.setTransform(1, 0, 0, 1, 0, 0);
		backContext.translate(beamFromX, beamFromY-20);
		backContext.rotate(r);
		backContext.drawImage(imgBeams, 0, 40*beamColor, l, 40, 0, 0, l, 40);
		backContext.drawImage(imgSparks, 128 * currentSpark, 0, 128, 128, l - 64, -42, 128, 128);
		backContext.restore();
	}

	function pushBeam() {
		if(beamT < 0) {
			return;
		}

		beamT++;
		if(beamT >= maxBeamT) {
			beamT = -1;
			return;
		}

		var t = beamT / maxBeamT;
		beamToX = beamSweepFromX + (beamSweepToX - beamSweepFromX) * t;
		beamToY = beamSweepFromY + (beamSweepToY - beamSweepFromY) * t;

		currentSpark += Math.floor(Math.random() * 7);
		currentSpark %= 7;
	}

	const FPS = 30;
	var intervalTime = 1000 / FPS;
	setInterval(timerTick, intervalTime);
}

