var dialog = (function() {
	// Environmental variables
	var backContext;
	var img;
	var env;

	// Dialog variables
	const maxDialogT = 6;
	const panelW = 100, panelH = 90;
	var dialogT;
	var dialogCanvas, dialogContext;
	var dialogState;
	var x, y, w, h;
	var dx, dy, dw, dh;

	// Dialog dimension parameters
	const dialogTypes = {
		unknown : -1,
		result	: 1,
		quit	: 2
	};
	const params = [
		[dialogTypes.unknown,	"Unknown",	400, 240, 20, 20],
		[dialogTypes.result,	"Result",	400, 240, 200, 150],
		[dialogTypes.quit,		"Quit",		400, 240, 100, 80]
	];

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

	function popup(type) {
		prepareDialog(type);
		dialogState = 1;
	}

	function close() {
		dialogState = 0;
	}

	function transform() {
	}

	function push() {
	}

	function draw() {
		if(dialogState == 0) {
			return;
		}

		backContext.drawImage(dialogCanvas, x-w/2, y-h/2);
	}

///////////////////////////////////////////////////////////////////////////////
//
// Private functions
//
///////////////////////////////////////////////////////////////////////////////

	function prepareDialog(type) {
		var param = getType(type);
		x = param[2]; y = param[3]; w = param[4]; h = param[5];

		// Draw conners
		dialogContext.drawImage(img.panel, 0, 0, 10, 10, 0, 0, 10, 10);
		dialogContext.drawImage(img.panel, panelW-10, 0, 10, 10, param[4]-10, 0, 10, 10);
		dialogContext.drawImage(img.panel, panelW-10, panelH-10, 10, 10, param[4]-10, param[5]-10, 10, 10);
		dialogContext.drawImage(img.panel, 0, panelH-10, 10, 10, 0, param[5]-10, 10, 10);

		// Draw sides
		dialogContext.drawImage(img.panel, 0, 10, 10, panelH-20, 0, 10, 10, param[5]-20);
		dialogContext.drawImage(img.panel, 10, 0, panelW-20, 10, 10, 0, param[4]-20, 10);
		dialogContext.drawImage(img.panel, panelW-10, 10, 10, panelH-20, param[4]-10, 10, 10, param[5]-20);
		dialogContext.drawImage(img.panel, 10, panelH-10, panelW-20, 10, 10, param[5]-10, param[4]-20, 10);

		// Fill center
		dialogContext.drawImage(img.panel, 10, 10, 10, 10, 10, 10, param[4]-20, param[5]-20);
	}

	function getType(input) {
		var i, output = params[0];

		for(i = 0; i < params.length; i++) {
			if(params[i][1] == input) {
				output = params[i];
				break;
			}
		}

		return output;
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
