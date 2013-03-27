var ui = (function() {
	// Environmental variables
	var backContext;
	var img;
	var env;

	// Animation states
	const animatoinState = {
		idle		: 0,
		slideIn		: 1,
		slideOut	: 2,
		paint		: 3
	}
	var state = animatoinState.idle;

///////////////////////////////////////////////////////////////////////////////
//
// Public functions
//
///////////////////////////////////////////////////////////////////////////////

	function init(_env, _img, _backContext) {
		env = _env;
		img = _img;
		backContext = _backContext;
	}

	function resetSlideIn(bringInArms, isWarp) {
		prepareSubGraph();
		selected = -1;
	}

	function resetSlideOut(bringOutArms, isWarp) {
		selected = -1;
	}

	function resetPaint() {
	}

	function push() {
	}

	function draw() {
		// Clear background
		backContext.drawImage(img.background, 0, 0);
	}
	

///////////////////////////////////////////////////////////////////////////////
//
// Board releted subroutines
//
///////////////////////////////////////////////////////////////////////////////

	var selected;

	function prepareSubGraph() {
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
		if(state != animatoinState.idle) {
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
