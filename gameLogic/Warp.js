var warp = (function() {
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
		backContext = _backContext;

		reset();
	}

	function reset() {
		fadeT = -1;
	}

///////////////////////////////////////////////////////////////////////////////
//
// Fade in/out subroutines
//
///////////////////////////////////////////////////////////////////////////////

	// Fade-in/out variables
	var fadeState, fadeAlpha;
	var fadeT;

	function resetFade(fadeout) {
		if(fadeout == 1) {
			fadeAlpha = 0.0;
			fadeState = 0;
		} else {
			console.log("fadeout = ", fadeout);
			fadeAlpha = 1.0;
			fadeState = 2;
		}
		fadeT = 0;
	}

	function pushFade() {
		if(fadeT < 0) {
			return;
		}

		switch(fadeState) {
		case 0:
			fadeAlpha = fadeAlpha + 0.1;
			if(fadeAlpha > 1.0) {
				fadeAlpha = 1.0;
				fadeT = 30;
				fadeState = 1;
			}
			break;

		case 1:
			fadeT--;
			break;

		case 2:
			fadeAlpha = fadeAlpha - 0.01;
			if(fadeAlpha < 0.0) {
				fadeAlpha = 0.0;
				fadeT = -1;
			}
			break;
		}
	}

	function drawFade() {
		if(fadeT < 0) {
			return;
		}

		// Draw fading square
		backContext.fillStyle = "rgba(255, 255, 255, "+fadeAlpha+")";
		backContext.fillRect(0, 0, env.screenWidth, env.screenHeight);
	}

///////////////////////////////////////////////////////////////////////////////
//
// Setup public access
//
///////////////////////////////////////////////////////////////////////////////

	return {
		init : init,
		resetFade : resetFade,
		pushFade : pushFade,
		drawFade : drawFade
	};
})();
