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
		backCanvas.width = theCanvas.width + 50;
		backCanvas.height = theCanvas.height + 50;
		var backContext = backCanvas.getContext("2d");		
	}

///////////////////////////////////////////////////////////////////////////////
//
// Variable declearation
//
///////////////////////////////////////////////////////////////////////////////

	// Environmental constants
	const screenWidth = 999;
	const screenHeight = 540;
	const padding = 25;
	const canvasWidth = screenWidth + padding * 2;
	const canvasHeight = screenHeight + padding * 2;

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
	var imgWarpLine = new Image();
	var imgDot = new Image();
	var imgBackgrounds = new Array(3);
	var imgHalo = new Image();

	// Background variables
	var currentBG;
	var T;

	// Warp variables
	const warpMaxT = 250;
	var warpT;

	// Line variables
	const maxLine = 144;
	var linePattern = 2;
	var lineTemp;
	var lineNormX = new Array(maxLine);
	var lineNormY = new Array(maxLine);
	var linePosX = new Array(maxLine);
	var linePosY = new Array(maxLine);
	var lineT = new Array(maxLine);
	var lineR = new Array(maxLine);
	var lineV = new Array(maxLine);

	// Star variables
	const maxStar = 80;
	var starNormX = new Array(maxStar);
	var starNormY = new Array(maxStar);
	var starPosX = new Array(maxStar);
	var starPosY = new Array(maxStar);
	var starV = new Array(maxStar);

	// Camera shake variables
	var shakeFreqX, shakeFreqY;
	var shakeAmpX, shakeAmpY;
	var shakeOffsetX, shakeOffsetY;
	var shakeT;

	// Fade-in/out variables
	var fadeState, fadeAlpha;
	var fadeT;

	// Halo animation variables
	var haloFrame;

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
		// Toggle warp effect ('w')
		if(e.keyCode == 87) {
			if(T < 0) {
				T = 0;
				resetFade(1);
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
			pushTitle();
			drawTitle();
			break;
		}
	}

	// Initializations
	function init() {
		document.addEventListener("keyup", eventKeyUp, true);

		imgWarpLine.src = "warpline.png";
		imgWarpLine.onload = eventItemLoaded;

		imgDot.src = "dot.png";
		imgDot.onload = eventItemLoaded;

		imgBackgrounds[0] = new Image();
		imgBackgrounds[0].src = "background1.jpg";
		imgBackgrounds[0].onload = eventItemLoaded;
		imgBackgrounds[1] = new Image();
		imgBackgrounds[1].src = "background2.jpg";
		imgBackgrounds[1].onload = eventItemLoaded;
		imgBackgrounds[2] = new Image();
		imgBackgrounds[2].src = "background3.jpg";
		imgBackgrounds[2].onload = eventItemLoaded;	

		imgHalo.src = "halos.jpg";
		imgHalo.onload = eventItemLoaded;

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
		T = -1;
		currentBG = 0;
		warpT = -1;
		state = stateTitle;

		// Clear Background
		context.drawImage(imgBackgrounds[currentBG], 0, 0);
	}

	// Title screen
	function pushTitle() {
		if(T < 0 || T == 390) {
			T = -1;
			return;
		}
		T++;
		if(T == 40) {
			warpT = 0;
			resetWarp();
		}

		if(warpT >= 0) {
			pushWarp();
		} else if(fadeT >= 0) {
			pushFade();
		}
	}
	
	function drawTitle() {
		if(warpT >= 0) {
			drawWarp();
		} else {
			if(fadeT >= 0) {
				backContext.drawImage(imgBackgrounds[currentBG], 0, 0);
				backContext.fillStyle = "rgba(255, 255, 255, "+fadeAlpha+")";
				backContext.fillRect(0, 0, canvasWidth, canvasHeight);
				context.drawImage(backCanvas, 0, 0);
			}		
		}

		// Debug message
		context.textBaseline = "top";	
		context.fillStyle = "#FFFF00";
		context.font = "14px monospace";
		context.textAlign = "right";
		context.fillText("so far so good!", screenWidth, 0);
	}

	function resetWarp() {
		linePattern++;
		linePattern = linePattern % 3;
		resetLines();
		var i;
		switch(linePattern) {
		case 0:
			for(i = 0; i < 20; i++) {
				createLine(Math.random() * 2 * Math.PI, Math.random() * 14 + 6);
			}
			break;
		case 1:
			for(i = 0; i < 24; i++) {
				createLine(i * 0.26, 14);
			}
			break;
		case 2:
			break;
		}
		resetStars();
		resetCameraShake();
		resetFade(0);
		resetHalo();
	}

	function pushWarp() {
		if(warpT >= warpMaxT) {
			warpT = -1;
			currentBG = (currentBG + 1) % 3;
			resetFade(0);
		}
		if(warpT < 0) {
			return;
		}
		warpT++;

		if(warpT == warpMaxT - 40) {
			resetFade(1);
		}

		// Caculate the position of lines
		var i;
		for(i = 0; i < maxLine; i++) {
			pushLine(i);
		}
		switch(linePattern) {
		case 0:
			break;
		case 1:
			if(warpT % 25 == 0) {
				for(i = 0; i < 24; i++) {
					createLine(i * 0.26, 14);	
				}
			}
			break;
		case 2:
			if(warpT % 2 == 0) {
				createLine(lineTemp * 0.31, 14);
				createLine(lineTemp * 0.31 + Math.PI, 14);
				lineTemp++;
			}
			break;
		}

		// Caculate the position of stars
		for(i = 0; i < maxStar; i++) {
			pushStar(i);
		}

		// Caculate the camera shaking effect
		pushCameraShake();

		// Caculate fading effect
		pushFade();
	}

	function drawWarp() {
		// Clear Background
		backContext.fillStyle = "#000000";
		backContext.fillRect(0, 0, canvasWidth, canvasHeight);

		// Draw halo animation
		switch(haloFrame) {
		case 0:
			backContext.drawImage(imgHalo, 0, 0, 512, 512, (canvasWidth - 512) / 2 - shakeOffsetX, (canvasHeight - 512) / 2 - shakeOffsetY, 512, 512);
			break;
		case 1:
			backContext.drawImage(imgHalo, 512, 0, 512, 512, (canvasWidth - 512) / 2 - shakeOffsetX, (canvasHeight - 512) / 2 - shakeOffsetY, 512, 512);
			break;
		case 2:
			backContext.drawImage(imgHalo, 0, 512, 512, 512, (canvasWidth - 512) / 2 - shakeOffsetX, (canvasHeight - 512) / 2 - shakeOffsetY, 512, 512);
			break;
		case 3:
			backContext.drawImage(imgHalo, 512, 512, 512, 512, (canvasWidth - 512) / 2 - shakeOffsetX, (canvasHeight - 512) / 2 - shakeOffsetY, 512, 512);
			break;
		}

		// Draw stars
		var i;
		for(i = 0; i < maxStar; i++) {
			if(starV[i] >= 0) {
				backContext.drawImage(imgDot, starPosX[i], starPosY[i]);
			}
		}

		// Draw warp lines
		var s;
		for(i = 0; i < maxLine; i++) {
			if(lineT[i] >= 0) {
				backContext.save();
				backContext.setTransform(1, 0, 0, 1, 0, 0);
				backContext.translate(linePosX[i], linePosY[i]);
				backContext.rotate(lineR[i]);
				s = lineV[i] * lineV[i] / 600;
				backContext.drawImage(imgWarpLine, 0, 0, 203*lineT[i]*s/100, 9*lineT[i]*s/100);
				backContext.restore();
			}
		}

		// Draw fading square
		if(fadeT >= 0) {
			backContext.fillStyle = "rgba(255, 255, 255, "+fadeAlpha+")";
			backContext.fillRect(0, 0, canvasWidth, canvasHeight);
		}		

		// Flip & do camera shake
		context.drawImage(backCanvas, (-25 + shakeOffsetX), (-25 + shakeOffsetY));
	}

	function resetLines() {
		var i;
		for(i = 0; i < maxLine; i++) {
			lineNormX[i] = -1;
			lineNormY[i] = -1;
			linePosX[i] = -1;
			linePosY[i] = -1;
			lineT[i] = -1;
			lineR[i] = -1;
			lineV[i] = -1;
		}
		lineTemp = 0;
	}

	function createLine(radian, speed) {
		var i, tmp;
		var target = findAvailableLine();
		if(target < 0) {
			return;
		}

		lineR[target] = radian;
		lineT[target] = 1;
		lineV[target] = speed;

		lineNormX[target] = Math.cos(radian);
		lineNormY[target] = Math.sin(radian);
		linePosX[target] = canvasWidth / 2;
		linePosY[target] = canvasHeight / 2;
	}

	function findAvailableLine() {
		var i;
		for(i = 0; i < maxLine; i++) {
			if(lineT[i] < 0) {
				return i;
			}
		}
		return -1;
	}

	function pushLine(target) {
		if(lineT[target] < 0) {
			return;
		}
		
		lineV[target] += 0.5;
		lineT[target] += lineV[target];
		linePosX[target] = lineNormX[target] * lineT[target] + canvasWidth / 2;
		linePosY[target] = lineNormY[target] * lineT[target] + canvasHeight / 2;

		var x = linePosX[target];
		var y = linePosY[target];
		if(x < 0 || x > canvasWidth || y < 0 || y > canvasHeight) {
			lineT[target] = -1;
			if(linePattern == 0) {
				createLine(Math.random() * 2 * Math.PI, Math.random() * 14 + 6);
			}
		}
	}

	function resetStars() {
		var i, l, x, y;
		for(i = 0; i < maxStar; i++) {
			x = Math.random() * canvasWidth;
			y = Math.random() * canvasHeight;
			l = Math.sqrt(x * x + y * y);
			
			starNormX[i] = (x-canvasWidth/2) / l;
			starNormY[i] = (y-canvasHeight/2) / l;
			starPosX[i] = x;
			starPosY[i] = y;
			starV[i] = Math.random() * 8 + 2;
		}
	}

	function createStar(target, radian) {
		var i, tmp;

		starV[target] = Math.random() * 8 + 2;
		starNormX[target] = Math.cos(radian);
		starNormY[target] = Math.sin(radian);
		starPosX[target] = starNormX[target] * starV[target] * 5 + canvasWidth / 2;
		starPosY[target] = starNormY[target] * starV[target] * 5 + canvasHeight / 2;
	}

	function pushStar(target) {
		if(starV[target] < 0) {
			return;
		}

		starPosX[target] += starNormX[target] * starV[target];
		starPosY[target] += starNormY[target] * starV[target];

		var x = starPosX[target];
		var y = starPosY[target];
		if(x < 0 || x > canvasWidth || y < 0 || y > canvasHeight) {
			createStar(target, Math.random() * 2 * Math.PI);
		}
	}

	function resetCameraShake() {
		shakeFreqX = Math.random() + 0.01;
		shakeFreqY = Math.random() + 0.01;
		shakeAmpX = Math.random() * 4 + 1;
		shakeAmpY = Math.random() * 4 + 1;
		shakeOffsetX = 0;
		shakeOffsetY = 0;
		shakeT = 0;
	}

	function pushCameraShake() {
		if(shakeT < 0) {
			return;
		}
		shakeT += 1.0;

		var s = warpT / warpMaxT;
		shakeOffsetX = shakeAmpX * s * Math.cos(shakeT / shakeFreqX);
		shakeOffsetY = shakeAmpY * s * Math.cos(shakeT / shakeFreqY);
	}

	function resetFade(fadeout) {
		if(fadeout == 1) {
			fadeAlpha = 0.0;
			fadeState = 0;
		} else {
			fadeAlpha = 1.0;
			fadeState = 2;
		}
		fadeT = 0;
	}

	function pushFade() {
		if(fadeT < 0) {
			return;
		}

		switch(fadeState) {
		case 0:
			fadeAlpha = fadeAlpha + 0.1;
			if(fadeAlpha > 1.0) {
				fadeAlpha = 1.0;
				fadeT = 30;
				fadeState = 1;
			}
			break;

		case 1:
			fadeT--;
			break;

		case 2:
			fadeAlpha = fadeAlpha - 0.01;
			if(fadeAlpha < 0.0) {
				fadeAlpha = 0.0;
				fadeT = -1;
			}
			break;
		}
	}

	function resetHalo() {
		haloFrame = Math.floor(Math.random() * 4);
	}

	const FPS = 30;
	var intervalTime = 1000 / FPS;
	setInterval(timerTick, intervalTime);
}

