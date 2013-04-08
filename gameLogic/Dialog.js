var dialog = (function() {
	// Environmental variables
	var backContext;
	var img;
	var env;

	// Dialog variables
	const maxDialogT = 4;
	var dialogCanvas, dialogContext;
	var dialogState;

///////////////////////////////////////////////////////////////////////////////
//
// Public functions
//
///////////////////////////////////////////////////////////////////////////////

	function init(_env, _img, _backContext) {
		env = _env;
		img = _img;
		backContext = _backContext;

		// Initialize dialog variables
		dialogState = 0;
	
		// Create off-screen canvas for dialog
		dialogCanvas = document.createElement("canvas");
		dialogCanvas.width = env.screenWidth;
		dialogCanvas.height = env.screenHeight;
		dialogContext = dialogCanvas.getContext("2d");
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
		if(dailogState < 0) {
			return;
		}
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
