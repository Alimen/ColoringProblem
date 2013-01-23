function ColoringProblem() {
	// The board
	const maxRow = 12;
	const maxCol = 18;
	var board = new Array(maxCol * maxRow);
	var groups = new Array();
	var graph = new Array();
	var uncolored = new Array();

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

	this.getColor = function(groupID) {
		return getColor(groupID);
	}

	this.setColor = function(groupID, color) {
		return setColor(groupID, color);
	}

	this.getUncoloredCount = function() {
		return uncolored.length;
	}

///////////////////////////////////////////////////////////////////////////////
//
// Board setup subroutines
//
///////////////////////////////////////////////////////////////////////////////

	this.setupBoard = function() {
		const removed = 3;
		const seed = 20;
		var emptyCells = new Array();
		var setupSeq = new Array(maxCol * maxRow);
		var i, j, tmp;

		// Step 1. Empty the board
		emptyBoard(emptyCells);
		for(i = 0; i < seed; i++) {
			groups[i] = new Array();
			graph[i] = new Array();
		}

		// Step 2. Remove some cells for randomize
		setupSeq = emptyCells.slice(0);
		shuffle(setupSeq);
		for(i = 0; i < removed; i++) {
			board[setupSeq[i]] = ' ';
			emptyCells.splice(emptyCells.indexOf(setupSeq[i]), 1);
		}

		// Step 3. Generate grouping seeds
		setupSeq = emptyCells.slice(0);
		shuffle(setupSeq);
		for(i = 0; i < seed; i++) {
			board[setupSeq[i]] = i + 61;
			groups[i].push(setupSeq[i]);
			emptyCells.splice(emptyCells.indexOf(setupSeq[i]), 1);
		}

		// Step 4. Grouping for cells that ungrouped
		while(emptyCells.length > 0) {
			j = emptyCells.length;
			setupSeq = emptyCells.slice(0);
			shuffle(setupSeq);

			for(i = 0; i < j; i++) {
				tmp = grouping(setupSeq[i]);
				if(tmp >= 0) {
					board[setupSeq[i]] = tmp + 61;
					groups[tmp].push(setupSeq[i]);
					emptyCells.splice(emptyCells.indexOf(setupSeq[i]), 1);
				}
			}
		}

		// Step 5. Confirm the graph
		for(i = 0; i < seed-1; i++) {
			for(j = i+1; j < seed; j = j+1) {
				if(isNeighborG2G(groups[i], groups[j]) == 1) {
					graph[i].push(j);
					graph[j].push(i);
				}
			}
		}

		// Step 6. Fill the uncolored array
		for(i = 0; i < seed; i++) {
			uncolored.push(i);
		}
	}

	function emptyBoard(emptyCells) {
		var i;

		emptyCells.length = 0;
		for(i = 0; i < maxCol*maxRow; i++) {
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

		for(i = 0; i < groups.length; i++) {
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
			for(i = 1; i < candidates.length; i++) {
				if(groups[i].length < groups[min].length) {
					min = i;
				}
			}
			return candidates[min];
		}
	}

	function isNeighborG2G(g1, g2) {
		for(var i = 0; i < g2.length; i++) {
			if(isNeighborG2P(g1, g2[i]) == 1) {
				return 1;
			}
		}
		return 0;
	}

	function isNeighborG2P(g, xy) {
		for(var i = 0; i < g.length; i++) {
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
// Game related utilities
//
///////////////////////////////////////////////////////////////////////////////

	function getColor(groupID) {
		if(groups[groupID][0] > 3 || groups[groupID][0] < 0) {
			return -1;
		} else {
			return groups[groupID][0];
		}
	}

	function setColor(groupID, color) {
		var i;
		for(i = 0; i < groups[groupID].length; i++) {
			groups[groupID][i] = color;
		}
		uncolored.splice(uncolored.indexOf(groupID), 1);
	}

	function isColorOK(groupID, color) {
		var i;
		for(i = 0; i < graph[groupID].length; i++) {
			if(board[group[graph[i]][0]] == color) {
				return 0;
			}
		}
		return 1;
	}

///////////////////////////////////////////////////////////////////////////////
//
// General utilities
//
///////////////////////////////////////////////////////////////////////////////

	this.findGroup = function(xy) {
		var i;
		for(i = 0; i < groups.length; i++) {
			if(groups[i].indexOf(xy) != -1 && getColor(i) == -1) {
				return i;
			}
		}
		return -1;
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
		for(var i = 0; i < target.length; i++) {
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
