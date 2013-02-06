var loader = (function() {
	var drawLoading = function(context, backCanvas, backContext) {
		// Clear background
		backContext.fillStyle = "#cedfe7";
		backContext.fillRect(0, 0, 800, 480);

		// Flip
		context.drawImage(backCanvas, 0, 0);

		// Debug messages
		context.textBaseline = "top";	
		context.fillStyle = "#000000";
		context.font = "14px monospace";
		context.textAlign = "right";
		context.fillText("so far so good!", 800, 0);
	}

	return {
		drawLoading: drawLoading
	};
})();
