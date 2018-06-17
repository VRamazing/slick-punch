const GROUND_FRICTION = 0.7;
const AIR_RESISTANCE = 0.975;
const RUN_SPEED = 3.0;
const JUMP_POWER = 8;
const DOUBLE_JUMP_POWER = 12; // we need more force to counteract gravity in air
const GRAVITY = 0.55;
const MAX_AIR_JUMPS = 1; // double jump

function playerClass() {
	this.pos = vector.create(75, 75);
	this.speed = vector.create(0, 0);

	this.playerPic; // which picture to use
	this.name = "Player Character";
	this.health = 5;

	this.state = {
		'isOnGround': false,
		'isIdle': true,
		// 'isWalking': false,
		'isMovingLeft': false,
		'isCrouching': false,
		'isFacingUp': false,
		'isAttacking': false,
		'isDefending': false,
		'isJumping': false,
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
	this.keyHeld_Up_lastframe = false; // don't jump >1x per keypress

	this.controlKeyRight = null;
	this.controlKeyLeft = null;
	this.controlKeyUp = null;
	this.controlKeyDown = null;

	this.walkSprite = new SpriteSheetClass(playerWalkAnim, this.width, this.height); // 10 frames
	this.punchSprite = new SpriteSheetClass(playerPunchAnim, this.width, this.height); //7frames
	this.jumpSprite = new SpriteSheetClass(slickTileSet, this.width, this.height); //7 frames
	// this.playerLeftJabSprite = new SpriteSheetClass(playerLeftJabAnim, this.width, this.height); //7 frames
	// this.playerWalkJumpSprite = new SpriteSheetClass(playerWalkJumpAnim, this.width, this.height); //7 frames
	// this.playerIdleJumpSprite = new SpriteSheetClass(playerIdleJumpAnim, this.width, this.height); //7 frames
	// this.playerOverheadKickSprite = new SpriteSheetClass(playerOverheadKickAnim, this.width, this.height); //7 frames
	// this.playerHighKickSprite = new SpriteSheetClass(playerHighKickAnim, this.width, this.height); //7 frames
	// this.playerNormalKickSprite = new SpriteSheetClass(playerNormalKickAnim, this.width, this.height); //7 frames
	// this.playerIdleSprite = new SpriteSheetClass(playerIdleAnim, this.width, this.height); //7 frames






		// { varName: playerPunchAnim, theFile: "playerPunchsheet.png" },
		// { varName: playerWalkAnim, theFile: "playerWalksheet.png" },
		// { varName: slickTileSet, theFile: "slickTileset2.png" },
		// { varName: playerLeftJabAnim, theFile: "playerLeftJabsheet.png" },
		// { varName: playerWalkJumpAnim, theFile: "playerWalkJumpsheet.png" },
		// { varName: playerIdleJumpAnim, theFile: "SlickIdleJumpsheet.png" },
		// { varName: playerOverheadKickAnim, theFile: "playerOverheadKicksheet.png" },
		// { varName: playerHighKickAnim, theFile: "playerHighKicksheet.png" },
		// { varName: playerNormalKickAnim, theFile: "slickTileset2.png" },
		// { varName: playerJumpkick, theFile: "slickTileset2.png" },


	this.remove = false;
	this.frameRow = 0;
	this.justPunched = false;
	this.justJumped = false;
	this.justKicked = false;

	this.doubleJumpCount = 0;

	// this.speed = RUN_SPEED;
	this.incrementTick = function () {

		this.tickCount++;

		if (this.tickCount / this.ticksPerFrame >= this.framesAnim) {
			this.tickCount = 0;
			if (this.state.isAttacking) {
				// this.state.isAttacking = false; //play punching animation once per click punch btn
			}
		}
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
		this.doubleJumpCount = 0;

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

		if (this.state['isOnGround']) {

			this.speed.x *= GROUND_FRICTION;
			this.doubleJumpCount = 0;

		} else { // in the air

			this.speed.x *= AIR_RESISTANCE;
			this.speed.y += GRAVITY;

			if (this.speed.y > this.radius) { // cheap test to ensure can't fall through floor
				this.speed.y = this.radius;
			}
		}

		if (this.keyHeld_Left) {
			this.state.isWalking = true;
			this.state.isIdle = false;
			this.state.isAttacking = false;
			this.state.movingLeft = true;
			this.speed.x = -RUN_SPEED;
		}

		if (this.keyHeld_Right) {
			this.state.isWalking = true;
			this.state.isIdle = false;
			this.state.isAttacking = false;
			this.state.movingLeft = false;
			this.speed.x = RUN_SPEED;
		}

		if (this.keyHeld_Up && !this.keyHeld_Up_lastframe) {
			this.state.isWalking = false;
			this.state.isIdle = true;
			this.keyHeld_Up_lastframe = true;

			if (this.state['onGround']) { // regular jump
				//console.log("Normal Jump!");
				this.speed.y -= JUMP_POWER;
			}
			else if (this.doubleJumpCount < MAX_AIR_JUMPS) { // in the air?
				//console.log("Double Jump!");
				this.speed.y -= DOUBLE_JUMP_POWER;
				this.doubleJumpCount++;
			} else {
				//console.log("Ignoring triple jump...");
			}
		}

		// avoid multiple jumps from the same keypress
		this.keyHeld_Up_lastframe = this.keyHeld_Up;

		/* if (this.justJumped == false) {
		 	playJumpSound();
		 }*/


		if (!this.keyHeld_Left && !this.keyHeld_Right && !this.keyHeld_Up) {
			this.state.isWalking = false;
			this.state.isIdle = true;

		}

		if (this.state.isAttacking) {
			this.state.isIdle = false;
			this.state.isWalking = false;
			if (this.name == "Player") {
				if (distance(enemy.pos.x, enemy.pos.y, this.pos.x, this.pos.y) < 30) {
					// console.log('Removing enemy');
					enemy.remove = true;
				}
			}
			if (this.justPunched == false) {
				// playPunchSound();
			}
		}

		// We need to set "justPunched", so that we do not play the punch sound every frame
		if (this.state.isAttacking == false) {
			this.justPunched = false;
		} else {
			this.justPunched = true;
		}

		if (this.state['isOnGround'] == true) {
			this.justJumped = false;
		} else {
			this.justJumped = true;
		}

		// player.state.isAttacking = false;
		// 		player.state.isIdle = true;




		if (this.speed.y < 0 && isPlatformAtPixelCoord(this.pos.x, this.pos.y - this.radius) == 1) {
			this.pos.y = (Math.floor(this.pos.y / WORLD_H)) * WORLD_H + this.radius;
			this.speed.y = 0.0;
		}

		if (this.speed.y > 0 && isPlatformAtPixelCoord(this.pos.x, this.pos.y + this.radius) == 1) {
			this.pos.y = (1 + Math.floor(this.pos.y / WORLD_H)) * WORLD_H - this.radius;
			this.state['isOnGround'] = true;
			this.speed.y = 0;
		}
		else if (isPlatformAtPixelCoord(this.pos.x, this.pos.y + this.radius + 2) == 0) {
			this.state['isOnGround'] = false;
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
	} // end of player.move function

	this.draw = function () {

		//TODO : Each animation should take atmost 1 sec to complete. 
		//TODO : Clean all code. 

		if (this.state['isIdle']) {
			drawBitmapFlipped(this.playerPic, this.pos.x, this.pos.y, this.state.movingLeft);

			// this.spriteAnim = this.idleSprite;
			// this.framesAnim = 10;
			// this.walkSprite.draw(Math.floor(this.tickCount / this.ticksPerFrame), this.frameRow, this.pos.x, this.pos.y, this.ang, this.state.movingLeft);
		}
		else {
			if (this.state['isWalking']) {
				// console.log("Hey");
				this.spriteAnim = this.walkSprite;
				this.framesAnim = 10;
				this.walkSprite.draw(Math.floor(this.tickCount / this.ticksPerFrame), this.frameRow, this.pos.x, this.pos.y, this.ang, this.state.movingLeft);

			}

			if (this.state['isAttacking']) {
				this.spriteAnim = this.punchSprite;
				this.framesAnim = 4;
				this.punchSprite.draw(Math.floor(this.tickCount / this.ticksPerFrame), this.frameRow, this.pos.x, this.pos.y, this.ang, this.state.movingLeft);

			}

			// 	'isOnGround': false,
			//  'isIdle': false,
			//  'isWalking': false,
			//  'isMovingLeft': false,
			//  'isCrouching': false,
			//  'isFacingUp': false,


			//  'isAttacking': false,
			//  'isDefending': false,
			//  'isJumping': false,

			if (this.state['isJumping']) {
				this.spriteAnim = this.punchSprite;
				this.framesAnim = 7;
				this.punchSprite.draw(Math.floor(this.tickCount / this.ticksPerFrame), this.frameRow, this.pos.x, this.pos.y, this.ang, this.state.movingLeft);
			}



			if (this.spriteAnim) {
				this.spriteAnim.draw(Math.floor(this.tickCount / this.ticksPerFrame), this.frameRow, this.pos.x, this.pos.y, this.ang, this.state.movingLeft);
			}

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
	return (worldGrid[brickIndex] >= 0);
}