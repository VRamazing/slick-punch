const GROUND_FRICTION = 0.7;
const AIR_RESISTANCE = 0.975;
const RUN_SPEED = 3.0;
const JUMP_POWER = 5.5;
const GRAVITY = 0.55;

function playerClass() {
	this.pos = vector.create(75, 75);
	this.speed = vector.create(0, 0);

	this.playerPic; // which picture to use
	this.name = "Player Character";
	this.state = {
		'onGround': false,
		'isRunning': false,
		'movingLeft': false,
		'isPunching': false,
		'isDucking': false,
		'isJumping': false,
		'isIdle': false
	};

	this.radius = 35;

	this.width = 80;
	this.height = 80;
	this.ang = 0;

	this.health = 0;
	this.removeMe = false;

	this.tickCount = 0;
	this.ticksPerFrame = 5;
	this.spriteAnim = null;
	this.framesAnim = null;

	this.keyHeld_Right = false;
	this.keyHeld_Left = false;
	this.keyHeld_Down = false;
	this.keyHeld_Up = false;

	this.controlKeyRight = null;
	this.controlKeyLeft = null;
	this.controlKeyUp = null;
	this.controlKeyDown = null;

	this.walkSprite = new SpriteSheetClass(playerWalkAnim, this.width, this.height); // 10 frames
	this.jumpSprite = new SpriteSheetClass(playerJumpAnim, this.width, this.height); //7 frames
	this.punchSprite = new SpriteSheetClass(playerPunchAnim, this.width, this.height); //7frames
	this.remove = false;

	this.frameRow = 0;

	this.justPunched = false;
	this.justJumped = false;
	this.justKicked = false;

	// this.speed = RUN_SPEED;
	this.incrementTick = function () {

		this.tickCount++;

		if (this.tickCount / this.ticksPerFrame >= this.framesAnim) {
			this.tickCount = 0;
			if (this.state.isPunching) {
				this.state.isPunching = false; //play punching animation once per click punch btn
			}
		}

		// if(this.tickCount >= this.numFrames * this.ticksPerFrame) {
		// 	this.tickCount = 0;
		// }
	};

	this.setupInput = function (upKey, rightKey, downKey, leftKey) {
		this.controlKeyUp = upKey;
		this.controlKeyRight = rightKey;
		this.controlKeyDown = downKey;
		this.controlKeyLeft = leftKey;
	}

	this.takeDamage = function (howMuch) {
		console.log("Damage received: " + howMuch);
		this.health -= howMuch;
		if (this.health <= 0) {
			console.log("PLAYER HAS 0 HP - todo: gameover/respawn");
		}
	}

	this.reset = function (whichImage, playerName, health) {
		this.name = playerName;
		this.playerPic = whichImage;
		this.health = health;
		if (this.name == "Enemy") {
			this.state.movingLeft = true;
		}


		for (var eachRow = 0; eachRow < WORLD_ROWS; eachRow++) {
			for (var eachCol = 0; eachCol < WORLD_COLS; eachCol++) {
				var arrayIndex = rowColToArrayIndex(eachCol, eachRow);
				if (worldGrid[arrayIndex] == WORLD_PLAYERSTART) {
					worldGrid[arrayIndex] = WORLD_BACKGROUND;
					// this.ang = -Math.PI/2;
					this.pos.x = eachCol * WORLD_W + WORLD_W / 2;
					this.pos.y = eachRow * WORLD_H + WORLD_H / 2;
					return;
				} // end of player start if
			} // end of col for
		} // end of row for
		console.log("NO PLAYER START FOUND!");
	} // end of playerReset func

	this.move = function () {

		if (this.state['onGround']) {

			this.speed.x *= GROUND_FRICTION;

		} else {

			this.speed.x *= AIR_RESISTANCE;
			this.speed.y += GRAVITY;

			if (this.speed.y > this.radius) { // cheap test to ensure can't fall through floor
				this.speed.y = this.radius;
			}
		}

		if (this.keyHeld_Left) {
			this.state.isRunning = true;
			this.state.isIdle = false;
			this.state.isPunching = false;
			this.state.movingLeft = true;

			this.speed.x = -RUN_SPEED;
		}

		if (this.keyHeld_Right) {
			this.state.isRunning = true;
			this.state.isIdle = false;
			this.state.isPunching = false;
			this.state.movingLeft = false;
			this.speed.x = RUN_SPEED;
		}

		if (this.keyHeld_Up) {
			this.state.isRunning = false;
			this.state.isIdle = true;
			if (this.state['onGround']) {
				this.speed.y -= JUMP_POWER;
			}

			if (this.justJumped == false) {
				playJumpSound();
			}

		}

		if (!this.keyHeld_Left && !this.keyHeld_Right && !this.keyHeld_Up) {
			this.state.isRunning = false;
			this.state.isIdle = true;

		}

		if (this.state.isPunching) {
			this.state.isIdle = false;
			this.state.isRunning = false;
			if (this.name == "Player") {
				if (distance(enemy.pos.x, enemy.pos.y, this.pos.x, this.pos.y) < 30) {
					// console.log('Removing enemy');
					enemy.remove = true;
				}
			}
			if (this.justPunched == false) {
				playPunchSound();
			}
		}

		// We need to set "justPunched", so that we do not play the punch sound every frame
		if (this.state.isPunching == false) {
			this.justPunched = false;
		} else {
			this.justPunched = true;
		}

		if (this.state['onGround'] == true) {
			this.justJumped = false;
		} else {
			this.justJumped = true;
		}

		// player.state.isPunching = false;
		// 		player.state.isIdle = true;




		if (this.speed.y < 0 && isPlatformAtPixelCoord(this.pos.x, this.pos.y - this.radius) == 1) {
			this.pos.y = (Math.floor(this.pos.y / WORLD_H)) * WORLD_H + this.radius;
			this.speed.y = 0.0;
		}

		if (this.speed.y > 0 && isPlatformAtPixelCoord(this.pos.x, this.pos.y + this.radius) == 1) {
			this.pos.y = (1 + Math.floor(this.pos.y / WORLD_H)) * WORLD_H - this.radius;
			this.state['onGround'] = true;
			this.speed.y = 0;
		} else if (isPlatformAtPixelCoord(this.pos.x, this.pos.y + this.radius + 2) == 0) {
			this.state['onGround'] = false;
		}

		if (this.speed.x < 0 && isPlatformAtPixelCoord(this.pos.x - this.radius, this.pos.y) == 1) {
			this.pos.x = (Math.floor(this.pos.x / WORLD_W)) * WORLD_W + this.radius;
		}
		if (this.speed.x > 0 && isPlatformAtPixelCoord(this.pos.x + this.radius, this.pos.y) == 1) {
			this.pos.x = (1 + Math.floor(this.pos.x / WORLD_W)) * WORLD_W - this.radius;
		}


		this.pos.addTo(this.speed) // same as above, but for vertical

		playerWorldHandling(this);
		this.incrementTick();
	}

	this.draw = function () {



		if (this.state['isIdle']) {
			drawBitmapFlipped(this.playerPic, this.pos.x, this.pos.y, this.state.movingLeft)

		}
		else {
			if (this.state['isRunning']) {
				this.spriteAnim = this.walkSprite;
				this.framesAnim = 10;
			}

			if (this.state['isPunching']) {
				this.spriteAnim = this.punchSprite;
				this.framesAnim = 7;

				// this.punchSprite.draw(Math.floor(this.tickCount / this.ticksPerFrame), this.frameRow, this.pos.x, this.pos.y, this.ang, this.state.movingLeft);

			}

			if (this.state['isJumping']) {



			}
			this.spriteAnim.draw(Math.floor(this.tickCount / this.ticksPerFrame), this.frameRow, this.pos.x, this.pos.y, this.ang, this.state.movingLeft);


		}

	}
}

function isPlatformAtPixelCoord(hitPixelX, hitPixelY) {
	var tileCol = hitPixelX / WORLD_W;
	var tileRow = hitPixelY / WORLD_H;

	// using Math.floor to round down to the nearest whole number
	tileCol = Math.floor(tileCol);
	tileRow = Math.floor(tileRow);

	// first check whether the jumper is within any part of the brick wall
	if (tileCol < 0 || tileCol >= WORLD_COLS ||
		tileRow < 0 || tileRow >= WORLD_ROWS) {
		return false;
	}

	var brickIndex = rowColToArrayIndex(tileCol, tileRow);
	return (worldGrid[brickIndex] == 1);
}


































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































