var loader = (function() {
	var backContext;
	var img;
	var env;

	function init(_env, _img, _backContext) {
		env = _env;
		img = _img;
		backContext = _backContext;
	}

	function draw(percentage) {
		// Clear background
		backContext.fillStyle = "#cedfe7";
		backContext.fillRect(0, 0, env.screenWidth, env.screenHeight);
		
		// Print percentage
		backContext.textBaseline = "bottom";	
		backContext.fillStyle = "#000000";
		backContext.font = "14px monospace";
		backContext.textAlign = "center";
		backContext.fillText(percentage + "%", env.screenWidth/2, 200);

		// Draw progress bar
		var t = Math.floor(percentage/10);
		var color;
		if(percentage < 30) {
			color = 1;
		} else if(percentage < 60) {
			color = 2;
		} else {
			color = 3;
		}
		for(var i = 0; i < 10; i++) {
			if(i < t) {
				backContext.drawImage(img.tiles, 400, 46*color, 40, 46, 200+i*40, 240, 40, 46);
			} else if(i > t) {
				backContext.drawImage(img.tiles, 0, 0, 40, 46, 200+i*40, 240, 40, 46);
			} else {
				backContext.drawImage(img.tiles, (percentage-i*10)*40, 46*color, 40, 46, 200+i*40, 240, 40, 46);
			}
			backContext.drawImage(img.tileBorder, 40, 0, 40, 46, 200+i*40, 240, 40, 46);
			backContext.drawImage(img.tileBorder, 80, 0, 40, 46, 200+i*40, 240, 40, 46);
		}
		backContext.drawImage(img.tileBorder, 0, 0, 40, 46, 560, 240, 40, 46);
	}

	return {
		init : init,
		draw : draw
	};
})();
