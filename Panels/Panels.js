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
	var imgArm2 = new Image();

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
	const maxBeamT = 100;
	var beamT;
	var beamFromX, beamFromY, beamToX, beamToY;
	var beamSweepFromX, beamSweepFromY, beamSweepToX, beamSweepToY;
	var beamColor;
	var currentSpark;

	// Robotic arm variables
	var arm1LaserX, arm1LaserY;
	var arm2LaserX, arm2LaserY;
	var turn = 1;

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
		imgArm2.src = "Arm2.png";
		imgArm2.onload = eventItemLoaded;
	
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

		// Draw robotic arms
		if(beamT < 0) {
			drawArm1(mouseX, mouseY);
			drawArm2(mouseX, mouseY);
		} else {
			drawArm1(beamToX, beamToY);
			drawArm2(beamToX, beamToY);
		}

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

	function drawArm1(x, y) {
		var arm1shiftX = -30;

		// Cacluate laser head position
		var lowerArmX = 125 + arm1shiftX;
		var lowerArmY = 392;
		var l = Math.sqrt((x-lowerArmX)*(x-lowerArmX) + (y-lowerArmY)*(y-lowerArmY));
		arm1LaserX = lowerArmX + (x - lowerArmX)*0.3;
		arm1LaserY = lowerArmY + (y - lowerArmY)*0.3 - (screenHeight - l)*0.2;
		var r3 = angle(arm1LaserX, arm1LaserY, x, y);
		
		// Caculate tip angle
		var tipX = arm1LaserX - Math.cos(-1.02-r3)*57;
		var tipY = arm1LaserY + Math.sin(-1.02-r3)*57;
		var r0 = angle(lowerArmX, lowerArmY, tipX, tipY);

		// Solve lower arm angle by cosine rules
		var a = 125, b = Math.sqrt((tipX-lowerArmX)*(tipX-lowerArmX)+(tipY-lowerArmY)*(tipY-lowerArmY)), c = 121;
		var r1 = r0 - Math.acos((a*a + b*b - c*c) / (2*a*b));
		
		// Caculate upper arm angle
		var upperArmX = lowerArmX + Math.cos(r1) * a;
		var upperArmY = lowerArmY + Math.sin(r1) * a;
		var r2 = angle(upperArmX, upperArmY, tipX, tipY);

		// Draw bottom rare
		backContext.drawImage(imgArm1, 165, 71, 35, 15, 115+arm1shiftX, 398, 35, 15);

		// Draw lower arm
		backContext.save();
		backContext.setTransform(1, 0, 0, 1, 0, 0);
		backContext.translate(lowerArmX, lowerArmY);
		backContext.rotate(r1 + Math.PI + 0.12);
		backContext.drawImage(imgArm1, 0, 66, 150, 54, -132, -26, 150, 54);
		backContext.restore();

		// Draw tip
		backContext.save();
		backContext.setTransform(1, 0, 0, 1, 0, 0);
		backContext.translate(tipX, tipY);
		backContext.rotate(r3);
		backContext.drawImage(imgArm1, 159, 0, 51, 55, -20, 0, 51, 55);
		backContext.restore();

		// Draw upper arm
		backContext.save();
		backContext.setTransform(1, 0, 0, 1, 0, 0);
		backContext.translate(upperArmX, upperArmY);
		backContext.rotate(r2 - 0.22);
		backContext.drawImage(imgArm1, 0, 0, 158, 65, -25, -25, 158, 65);
		backContext.restore();
		
		// Draw bottom front
		backContext.drawImage(imgArm1, 0, 121, 171, 110, 0+arm1shiftX, 370, 171, 110);
	}

	function drawArm2(x, y) {
		var arm2shiftX = 30;

		// Caculate lower arm angle
		var lowerArmX = 696 + arm2shiftX;
		var lowerArmY = 383;
		var maxLength = Math.sqrt(screenWidth*screenWidth+screenHeight*screenHeight);
		var l = Math.sqrt((x-lowerArmX)*(x-lowerArmX) + (y-lowerArmY)*(y-lowerArmY));
		var offset = (1 - l / maxLength) * 0.5 * Math.PI;
		var r0 = angle(lowerArmX, lowerArmY, x, y);
		var r1 = r0 + offset;

		// Caculate upper arm angle
		var upperArmX = lowerArmX + Math.cos(r1 + 0.36)*117;
		var upperArmY = lowerArmY + Math.sin(r1 + 0.36)*117;
		var r2 = r0 - offset + Math.PI + (1 - l / maxLength);

		// Caculate tip angle
		var tipX = upperArmX + Math.cos(r2 + 3.13)*146;
		var tipY = upperArmY + Math.sin(r2 + 3.13)*146;
		var r3 = angle(tipX, tipY, x, y) + Math.PI;
		
		// Cacluate laser head position
		arm2LaserX = tipX + Math.cos(r3+3.15)*23;
		arm2LaserY = tipY + Math.sin(r3+3.15)*23;

		// Draw bottom
		backContext.drawImage(imgArm2, 0, 130, 158, 125, screenWidth-158+arm2shiftX, screenHeight-125, 158, 125);

		// Draw tip
		backContext.save();
		backContext.setTransform(1, 0, 0, 1, 0, 0);
		backContext.translate(tipX, tipY);
		backContext.rotate(r3);
		backContext.drawImage(imgArm2, 152, 95, 40, 40, -25, -17, 40, 40);
		backContext.restore();

		// Draw upper arm
		backContext.save();
		backContext.setTransform(1, 0, 0, 1, 0, 0);
		backContext.translate(upperArmX, upperArmY);
		backContext.rotate(r2);
		backContext.drawImage(imgArm2, 0, 0, 196, 50, -160, -20, 196, 50);
		backContext.restore();

		// Draw lower arm
		backContext.save();
		backContext.setTransform(1, 0, 0, 1, 0, 0);
		backContext.translate(lowerArmX, lowerArmY);
		backContext.rotate(r1);
		backContext.drawImage(imgArm2, 0, 50, 150, 83, -23, -22, 150, 83);
		backContext.restore();
	}

	function angle(ax, ay, bx, by) {
		var l = Math.sqrt((bx-ax)*(bx-ax)+(by-ay)*(by-ay));
		var r = Math.asin((by-ay) / l);
		if(bx < ax) {
			r = (-1)*r + Math.PI;
		}
		return r;
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

		turn = (turn+1)%2;
	}

	function drawBeam() {
		if(beamT < 0) {
			return;
		}

		if(turn == 0) {
			beamFromX = arm1LaserX;
			beamFromY = arm1LaserY;
		} else {
			beamFromX = arm2LaserX;
			beamFromY = arm2LaserY;
		}

		var l = Math.sqrt( (beamToX-beamFromX)*(beamToX-beamFromX) + (beamToY-beamFromY)*(beamToY-beamFromY) );
		var r = angle(beamFromX, beamFromY, beamToX, beamToY);

		backContext.save();
		backContext.setTransform(1, 0, 0, 1, 0, 0);
		backContext.translate(beamFromX, beamFromY);
		backContext.rotate(r);
		backContext.drawImage(imgBeams, 0, 40*beamColor, l, 40, 0, -20, l, 40);
		backContext.drawImage(imgSparks, 128 * currentSpark, 0, 128, 128, l - 64, -64, 128, 128);
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

