var dialog = (function() {
	// Environmental variables
	var backContext;
	var img;
	var env;

///////////////////////////////////////////////////////////////////////////////
//
// Public functions
//
///////////////////////////////////////////////////////////////////////////////

	function init(_env, _img, _backContext) {
		env = _env;
		img = _img;
		backContext = _backContext
	}

	function popup() {
	}

	function close() {
	}

	function transform() {
	}

	function push() {
	}

	function draw() {
	}

///////////////////////////////////////////////////////////////////////////////
//
// Setup public access
//
///////////////////////////////////////////////////////////////////////////////

	return {
		init : init,
		popup : popup,
		close : close,
		transform : transform,
		push : push,
		draw : draw
	};
})();
