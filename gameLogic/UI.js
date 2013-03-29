var ui = (function() {
	// Environmental variables
	var backContext;
	var img;
	var env;

	// Animation states
	const animationStates = {
		idle		: 0,
		slideIn		: 1,
		slideOut	: 2,
		paint		: 3,
		warp		: 4
	}
	var state = animationStates.idle;

///////////////////////////////////////////////////////////////////////////////
//
// Public functions
//
///////////////////////////////////////////////////////////////////////////////

	function init(_env, _img, _backContext) {
		env = _env;
		img = _img;
		backContext = _backContext;

		// Create off-screen canvas
		for(var i = 0; i < maxCanvas; i++) {
			graphCanvas[i] = document.createElement("canvas");
		}
	}

	function push() {
		pushSlide();
		arm1.push();
		arm2.push();
		warp.pushFade();
	}

	function draw() {
		// Clear background
		backContext.drawImage(img.background, 0, 0);

		// Draw all subgraphs to backCanvas
		drawBoard();

		// Draw robotic arms
		arm1.draw();
		arm2.draw();

		// Draw fade in/out effect
		warp.drawFade();
	}
	

///////////////////////////////////////////////////////////////////////////////
//
// Board releted subroutines
//
///////////////////////////////////////////////////////////////////////////////

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
	var graphRedraw = new Array();
	var graphTileFrames = new Array();

	function resetSlideIn(moveArm1to, moveArm2to, isWarp) {
		maxCol = ai.getMaxCol();
		maxRow = ai.getMaxRow();
		maxGraph = ai.getGraphSize();

		arm1.resetSliding(moveArm1to);
		arm2.resetSliding(moveArm2to);
		prepareSubGraph();
	
		if(isWarp == 1) {
			warp.resetFade(0);
		}

		selected = -1;
		state = animationStates.slideIn;
		slideState = 1;
	}

	function resetSlideOut(moveArm1to, moveArm2to, isWarp) {
		var i, x = Math.ceil(env.screenWidth * 1.2 / slideSpeed) * slideSpeed;
		for(i = 0; i < maxGraph; i++) {
			if(Math.random() > 0.5) {
				graphTargetX[i] = graphX[i] - x;
			} else {
				graphTargetX[i] = graphX[i] + x;
			}
		}

		arm1.resetSliding(moveArm1to);
		arm2.resetSliding(moveArm2to);

		if(isWarp == 1) {
			warp.resetFade(1);
		}

		selected = -1;
		state = animationStates.slideOut;
		slideState = 4;
	}

	function resetPaint() {
	}

	function prepareSubGraph() {
		var i, j, curRow, rect;
		var x = Math.ceil(env.screenWidth * 1.2 / slideSpeed) * slideSpeed;

		graphContext.length = 0;
		graphTargetX.length = 0;
		graphX.length = 0;
		graphY.length = 0;
		graphZ.length = 0;
		graphRedraw.length = 0;
		graphTileFrames.length = 0;
		for(i = 0; i < maxGraph; i++) {
			rect = ai.getBorder(i);
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
			graphRedraw.push(-1);
			graphTileFrames[i] = new Array();

			drawSubGraph(i, 0);
		}
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
				state = animationStates.idle;
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
				state = animationStates.idle;
				slideState = 0;
			}
			break;
		}
	}

	function drawBoard() {
		var board = ai.getBoard();
		var i, dx, dy, dw, dh;
		for(i = 0; i < maxGraph; i++) {
			if(graphZ[i] > 0) {
				dx = (graphX[i] - env.screenWidth/2) * (1 - graphZ[i]) + env.screenWidth/2;
				dy = (graphY[i] - env.screenHeight/2) * (1 - graphZ[i]) + env.screenHeight/2;
				dw = graphCanvas[i].width * graphZ[i];
				dh = graphCanvas[i].height * graphZ[i];
				backContext.drawImage(graphCanvas[i], dx, dy, graphCanvas[i].width - dw, graphCanvas[i].height - dh);
				backContext.drawImage(img.shadow, dx, 300 + 130 * (1 - graphZ[i]),  graphCanvas[i].width - dw, 50 * (1 - graphZ[i]));
			} else {
				if(selected != i) {
					backContext.drawImage(graphCanvas[i], graphX[i], graphY[i]);				
				}
				if(graphRedraw[i] != -1) {
					drawSubGraph(i, 0);	
				}
				backContext.drawImage(img.shadow, graphX[i], 430,  graphCanvas[i].width, 50);
			}
		}
		if(selected != -1 && (slideState == 0 || slideState == 3)) {
			backContext.drawImage(graphCanvas[selected], graphX[selected], graphY[selected]);
		}
	}

	function drawSubGraph(target, glowing) {
		var rect = ai.getBorder(target);
		var w = Math.floor(rect[1])-Math.floor(rect[3])+1, h = rect[2]-rect[0]+1;
		var t = rect[0], l = rect[3];
		var odd = (l-Math.floor(l) > 0)? 1: 0;
		var subGraph = ai.getSubGraph(target);

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
						graphContext[target].drawImage(img.glow, x, y);
					}
				}
			}
		}

		// Draw tiles
		var color = ai.getColor(target);
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
					if(graphRedraw[target] != -1) {
						if(graphTileFrames[target][tmp] <= 0) {
							graphContext[target].drawImage(img.tiles, 0, 0, tileW, tileH, x, y, tileW, tileH);
						} else if(graphTileFrames[target][tmp] > 0 && graphTileFrames[target][tmp] <= 10) {
							graphContext[target].drawImage(img.tiles, tileW * graphTileFrames[target][tmp], tileH * color, tileW, tileH, x, y, tileW, tileH);
						} else {
							graphContext[target].drawImage(img.tiles, tileW * 10, tileH * color, tileW, tileH, x, y, tileW, tileH);
						}
					} else {
						if(color != -1) {
							graphContext[target].drawImage(img.tiles, tileW * 10, tileH * color, tileW, tileH, x, y, tileW, tileH);
						} else {
							graphContext[target].drawImage(img.tiles, 0, 0, tileW, tileH, x, y, tileW, tileH);
						}
					}
					
					// Draw target# for debug
					//graphContext[target].fillText(target, x + 15, y + 15);
					
					// Draw borders
					neighbor = checkNeighbor(subGraph, curRow+j, w, h, t);	
					if(neighbor[0] == 1) {
						graphContext[target].drawImage(img.tileBorder, 0, 0, tileW, tileH, x, y, tileW, tileH);
					}
					if(neighbor[1] == 1) {
						graphContext[target].drawImage(img.tileBorder, tileW, 0, tileW, tileH, x, y, tileW, tileH);
					}
					if(neighbor[2] == 1) {
						graphContext[target].drawImage(img.tileBorder, 2*tileW, 0, tileW, tileH, x, y, tileW, tileH);
					}
				}
			}
		}

		// Push paint animation
		var stop = -1;
		var min = w * h * (-1);
		if(graphRedraw[target] != -1) {
			for(i = 0; i < w*h; i++) {
				if(graphTileFrames[target][i] != min) {
					graphTileFrames[target][i]++;
				}
				if(graphTileFrames[target][i] <= 10) {
					stop = 0;
				}
			}
			graphRedraw[target] = stop;
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

///////////////////////////////////////////////////////////////////////////////
//
// Setup public access
//
///////////////////////////////////////////////////////////////////////////////

	function setSelect(_selected) {
		selected = _selected;
	}

	function isIdle() {
		if(state != animationStates.idle) {
			return 0;
		} else {
			return 1;
		}
	}

	return {
		init : init,
		resetSlideIn : resetSlideIn,
		resetSlideOut : resetSlideOut,
		resetPaint : resetPaint,
		push : push,
		draw : draw,
		setSelect : setSelect,
		isIdle : isIdle
	};
})();
