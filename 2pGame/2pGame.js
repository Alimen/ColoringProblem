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
	var itemsToLoad = 4;
	var loadCount = 0;

	// Image resources
	var imgBackground = new Image();
	var imgTiles = new Image();
	var imgTileBorder = new Image();
	var imgShadow = new Image();

	// General variables
	var mouseX = 0;
	var mouseY = 0;
	
	// AI class
	var AI = new ColoringProblem();

	// Game board variables
	const tileW = 40, tileH = 46;
	var maxCol, maxRow, maxGraph;
	var selected;

	// Slide-in animation variables
	const maxCanvas = 20;
	const startX = 100, startY = 30;
	const slideSpeed = 10;
	var slideState;
	var graphCanvas = new Array(maxCanvas);
	var graphContext = new Array();
	var graphTargetX = new Array();
	var graphX = new Array();
	var graphY = new Array();
	var graphZ = new Array();

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
		if(e.keyCode == 65) {
			if(slideState == 3) {
				resetSlideOut();
			}
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
	
	function eventMouseClick(e) {
		selection(mouseX, mouseY);
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
	
		// Setup mouse events
		theCanvas.addEventListener("mousemove", eventMouseMove, true);
		theCanvas.addEventListener("click", eventMouseClick, true);	

		// Setup image loader events
		imgBackground.src = "WhiteRoom.jpg";
		imgBackground.onload = eventItemLoaded;
		imgTiles.src = "Tile.png";
		imgTiles.onload = eventItemLoaded;
		imgTileBorder.src = "tileBorder.png";
		imgTileBorder.onload = eventItemLoaded;
		imgShadow.src = "Shadow.png";
		imgShadow.onload = eventItemLoaded;
		
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
		resetSlideIn();
		selected = 2;
		state = stateTitle;
	}

	// Title screen
	function drawTitle() {
		pushSlide();

		// Clear background
		backContext.drawImage(imgBackground, 0, 0);

		// Draw graphs to backCanvas
		var board = AI.getBoard();
		var i, dx, dy, dw, dh;
		for(i = 0; i < maxGraph; i++) {
			dx = (graphX[i] - screenWidth/2) * (1 - graphZ[i]) + screenWidth/2;
			dy = (graphY[i] - screenHeight/2) * (1 - graphZ[i]) + screenHeight/2;
			dw = graphCanvas[i].width * graphZ[i];
			dh = graphCanvas[i].height * graphZ[i];
			backContext.drawImage(imgShadow, dx, 300 + 130 * (1 - graphZ[i]),  graphCanvas[i].width - dw, 50 * (1 - graphZ[i]));

//			if(slideState != 0 || slideState != 3) {
//				if(selected === i) {
//					continue;
//				}
				backContext.drawImage(graphCanvas[i], dx, dy, graphCanvas[i].width - dw, graphCanvas[i].height - dh);
/*			} else {
				if(selected == i) {
					continue;
				}
				backContext.drawImage(graphCanvas[i], graphX[i], graphY[i]);
			}
*/		}
		if(selected != -1 && (slideState == 0 || slideState == 3)) {
			//backContext.drawImage(graphCanvas[selected], graphX[selected], graphY[selected], graphCanvas[selected].width * 1.1, graphCanvas[selected].height * 1.1);
		}

		// Flip
		context.drawImage(backCanvas, 0, 0);

		// Debug message
		context.textBaseline = "top";	
		context.fillStyle = "#000000";
		context.font = "14px monospace";
		context.textAlign = "right";
		context.fillText("so far so good!", screenWidth, 0);
		context.fillText("mouse = (" + mouseX + ", " + mouseY + ")", screenWidth, 15);
		context.fillText("slideState = " + slideState + ", selected = " + selected, screenWidth, 30);
	}

	function resetSlideIn() {
		AI.setupBoard();
		maxCol = AI.getMaxCol();
		maxRow = AI.getMaxRow();
		maxGraph = AI.getGraphSize();

		prepareSubGraph();
		slideState = 1;
	}

	function resetSlideOut() {
		var i, x = Math.ceil(screenWidth / slideSpeed) * slideSpeed;;
		for(i = 0; i < maxGraph; i++) {
			if(Math.random() > 0.5) {
				graphTargetX[i] = graphX[i] - x;
			} else {
				graphTargetX[i] = graphX[i] + x;
			}
		}

		slideState = 4;
	}

	function prepareSubGraph() {
		var i, j, curRow;
		var w, h;
		var x = Math.ceil(screenWidth / slideSpeed) * slideSpeed;

		graphContext.length = 0;
		graphTargetX.length = 0;
		graphX.length = 0;
		graphY.length = 0;
		graphZ.length = 0;
		for(i = 0; i < maxGraph; i++) {
			rect = AI.findBorder(i + 61);
			graphCanvas[i].width = (rect[1] - rect[3] + 1) * tileW;
			graphCanvas[i].height = (rect[2] - rect[0]) * tileH * 0.75 + tileH;
			graphContext.push(graphCanvas[i].getContext("2d"));

			drawSubGraph(i, rect);

			graphTargetX.push(startX + rect[3] * tileW);
			if(Math.random() > 0.5) {
				graphX.push(graphTargetX[i] - x);
			} else {
				graphX.push(graphTargetX[i] + x);
			}
			graphY.push(startY + rect[0] * tileH * 0.75);
			graphZ.push((maxGraph-i-1) * 0.02);
		}
	}

	function drawSubGraph(target, rect) {
		var w = Math.floor(rect[1])-Math.floor(rect[3])+1, h = rect[2]-rect[0]+1;
		var t = rect[0], l = rect[3];
		var odd = (l-Math.floor(l) > 0)? 1: 0;
		var i, j, curRow, offset;
		var x, y;
		var subGraph = AI.subGraph(target+61);
		var neighbor;

		for(i = 0; i < h; i++) {
			curRow = i * w;
			if(odd == 1) {
				offset = ((t+i)%2==0)? (-1)*tileW/2: 0;
			} else {
				offset = ((t+i)%2==1)? tileW/2: 0;
			}

			for(j = 0; j < w; j++) {
				if(subGraph[curRow+j] != ' ') {
					x = j * tileW + offset;
					y = i * tileH * 0.75;
					graphContext[target].drawImage(imgTiles, x, y);

					graphContext[target].fillText(target, x + 15, y + 15);
					
					neighbor = checkNeighbor(subGraph, curRow+j, w, h, t);	
					if(neighbor[0] == 1) {
						graphContext[target].drawImage(imgTileBorder, 0, 0, tileW, tileH, x, y, tileW, tileH);
					}
					if(neighbor[1] == 1) {
						graphContext[target].drawImage(imgTileBorder, tileW, 0, tileW, tileH, x, y, tileW, tileH);
					}
					if(neighbor[2] == 1) {
						graphContext[target].drawImage(imgTileBorder, 2*tileW, 0, tileW, tileH, x, y, tileW, tileH);
					}
				}
			}
		}
	}

	function checkNeighbor(subGraph, xy, w, h, t) {
		var output = [1, 1, 1];
		if(subGraph[xy] == ' ') {
			return output;
		}
		var col = xy % w;
		var row = Math.floor(xy / w);
		var target;

		if(col == (w-1)) {
		} else if(subGraph[xy+1]==' ') {
		} else {
			output[0] = 0;
		}

		target = ((t+row)%2 == 1)? xy + w + 1: xy + w;
		if(row == (h-1)) {
		} else if( ((t+row)%2 == 1) && (col == (w-1)) ) {
		} else if(subGraph[target] == ' ') {
		} else {
			output[1] = 0;
		}

		target = ((t+row)%2 == 1)? xy + w: xy + w - 1;
		if(row == (h-1)) {
		} else if( ((t+row)%2 == 0) && (col == 0) ) {
		} else if(subGraph[target] == ' ') {
		} else {
			output[2] = 0;
		}

		return output;
	}

	function pushSlide() {
		var i, check;
		switch(slideState) {
		case 0:
			break;

		case 1:
			check = maxGraph;
			for(i = 0; i < maxGraph; i++) {
				if(graphX[i] < graphTargetX[i]) {
					graphX[i] += slideSpeed;
				} else if(graphX[i] > graphTargetX[i]) {
					graphX[i] -= slideSpeed;
				} else {
					check--;
				}
			}
			if(check == 0) {
				slideState = 2;
			}
			break;

		case 2:
			check = maxGraph;
			for(i = 0; i < maxGraph; i++) {
				if(graphZ[i] > 0) {
					graphZ[i] -= 0.01;
				} else {
					check--;
				}
			}
			if(check == 0) {
				slideState = 3;
			}
			break;

		case 3:
			break;

		case 4:
			check = maxGraph;
			for(i = 0; i < maxGraph; i++) {
				if(graphZ[i] < (maxGraph-i-1) * 0.02) {
					graphZ[i] += 0.01;
				} else {
					check--;
				}
			}
			if(check == 0) {
				slideState = 5;
			}
			break;

		case 5:
			check = maxGraph;
			for(i = 0; i < maxGraph; i++) {
				if(graphX[i] < graphTargetX[i]) {
					graphX[i] += slideSpeed;
				} else if(graphX[i] > graphTargetX[i]) {
					graphX[i] -= slideSpeed;
				} else {
					check--;
				}
			}
			if(check == 0) {
				resetSlideIn();
			}
			break;
		}
	}

	function selection(x, y) {
		var i;
		var blockX = -1, blockY = -1;

		for(i = 0; i < maxCol; i += 0.5) {
			if( (x >= startX+tileW*i) && (x < startX+tileW*(i+0.5)) ) {
				blockX = i;
				break;
			}
		}
		for(i = 0; i < maxRow; i++) {
			if( (y >= startY+tileH*i*0.75) && (y < startY+tileH*(i+1)*0.75) ) {
				blockY = i;
				break;
			}
		}
		if(blockX == -1 || blockY == -1 || blockY == 0) {
			selected = -1;
			return;
		}

		var odd = (blockX > Math.floor(blockX))? 1: 0;
		var cx1, cx2, cy1, cy2;
		cy1 = startY + blockY * tileH * 0.75 + tileH/2;
		cy2 = startY + (blockY-1) * tileH * 0.75 + tileH/2;
		if( ((blockY%2==0)&&(odd==0)) || ((blockY%2==1)&&(odd==1)) ) {
			cx2 = startX + blockX * tileW;
			cx1 = cx2 + tileW/2;
		} else {
			cx1 = startX + blockX * tileW;
			cx2 = cx1 + tileW/2;
		}

		var d1, d2, xy;
		d1 = (x-cx1)*(x-cx1) + (y-cy1)*(y-cy1);
		d2 = (x-cx2)*(x-cx2) + (y-cy2)*(y-cy2);
		if(d1 < d2) {
			xy = blockY * maxCol;
			if(blockY%2 == 1) {
				xy += Math.floor(blockX - 0.5);
			} else {
				xy += Math.floor(blockX);
			}
		} else {
			xy = (blockY-1) * maxCol;
			if(blockY%2 == 1) {
				xy += Math.floor(blockX);
			} else {
				xy += Math.floor(blockX - 0.5);
			}
		}
		console.log([blockX, blockY, odd], [cx1, cy1], [cx2, cy2], [d1, d2], xy);

		selected = AI.findGroup(xy);
	}

	const FPS = 30;
	var intervalTime = 1000 / FPS;
	setInterval(timerTick, intervalTime);
}

