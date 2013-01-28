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
	var itemsToLoad = 7;
	var loadCount = 0;

	// Image resources
	var imgBackground = new Image();
	var imgTiles = new Image();
	var imgTileBorder = new Image();
	var imgShadow = new Image();
	var imgGlow = new Image();
	var imgPanel = new Image();
	var imgBottons = new Image();

	// General variables
	var mouseX = 0;
	var mouseY = 0;
	
	// GamePlay states
	const gameSlide = 0;
	const gameSelect = 1;
	const gamePanel = 2;
	const gameColoring = 3;
	var gameState;

	// AI class
	var AI = new ColoringProblem();

	// Game board variables
	const tileW = 40, tileH = 46;
	var maxCol, maxRow, maxGraph;
	var selected;

	// Slide-in animation variables
	const maxCanvas = 20;
	const startX = 20, startY = 10;
	const slideSpeed = 10;
	const glowRadius = 20;
	var slideState;
	var graphCanvas = new Array(maxCanvas);
	var graphContext = new Array();
	var graphTargetX = new Array();
	var graphX = new Array();
	var graphY = new Array();
	var graphZ = new Array();
	var graphFrame = new Array();
	var graphFrameTile = new Array();

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

		if(gameState == gameSelect) {
			selection(mouseX, mouseY);
		}
		
		if(panelState == 2) {
			if(mouseX > panelX+10 && mouseX < panelX+10+bottonW && mouseY > panelY+10 && mouseY < panelY+10+bottonH && bottonShowed[0] != 3) {
				bottonPress = 0;
			} else if(mouseX > panelX+10 && mouseX < panelX+10+bottonW && mouseY > panelY+35 && mouseY < panelY+35+bottonH && bottonShowed[1] != 4) {
				bottonPress = 1;
			} else if(mouseX > panelX+10 && mouseX < panelX+10+bottonW && mouseY > panelY+60 && mouseY < panelY+60+bottonH && bottonShowed[2] != 5) {
				bottonPress = 2;
			} else {
				bottonPress = -1;
			}
		}
	}
	
	function eventMouseClick(e) {
		if(gameState == gameSelect && selected != -1) {
			resetPanel();
			gameState = gamePanel;
		} else if(gameState == gamePanel) {
			panelState = 3;
			if(bottonPress != -1) {
				paint(selected, bottonPress+1);
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
		// Setup keyboard events
		document.addEventListener("keyup", eventKeyUp, true);
	
		// Setup mouse events
		theCanvas.addEventListener("mousemove", eventMouseMove, true);
		theCanvas.addEventListener("click", eventMouseClick, true);	

		// Setup image loader events
		imgBackground.src = "WhiteRoom.jpg";
		imgBackground.onload = eventItemLoaded;
		imgTiles.src = "Tiles.png";
		imgTiles.onload = eventItemLoaded;
		imgTileBorder.src = "tileBorder.png";
		imgTileBorder.onload = eventItemLoaded;
		imgShadow.src = "Shadow.png";
		imgShadow.onload = eventItemLoaded;
		imgGlow.src = "Glow.png";
		imgGlow.onload = eventItemLoaded;
		imgPanel.src = "Panel.png";
		imgPanel.onload = eventItemLoaded;
		imgBottons.src = "Bottons.png";
		imgBottons.onload = eventItemLoaded;
		
		// Create off-screen canvas
		for(var i = 0; i < maxCanvas; i++) {
			graphCanvas[i] = document.createElement("canvas");
		}
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
		resetSlideIn();
		selected = -1;
		state = stateTitle;
	}

	// Title screen
	function drawTitle() {
		pushSlide();
		pushPanel();

		// Clear background
		backContext.drawImage(imgBackground, 0, 0);

		// Draw graphs to backCanvas
		var board = AI.getBoard();
		var i, dx, dy, dw, dh;
		for(i = 0; i < maxGraph; i++) {
			if(graphZ[i] > 0) {
				dx = (graphX[i] - screenWidth/2) * (1 - graphZ[i]) + screenWidth/2;
				dy = (graphY[i] - screenHeight/2) * (1 - graphZ[i]) + screenHeight/2;
				dw = graphCanvas[i].width * graphZ[i];
				dh = graphCanvas[i].height * graphZ[i];
				backContext.drawImage(graphCanvas[i], dx, dy, graphCanvas[i].width - dw, graphCanvas[i].height - dh);
				backContext.drawImage(imgShadow, dx, 300 + 130 * (1 - graphZ[i]),  graphCanvas[i].width - dw, 50 * (1 - graphZ[i]));
			} else {
				if(selected != i) {
					backContext.drawImage(graphCanvas[i], graphX[i], graphY[i]);				
				}
				if(graphFrame[i] != -1) {
					drawSubGraph(i, 0);	
				}
				backContext.drawImage(imgShadow, graphX[i], 430,  graphCanvas[i].width, 50);
			}
		}
		if(selected != -1 && (slideState == 0 || slideState == 3)) {
			backContext.drawImage(graphCanvas[selected], graphX[selected], graphY[selected]);
		}

		// Draw panel
		drawPanel();

		// Flip
		context.drawImage(backCanvas, 0, 0);

		// Debug message
		context.textBaseline = "top";	
		context.fillStyle = "#000000";
		context.font = "14px monospace";
		context.textAlign = "right";
		context.fillText("so far so good!", screenWidth, 0);
		context.fillText("mouse = (" + mouseX + ", " + mouseY + ")", screenWidth, 15);
		context.fillText("gameState = " + gameState, screenWidth, 30);
	}

	function resetSlideIn() {
		AI.setupBoard();
		maxCol = AI.getMaxCol();
		maxRow = AI.getMaxRow();
		maxGraph = AI.getGraphSize();

		prepareSubGraph();
		
		selected = -1;
		gameState = gameSlide;
		slideState = 1;
	}

	function resetSlideOut() {
		var i, x = Math.ceil(screenWidth * 1.5 / slideSpeed) * slideSpeed;
		for(i = 0; i < maxGraph; i++) {
			if(Math.random() > 0.5) {
				graphTargetX[i] = graphX[i] - x;
			} else {
				graphTargetX[i] = graphX[i] + x;
			}
		}

		selected = -1;
		gameState = gameSlide;
		slideState = 4;
	}

	function prepareSubGraph() {
		var i, j, curRow, rect;
		var x = Math.ceil(screenWidth * 1.5 / slideSpeed) * slideSpeed;

		graphContext.length = 0;
		graphTargetX.length = 0;
		graphX.length = 0;
		graphY.length = 0;
		graphZ.length = 0;
		graphFrame.length = 0;
		graphFrameTile.length = 0;
		for(i = 0; i < maxGraph; i++) {
			rect = AI.getBorder(i);
			graphCanvas[i].width = (rect[1] - rect[3] + 1) * tileW + 2 * glowRadius;
			graphCanvas[i].height = (rect[2] - rect[0]) * tileH * 0.75 + tileH + 2 * glowRadius;
			graphContext.push(graphCanvas[i].getContext("2d"));

			graphTargetX.push(startX + rect[3] * tileW);
			if(Math.random() > 0.5) {
				graphX.push(graphTargetX[i] - x);
			} else {
				graphX.push(graphTargetX[i] + x);
			}
			graphY.push(startY + rect[0] * tileH * 0.75);
			graphZ.push((maxGraph-i-1) * 0.02);
			graphFrame.push(-1);
			graphFrameTile[i] = new Array();

			drawSubGraph(i, 0);
		}
	}

	function drawSubGraph(target, glowing) {
		var rect = AI.getBorder(target);
		var w = Math.floor(rect[1])-Math.floor(rect[3])+1, h = rect[2]-rect[0]+1;
		var t = rect[0], l = rect[3];
		var odd = (l-Math.floor(l) > 0)? 1: 0;
		var subGraph = AI.getSubGraph(target);

		// Clean up subgraph rectangle
		graphContext[target].clearRect(0, 0, graphCanvas[target].width, graphCanvas[target].height);

		// Draw glow
		var i, j, curRow, offset;
		var x, y;
		if(glowing != 0) {
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
						graphContext[target].drawImage(imgGlow, x, y);
					}
				}
			}
		}

		// Draw tiles
		var color = AI.getColor(target);
		var neighbor;
		var tmp;
		for(i = 0; i < h; i++) {
			curRow = i * w;
			if(odd == 1) {
				offset = ((t+i)%2==0)? (-1)*tileW/2: 0;
			} else {
				offset = ((t+i)%2==1)? tileW/2: 0;
			}

			for(j = 0; j < w; j++) {
				if(subGraph[curRow+j] != ' ') {
					tmp = curRow + j;
					x = glowRadius + j * tileW + offset;
					y = glowRadius + i * tileH * 0.75;

					// Draw tiles
					if(graphFrame[target] != -1) {
						if(graphFrameTile[target][tmp] <= 0) {
							graphContext[target].drawImage(imgTiles, 0, 0, tileW, tileH, x, y, tileW, tileH);
						} else if(graphFrameTile[target][tmp] > 0 && graphFrameTile[target][tmp] <= 10) {
							graphContext[target].drawImage(imgTiles, tileW * graphFrameTile[target][tmp], tileH * color, tileW, tileH, x, y, tileW, tileH);
						} else {
							graphContext[target].drawImage(imgTiles, tileW * 10, tileH * color, tileW, tileH, x, y, tileW, tileH);
						}
					} else {
						if(color != -1) {
							graphContext[target].drawImage(imgTiles, tileW * 10, tileH * color, tileW, tileH, x, y, tileW, tileH);
						} else {
							graphContext[target].drawImage(imgTiles, 0, 0, tileW, tileH, x, y, tileW, tileH);
						}
					}
					
					// Draw target# for debug
					graphContext[target].fillText(target, x + 15, y + 15);
					
					// Draw borders
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

		// Push animation
		var stop = -1;
		var min = w * h * (-1);
		if(graphFrame[target] != -1) {
			for(i = 0; i < w*h; i++) {
				if(graphFrameTile[target][i] != min) {
					graphFrameTile[target][i]++;
				}
				if(graphFrameTile[target][i] <= 10) {
					stop = 0;
				}
			}
			graphFrame[target] = stop;
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

	function paint(groupID, color) {
		if(groupID == -1) {
			return;
		}

		AI.setColor(groupID, color);
		resetPaintTile(groupID);
		
		var i, black = AI.getBlackout();
		for(i = 0; i < black.length; i++) {
			AI.setColor(black[i], 0);
			resetPaintTile(black[i]);
		}

		selected = -1;
	}

	function resetPaintTile(groupID) {
		graphFrame[groupID] = 0;

		var sub = AI.getSubGraph(groupID);
		var rect = AI.getBorder(groupID);
		var w = Math.floor(rect[1])-Math.floor(rect[3])+1, h = rect[2]-rect[0]+1;
		var min = w * h * (-1);
		var i;

		graphFrameTile[groupID].length = 0;
		for(i = 0; i < w*h; i++) {
			if(sub[i] == ' ') {
				graphFrameTile[groupID].push(min);
			} else {
				graphFrameTile[groupID].push((-1)*i);
			}
		}

		var a, b, tmp;
		for(i = 0; i < w*h; i++) {
			do {
				a = Math.floor(Math.random() * (w*h));
			} while(sub[a] == ' ');
			do {
				b = Math.floor(Math.random() * (w*h));
			} while(sub[b] == ' ');

			tmp = graphFrameTile[groupID][a];
			graphFrameTile[groupID][a] = graphFrameTile[groupID][b];
			graphFrameTile[groupID][b] = tmp;
		}

		console.log(groupID, graphFrameTile[groupID]);
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
				gameState = gameSelect;
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
		var blockX = -1, blockY = -1;
		var i;

		for(i = 0; i < maxCol; i += 0.5) {
			if( (x >= startX+glowRadius+tileW*i) && (x < startX+glowRadius+tileW*(i+0.5)) ) {
				blockX = i;
				break;
			}
		}
		for(i = 0; i < maxRow; i++) {
			if( (y >= startY+glowRadius+tileH*i*0.75) && (y < startY+glowRadius+tileH*(i+1)*0.75) ) {
				blockY = i;
				break;
			}
		}
		if(blockX == -1 || blockY == -1 || blockY == 0) {
			if(selected != -1) {
				drawSubGraph(selected, 0);
			}
			selected = -1;
			return;
		}

		var odd = (blockX > Math.floor(blockX))? 1: 0;
		var cx1, cx2, cy1, cy2;
		cy1 = startY + glowRadius + blockY * tileH * 0.75 + tileH/2;
		cy2 = startY + glowRadius + (blockY-1) * tileH * 0.75 + tileH/2;
		if( ((blockY%2==0)&&(odd==0)) || ((blockY%2==1)&&(odd==1)) ) {
			cx2 = startX + glowRadius + blockX * tileW;
			cx1 = cx2 + tileW/2;
		} else {
			cx1 = startX + glowRadius + blockX * tileW;
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

		var output = AI.findGroup(xy);
		if(selected != output) {
			if(selected != -1) {
				drawSubGraph(selected, 0);
			}
			if(output != -1) {
				drawSubGraph(output, 1);
			}
			selected = output;
		}
	}

	function resetPanel() {
		if(AI.isColorOK(selected, 1) == 1) {
			bottonShowed[0] = 0;
		} else {
			bottonShowed[0] = 3;
		}
		if(AI.isColorOK(selected, 2) == 1) {
			bottonShowed[1] = 1;
		} else {
			bottonShowed[1] = 4;
		}
		if(AI.isColorOK(selected, 3) == 1) {
			bottonShowed[2] = 2;
		} else {
			bottonShowed[2] = 5;
		}
		bottonPress = -1;

		panelX = mouseX ;
		panelY = mouseY - panelH;
		panelT = 0;
		panelState = 1;
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
					gameState = gameSelect;
			}
			break;
		}
	}

	const FPS = 30;
	var intervalTime = 1000 / FPS;
	setInterval(timerTick, intervalTime);
}

