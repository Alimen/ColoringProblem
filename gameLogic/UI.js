var ui = (function() {
	var backContext;
	var img;
	var env;

	const animatoinState = {
		idle		: 0,
		slideIn		: 1,
		slideOut	: 2,
		paint		: 3
	}
	var state = animatoinState.idle;

	function init(_env, _img, _backContext) {
		env = _env;
		img = _img;
		backContext = _backContext;
	}

	function resetSlideIn(bringInArms, isWarp) {
	}

	function resetSlideOut(bringOutArms, isWarp) {
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
// Setup public access
//
///////////////////////////////////////////////////////////////////////////////

	function setSelect(_select) {
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
