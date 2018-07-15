//Player Movement
const KEY_LEFT_ARROW = 37;
const KEY_UP_ARROW = 38; 
const KEY_RIGHT_ARROW = 39; 
const KEY_DOWN_ARROW = 40; 
const KEY_Z = 90; 
const KEY_X = 88;
// Toggle music
const KEY_M = 77; 
// Toggle Debug
const KEY_D = 68;
//Used for menu Screen
const KEY_C = 67;
const KEY_H = 72;
const KEY_P = 80;
const KEY_S = 83;


//TODO : Make attacks more smooth
//TODO : COmbo moves

function setupInput() {
	// canvas.addEventListener('mousemove', updateMousePos);
	document.addEventListener('keydown', keyPressed);
	document.addEventListener('keyup', keyReleased);
	// greenCar.setupInput(KEY_W, KEY_D, KEY_S, KEY_A);
	player.setupInput(KEY_UP_ARROW, KEY_RIGHT_ARROW, KEY_DOWN_ARROW, KEY_LEFT_ARROW, KEY_Z, KEY_X, KEY_C );
} 

// function updateMousePos(evt) {
// 	var rect = canvas.getBoundingClientRect();
// 	var root = document.documentElement;

// 	mouseX = evt.clientX - rect.left - root.scrollLeft;
// 	mouseY = evt.clientY - rect.top - root.scrollTop;

// 	// cheat / hack to test car in any position
// 	/*carX = mouseX;
// 	carY = mouseY;
// 	carSpeedX = 4;
// 	carSpeedY = -4;*/
// }

function keySet(keyEvent, whichPlayer, setTo) {
	if(keyEvent.keyCode == whichPlayer.controlKeyLeft) {
		whichPlayer.keyHeld_Left = setTo;
	}
	if(keyEvent.keyCode == whichPlayer.controlKeyRight) {
		whichPlayer.keyHeld_Right = setTo;
	}
	if(keyEvent.keyCode == whichPlayer.controlKeyUp) {
		whichPlayer.keyHeld_Up = setTo;
	}
	if(keyEvent.keyCode == whichPlayer.controlKeyDown) {
		// console.log("setting" + whichPlayer.keyHeld_Down + "to : " + setTo);
		whichPlayer.keyHeld_Down = setTo;
	}
	if(keyEvent.keyCode == whichPlayer.controlKeyAttack) {
		whichPlayer.keyHeld_Attack = setTo;
	}
	if(keyEvent.keyCode == whichPlayer.controlKeyJump) {
		whichPlayer.keyHeld_Jump = setTo;
	}
	if(keyEvent.keyCode == whichPlayer.controlKeyDefend) {
		whichPlayer.keyHeld_Defend = setTo;
	}
}

function keyPressed(evt) {
	// console.log("Key pressed: "+evt.keyCode);
	// keySet(evt, greenCar, true);
	keySet(evt, player, true);
	//Attack mode as soon as you press key 
	//Shouldn't work if kept pressed. 

	// if(evt.keyCode == KEY_Z && player.state.isAttacking == false){		
		
	// }
	evt.preventDefault();
}

function keyReleased(evt) {
	// console.log("Key pressed: "+evt.keyCode);
	keySet(evt, player, false);

	if (evt.keyCode == KEY_M) {
		musicEnabled = !musicEnabled;
	}
	if (evt.keyCode == KEY_D) {
		debug = !debug;
	}
	if (evt.keyCode == KEY_P) {
		debug = !debug;
	}
	if (evt.keyCode == KEY_H) {
		debug = !debug;
	}
	if (evt.keyCode == KEY_C) {
		debug = !debug;
	}
	if (evt.keyCode == KEY_S) {
		debug = !debug;
	}
	// if(evt.keyCode == KEY_Z && player.state.isAttacking){		
	// 	player.setStateValueTo("isIdle", true);
	// 	player.setStateValueTo("isAttacking", false);
	// }
}