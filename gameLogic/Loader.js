var loader = (function() {
	var res;

	function init(input) {
		res = input;
	}

	function draw() {
		var backContext = coloringProblem.getBackContext();

		// Clear background
		backContext.fillStyle = "#cedfe7";
		backContext.fillRect(0, 0, 800, 480);

		backContext.drawImage(res.imgTiles, 0, 0);
	}

	return {
		init : init,
		draw : draw
	};
})();
