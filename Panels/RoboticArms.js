var arm1 = (function() {
	// General variables
	var backContext;
	var imgArm1;
	var env;

	// Robotic arm movement variables
	var shiftX = -30;
	var lowerArmX, lowerArmY;
	var upperArmX, upperArmY;
	var tipX, tipY;
	var laserX, laserY;
	var r1, r2, r3;

///////////////////////////////////////////////////////////////////////////////
//
// Arm1 movements
//
///////////////////////////////////////////////////////////////////////////////

	function init(_env, _img, _backContext) {
		env = _env;
		imgArm1 = _img.arm1;
		backContext = _backContext;
	}

	function reset() {
		push(env.screenWidth/2, env.screenHeight/2);
	}

	function push(x, y) {
		// Cacluate laser head position
		lowerArmX = 125 + shiftX;
		lowerArmY = 392;
		var l = Math.sqrt((x-lowerArmX)*(x-lowerArmX) + (y-lowerArmY)*(y-lowerArmY));
		laserX = lowerArmX + (x - lowerArmX)*0.3;
		laserY = lowerArmY + (y - lowerArmY)*0.3 - (env.screenHeight - l)*0.2;
		r3 = angle(laserX, laserY, x, y);
		
		// Caculate tip angle
		tipX = laserX - Math.cos(-1.02-r3)*57;
		tipY = laserY + Math.sin(-1.02-r3)*57;
		var r0 = angle(lowerArmX, lowerArmY, tipX, tipY);

		// Solve lower arm angle by cosine rules
		var a = 125, b = Math.sqrt((tipX-lowerArmX)*(tipX-lowerArmX)+(tipY-lowerArmY)*(tipY-lowerArmY)), c = 121;
		r1 = r0 - Math.acos((a*a + b*b - c*c) / (2*a*b));
		
		// Caculate upper arm angle
		upperArmX = lowerArmX + Math.cos(r1) * a;
		upperArmY = lowerArmY + Math.sin(r1) * a;
		r2 = angle(upperArmX, upperArmY, tipX, tipY);
	}

	function draw() {
		// Draw bottom rare
		backContext.drawImage(imgArm1, 165, 71, 35, 15, 115+shiftX, 398, 35, 15);

		// Draw lower arm
		backContext.save();
		backContext.setTransform(1, 0, 0, 1, 0, 0);
		backContext.translate(lowerArmX, lowerArmY);
		backContext.rotate(r1 + Math.PI + 0.12);
		backContext.drawImage(imgArm1, 0, 66, 150, 54, -132, -26, 150, 54);
		backContext.restore();

		// Draw tip
		backContext.save();
		backContext.setTransform(1, 0, 0, 1, 0, 0);
		backContext.translate(tipX, tipY);
		backContext.rotate(r3);
		backContext.drawImage(imgArm1, 159, 0, 51, 55, -20, 0, 51, 55);
		backContext.restore();

		// Draw upper arm
		backContext.save();
		backContext.setTransform(1, 0, 0, 1, 0, 0);
		backContext.translate(upperArmX, upperArmY);
		backContext.rotate(r2 - 0.22);
		backContext.drawImage(imgArm1, 0, 0, 158, 65, -25, -25, 158, 65);
		backContext.restore();
		
		// Draw bottom front
		backContext.drawImage(imgArm1, 0, 121, 171, 110, 0+shiftX, 370, 171, 110);
	}

	function angle(ax, ay, bx, by) {
		var l = Math.sqrt((bx-ax)*(bx-ax)+(by-ay)*(by-ay));
		var r = Math.asin((by-ay) / l);
		if(bx < ax) {
			r = (-1)*r + Math.PI;
		}
		return r;
	}

///////////////////////////////////////////////////////////////////////////////
//
// Setup public access
//
///////////////////////////////////////////////////////////////////////////////

	return {
		init : init,
		reset : reset,
		push : push,
		draw : draw
	};
})();

///////////////////////////////////////////////////////////////////////////////

var arm2 = (function() {
	// General variables
	var backContext;
	var imgArm2;
	var env;
	
	// Robotic arm movement variables
	var shiftX = 30;
	var lowerArmX, lowerArmY;
	var upperArmX, upperArmY;
	var tipX, tipY;
	var laserX, laserY;
	var r1, r2, r3;
	
///////////////////////////////////////////////////////////////////////////////
//
// Arm1 movements
//
///////////////////////////////////////////////////////////////////////////////

	function init(_env, _img, _backContext) {
		env = _env;
		imgArm2 = _img.arm2;
		backContext = _backContext;
	}

	function reset() {
		push(env.screenWidth/2, env.screenHeight/2);
	}

	function push(x, y) {
		// Caculate lower arm angle
		lowerArmX = 696 + shiftX;
		lowerArmY = 383;
		var maxLength = Math.sqrt(env.screenWidth*env.screenWidth+env.screenHeight*env.screenHeight);
		var l = Math.sqrt((x-lowerArmX)*(x-lowerArmX) + (y-lowerArmY)*(y-lowerArmY));
		var offset = (1 - l / maxLength) * 0.5 * Math.PI;
		var r0 = angle(lowerArmX, lowerArmY, x, y);
		r1 = r0 + offset;

		// Caculate upper arm angle
		upperArmX = lowerArmX + Math.cos(r1 + 0.36)*117;
		upperArmY = lowerArmY + Math.sin(r1 + 0.36)*117;
		r2 = r0 - offset + Math.PI + (1 - l / maxLength);

		// Caculate tip angle
		tipX = upperArmX + Math.cos(r2 + 3.13)*146;
		tipY = upperArmY + Math.sin(r2 + 3.13)*146;
		r3 = angle(tipX, tipY, x, y) + Math.PI;
		
		// Cacluate laser head position
		laserX = tipX + Math.cos(r3+3.15)*23;
		laserY = tipY + Math.sin(r3+3.15)*23;
	}

	function draw() {
		// Draw bottom
		backContext.drawImage(imgArm2, 0, 130, 158, 125, env.screenWidth-158+shiftX, env.screenHeight-125, 158, 125);

		// Draw tip
		backContext.save();
		backContext.setTransform(1, 0, 0, 1, 0, 0);
		backContext.translate(tipX, tipY);
		backContext.rotate(r3);
		backContext.drawImage(imgArm2, 152, 95, 40, 40, -25, -17, 40, 40);
		backContext.restore();

		// Draw upper arm
		backContext.save();
		backContext.setTransform(1, 0, 0, 1, 0, 0);
		backContext.translate(upperArmX, upperArmY);
		backContext.rotate(r2);
		backContext.drawImage(imgArm2, 0, 0, 196, 50, -160, -20, 196, 50);
		backContext.restore();

		// Draw lower arm
		backContext.save();
		backContext.setTransform(1, 0, 0, 1, 0, 0);
		backContext.translate(lowerArmX, lowerArmY);
		backContext.rotate(r1);
		backContext.drawImage(imgArm2, 0, 50, 150, 83, -23, -22, 150, 83);
		backContext.restore();
	}

	function angle(ax, ay, bx, by) {
		var l = Math.sqrt((bx-ax)*(bx-ax)+(by-ay)*(by-ay));
		var r = Math.asin((by-ay) / l);
		if(bx < ax) {
			r = (-1)*r + Math.PI;
		}
		return r;
	}

///////////////////////////////////////////////////////////////////////////////
//
// Setup public access
//
///////////////////////////////////////////////////////////////////////////////

	return {
		init : init,
		reset : reset,
		push : push,
		draw : draw
	};
})();
