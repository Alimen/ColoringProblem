function ColoringProblem() {
	// The board
	const maxRow = 10;
	const maxCol = 10;
	var board = new Array(maxCol * maxRow);
	var groups = new Array();
	var graph = new Array();

///////////////////////////////////////////////////////////////////////////////
//
// Access functions
//
///////////////////////////////////////////////////////////////////////////////

	this.getMaxRow = function() {
		return maxRow;
	}

	this.getMaxCol = function() {
		return maxCol;
	}

	this.getBoard = function() {
		return board;
	}

	this.getGraphSize = function() {
		return graph.length;
	}

///////////////////////////////////////////////////////////////////////////////
//
// Board setup subroutines
//
///////////////////////////////////////////////////////////////////////////////

	this.setupBoard = function() {
		const removed = 8;
		const seed = 5;
		var emptyCells = new Array();
		var setupSeq = new Array(maxCol * maxRow);
		var i, j, tmp;

		// Step 1. Empty the board
		emptyBoard(emptyCells);
		for(i = 0; i < seed; i = i+1) {
			groups[i] = new Array();
			graph[i] = new Array();
		}

		// Step 2. Remove some cells for randomize
		setupSeq = emptyCells.slice(0);
		shuffle(setupSeq);
		for(i = 0; i < removed; i = i+1) {
			board[setupSeq[i]] = ' ';
			emptyCells.splice(emptyCells.indexOf(setupSeq[i]), 1);
		}

		// Step 3. Generate grouping seeds
		setupSeq = emptyCells.slice(0);
		shuffle(setupSeq);
		for(i = 0; i < seed; i = i+1) {
			board[setupSeq[i]] = i + 61;
			groups[i].push(setupSeq[i]);
			emptyCells.splice(emptyCells.indexOf(setupSeq[i]), 1);
		}

		// Step 4. Grouping for cells that ungrouped
		while(emptyCells.length > 0) {
			j = emptyCells.length;
			setupSeq = emptyCells.slice(0);
			shuffle(setupSeq);

			for(i = 0; i < j; i = i+1) {
				tmp = grouping(setupSeq[i]);
				if(tmp >= 0) {
					board[setupSeq[i]] = tmp + 61;
					groups[tmp].push(setupSeq[i]);
					emptyCells.splice(emptyCells.indexOf(setupSeq[i]), 1);
				}
			}
		}

		// Step 5. Confirm the graph
		for(i = 0; i < seed-1; i = i+1) {
			for(j = i+1; j < seed; j = j+1) {
				if(isNeighborG2G(groups[i], groups[j]) == 1) {
					graph[i].push(j);
					graph[j].push(i);
				}
			}
		}
	}

	function emptyBoard(emptyCells) {
		var i;

		emptyCells.length = 0;
		for(i = 0; i < maxCol*maxRow; i = i+1) {
			if(isEdge(i) == 1) {
				board[i] = ' ';
			} else {
				board[i] = '0';
				emptyCells.push(i);
			}
		}
	}

///////////////////////////////////////////////////////////////////////////////
//
// Setup related utilities
//
///////////////////////////////////////////////////////////////////////////////

	function grouping(xy) {
		var candidates = new Array();
		var i, min;

		for(i = 0; i < groups.length; i = i+1) {
			if(isNeighborG2P(groups[i], xy) == 1) {
				candidates.push(i);
			}
		}

		if(candidates.length < 1) {
			return -1;
		} else if(candidates.length == 1) {
			return candidates[0];
		} else {
			min = 0;
			for(i = 1; i < candidates.length; i = i+1) {
				if(groups[i].length < groups[min].length) {
					min = i;
				}
			}
			return candidates[min];
		}
	}

	function isNeighborG2G(g1, g2) {
		for(var i = 0; i < g2.length; i = i+1) {
			if(isNeighborG2P(g1, g2[i]) == 1) {
				return 1;
			}
		}
		return 0;
	}

	function isNeighborG2P(g, xy) {
		for(var i = 0; i < g.length; i = i+1) {
			if(isNeighborP2P(g[i], xy) == 1) {
				return 1;
			}
		}
		return 0;
	}

	function isNeighborP2P(xy1, xy2) {
		var row = Math.floor(xy1 / maxCol);
		var odd;
		if(row % 2 == 1) {
			odd = 1;
		} else {
			odd = -1;
		}

		if(xy1+1 == xy2 || xy1-1 == xy2
			|| xy1-maxCol == xy2 || xy1-maxCol+odd == xy2 
			|| xy1+maxCol == xy2 || xy1+maxCol+odd == xy2) {
			return 1;
		} else {
			return 0;
		}
	}

	function isEdge(xy) {	
		if(xy < maxCol || xy >= (maxRow-1)*maxCol) {
			return 1;
		}
		if(xy%maxCol == 0 || xy%maxCol == maxCol-1) {
			return 1;
		}
		if(Math.floor(xy/maxCol)%2 == 1 && xy%maxCol == maxCol-2) {
			return 1;
		}
		return 0;
	}

///////////////////////////////////////////////////////////////////////////////
//
// General utilities
//
///////////////////////////////////////////////////////////////////////////////

	this.checkNeighbor = function(xy) {
		var output = [0, 0, 0, 0, 0, 0];
		var row = Math.floor(xy / maxCol);
		var odd, target;
		if(row % 2 == 1) {
			odd = 1;
		} else {
			odd = -1;
		}

		target = xy - maxCol;
		if(board[xy] != board[target]) {
			output[0] = 1;
		}
		target = xy - maxCol + odd;
		if(board[xy] != board[target]) {
			output[1] = 1;
		}
		target = xy - 1;
		if(board[xy] != board[target]) {
			output[2] = 1;
		}
		target = xy + 1;
		if(board[xy] != board[target]) {
			output[3] = 1;
		}
		target = xy + maxCol;
		if(board[xy] != board[target]) {
			output[4] = 1;
		}
		target = xy + maxCol + odd;
		if(board[xy] != board[target]) {
			output[5] = 1;
		}

		if(row % 2 == 0) {
			target = output[0];
			output[0] = output[1];
			output[1] = target;

			target = output[4];
			output[4] = output[5];
			output[5] = target;
		}

		return output;
	}

	this.subGraph = function(target) {
		var w, h;
		var i, j, k, curRow;
		var rect = this.findBorder(target);
		var t = rect[0], r = rect[1], b = rect[2], l = rect[3];
		w = Math.floor(r) - Math.floor(l) + 1;
		h = b - t + 1;

		var subGraph = new Array(maxCol * maxRow);
		k = 0;
		for(i = t; i <= b; i++) {
			curRow = i * maxCol;
			for(j = Math.floor(l); j <= Math.floor(r); j++) {
				if(board[curRow+j] == target) {
					subGraph[k] = board[curRow+j];
				} else {
					subGraph[k] = ' ';
				}
				k++;
			}
		}

		return subGraph;
	}

	this.findBorder = function(target) {
		var i, j, curRow, curCol;
		var t = -1, b = -1, l = -1, r = -1;

		// Find top
   		for(i = 0; i < maxRow; i++) {
			curRow = i * maxCol;
			for(j = 0; j < maxCol; j++) {
				if(target == board[curRow+j]) {
					t = i;
					break;
				}
			}
	   		if(t > -1) {
				break;
			}
		}
	
		// Find bottom
		for(; i < maxRow; i++) {
			curRow = i * maxCol;
			for(j = 0; j < maxCol; j++) {
				if(target == board[curRow+j]) {
					b = i;
					break;
				}
			}
			if(b < i) {
				break;
			}
		}
	
		// Find left
		for(i = 0; i < 2 * maxCol; i++) {
			curCol = (i%2)? (maxCol + (i-1)/2): i/2;
			for(j = curCol; j < maxCol * maxRow; j += maxCol * 2) {
				if(target == board[j]) {
					l = i/2;
					break;
				}
			}
			if(l > -1) {
				break;
			}
		}	
	
		// Find right
		for(i = 2 * maxCol - 1; i >= 0; i--) {
			curCol = (i%2)? (maxCol + (i-1)/2): i/2;
			for(j = curCol; j < maxCol * maxRow; j += maxCol * 2) {
				if(target == board[j]) {
					r = i/2;
					break;
				}
			}
			if(r > -1) {
				break;
			}		
		}

		return [t, r, b, l];
	}

	function shuffle(target) {
		var a, b, tmp;
		for(var i = 0; i < target.length; i = i+1) {
			a = Math.random();
			a = a * target.length;
			a = Math.floor(a);

			b = Math.random();
			b = b * target.length;
			b = Math.floor(b);

			tmp = target[a];
			target[a] = target[b];
			target[b] = tmp;
		}
	}
}
