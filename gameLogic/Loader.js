var loader = (function() {
	function drawLoading() {
		var backContext = coloringProblem.getBackContext();

		// Clear background
		backContext.fillStyle = "#cedfe7";
		backContext.fillRect(0, 0, 800, 480);
	}

	return {
		drawLoading: drawLoading
	};
})();
