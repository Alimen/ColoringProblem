var hud = (function() {
	// Environmental variables
	var backContext;
	var img;
	var env;

	// Sliding movement variables
	var shiftY;
	var slideSpeed, slideAccel;
	var slideCurrentPos, slideTargetPos;
	var slideT, maxSlideT;
	
	// HUD variables
	var soundon;
	var mousePassSound, mousePassTitle;
	var menuIconX;

///////////////////////////////////////////////////////////////////////////////
//
// Public functions
//
///////////////////////////////////////////////////////////////////////////////

	function init(_env, _img, _backContext) {
		env = _env;
		img = _img;
		backContext = _backContext;

		reset();
	}

	function reset() {
		shiftY = 0;
		soundon = 1;
		mousePassSound = -1;
		mousePassTitle = -1;
	}

	function resetSliding(targetPos) {
	}

	function push() {
	}

	function draw() {
		backContext.drawImage(img.hud, 0, 0, 800, 79, 0, shiftY, 800, 79);
		backContext.drawImage(img.hud, 801, 0, 152, 79, env.screenWidth/2-76, shiftY, 152, 79);

		// Draw title icon
		if(mousePassTitle >= 0) {
			backContext.drawImage(img.glow, mousePassTitle*80, 0, 80, 86, 745, shiftY-10, 40, 43);
		}
		backContext.drawImage(img.misc, 320, 0, 80, 64, 745, shiftY, 40, 32);

		// Draw sound on/off icon
		if(mousePassSound >= 0) {
			backContext.drawImage(img.glow, mousePassSound*80, 0, 80, 86, 760, shiftY+30, 40, 43);
		}
		if(soundon == 1) {
			backContext.drawImage(img.misc, 160, 0, 80, 64, 760, shiftY+40, 40, 32);
		} else {
			backContext.drawImage(img.misc, 240, 0, 80, 64, 760, shiftY+40, 40, 32);
		}
	}

	function checkMousePassTitle(x, y, turn) {
		if(x > 745 && x <= 800 && y > shiftY-10 && y <= shiftY+40) {
			mousePassTitle = turn;
		} else {
			mousePassTitle = -1;
		}
		return mousePassTitle;
	}

	function checkMousePassSound(x, y, turn) {
		if(x > 760 && x <= 800 && y > shiftY+40 && y <= shiftY+72) {
			mousePassSound = turn;
		} else {
			mousePassSound = -1;
		}
		return mousePassSound;
	}

///////////////////////////////////////////////////////////////////////////////
//
// Setup public access
//
///////////////////////////////////////////////////////////////////////////////

	function setSoundon(_soundon) { soundon = _soundon; }
	
	return {
		init : init,
		reset : reset,
		resetSliding : resetSliding,
		push : push,
		draw : draw,

		checkMousePassTitle : checkMousePassTitle,
		checkMousePassSound : checkMousePassSound,
		setSoundon : setSoundon
	};
})();
