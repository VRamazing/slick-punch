
const TEXT_COLOR = "black";
var firstLoad = true;
var isPaused = false; 
var windowState = {
	inFocus : true, 
	help : false,
	mainMenu : true,
	credits : false,
	endingScreen: false ,
	sound: false
};

var TitleTextY,subTitleTextX,opacity;
var endScreenY = 600;
const TITLE_OFFSET = 175;

function mainMenuStates() {
	if(windowState.mainMenu){
		canvasContext.drawImage(menuBackground,0,0);
		mainMenu.setButtonBounds();
		mainMenu.drawButtons(opacity);		
		if(subTitleTextX <= canvas.width/2 - 12 ){
			subTitleTextX+=15;
		}
		else if(!windowState.help && opacity < 1) {
			opacity = opacity + 0.009;
		}
	}
	else if(windowState.credits){
		opacity = 1;
		canvasContext.drawImage(menuBackgroundEmpty,0,0);
		colorText('CREDITS',canvas.width/2 , 80,TEXT_COLOR,"40px Tahoma","center",opacity);
		var textX = 15;
		var textY = 200;
		var textSkip = 20;
		var creditsFont = "16px Tahoma";
		var creditsNameFont = "bold 16px Tahoma";
		var creditsLines = [
			"Vignesh Ramesh:",
			"Christer McFunkyPants"
		];
		for(var i=0;i<creditsLines.length;i++) {
			var creditor = creditsLines[i].split(":");
			//Break credits to 2 lines based on requirement
			var creditWidth = canvasContext.measureText(creditor[1]).width;
			if(creditWidth > canvas.width){
				creditor[2] = creditor[1].substring(creditor[1].length/2, creditor[1].length)
				creditor[1] = creditor[1].substring(0, creditor[1].length/2)
			}
			colorText(creditor[0],textX,textY ,TEXT_COLOR,creditsNameFont,"left",opacity); textY += textSkip;
			colorText(creditor[1],textX  + 15,textY ,TEXT_COLOR,creditsFont,"left",opacity); textY += textSkip;
			colorText(creditor[2],textX  + 15,textY ,TEXT_COLOR,creditsFont,"left",opacity); textY += textSkip;

		}
		colorText('Press [Enter] to go Back to Menu',canvas.width/2 , 550,TEXT_COLOR,"30px Tahoma","center",opacity);
	}
	else if(windowState.help){
		opacity = 1;
		canvasContext.drawImage(menuBackgroundEmpty,0,0);
		colorText('How To Play',canvas.width/2 ,100,TEXT_COLOR,"30px Tahoma","center",opacity);
		colorText('Press [Enter] to go Back to Menu',canvas.width/2 , 550,TEXT_COLOR,"30px Tahoma","center",opacity);
		
	}
	else if(windowState.sound){
		canvasContext.drawImage(menuBackgroundEmpty,0,0);
		colorText('Sound ',canvas.width/2 ,100,TEXT_COLOR,"30px Tahoma","center",opacity);
		mainMenu.setupSliders();		
		mainMenu.handleSliders();	
		mainMenu.drawSliders(opacity);	
		colorText('Press [Enter] to Start game',canvas.width/2 , 500,TEXT_COLOR,"30px Tahoma","center",opacity);

	}
	else if (windowState.endingScreen) {
		colorRect(0,0, canvas.width, canvas.height, "black");
		canvasContext.drawImage(excaliburEndScreenBillboard,0,endScreenY);
		if (endScreenY > 10) {
			endScreenY -= 1;
		}
	}
}

function openHelp() {
	if(isPaused) {
		return;
	}
	windowState.mainMenu = false;
	windowState.help = true;
}

function openCredits() {
	if(isPaused) {
		return;
	}
	windowState.mainMenu = false;
	windowState.credits = true;
}

function setSoundSystem(){
	if(isPaused) {
		return;
	}
	windowState.mainMenu = false;
	windowState.sound = true;
}

function backToMainMenuFromCredits() {
	if(isPaused) {
		return;
	}
	windowState.credits = false;
	windowState.mainMenu = true;
}

function togglePause(){
    var levelIsInPlay = assaultMode || waveStarted || carnageStarted || twoPlayerMode;
    if((!levelIsInPlay || windowState.help) && !orchestratorMode){
		console.log(waveStarted, windowState.help, orchestratorMode, twoPlayerMode);	
        console.log("no pause");
        return;
    }

    isPaused = !isPaused;	
    if(isPaused) {
    	if(assaultMode || carnageStarted) {
        clearInterval(gameDropshipSpawn);
        clearInterval(gameGunshipSpawn);
        clearInterval(gameProtectorSpawn);
        clearInterval(gameMissileSpawn);
    	}
        showPausedScreen();
        pauseSound.play();
        clearInterval(gameUpdate);
    } else {
		gameUpdate = setInterval(update, 1000/30);
		if (carnageStarted) {
			gameDropshipSpawn = setInterval(dropshipSpawn, dropshipSpawnTimer);
			gameGunshipSpawn = setInterval(gunshipSpawn, gunshipSpawnTimer);
			gameProtectorSpawn = setInterval(protectionShipSpawn, protectionShipSpawnTimer);
			gameMissileSpawn = setInterval(missileSpawn, missileSpawnTimer);
		}
        resumeSound.play();
		timeStartedActive = new Date().getTime();
    }
}


function tintScreen(){
    canvasContext.fillStyle = "black";
    canvasContext.globalAlpha = 0.2;
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
	canvasContext.globalAlpha = 1.0;
	timeStartedActive = new Date().getTime(); // TODO: make a centralised variable reset
}

function bombFlash() {
    for(var i = 0.002; i < 15; i++) {
        canvasContext.fillStyle = TEXT_COLOR;
        canvasContext.globalAlpha = 0.2 * i;
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        canvasContext.globalAlpha = 1.0;
    }
}

function showPausedScreen() {
    tintScreen();
    colorText("- P A U S E D -", canvas.width/2, canvas.height/2, TEXT_COLOR, "40px Arial", "center");
}

function windowOnFocus() {
	currentBackgroundMusic.resumeSound();
	if(!windowState.inFocus) {
		windowState.inFocus = true;
		gameUpdate = setInterval(update, 1000/30);
		if (carnageStarted) {
			gameDropshipSpawn = setInterval(dropshipSpawn, dropshipSpawnTimer);
			gameGunshipSpawn = setInterval(gunshipSpawn, gunshipSpawnTimer);
			gameProtectorSpawn = setInterval(protectionShipSpawn, protectionShipSpawnTimer);
			gameMissileSpawn = setInterval(missileSpawn, missileSpawnTimer);
		}
		if (waveStarted && !gameOverManager.gameOverPlaying) {
			resumeSound.play();
		}
		timeStartedActive = new Date().getTime();
	}
}

function windowOnBlur() {
	if (!gameOverManager.gameOverPlaying && !windowState.mainMenu && !windowState.help && !isPaused) {
	    tintScreen();
		currentBackgroundMusic.pauseSound();
		if (!isPaused && !windowState.help) {
			clearInterval(gameDropshipSpawn);
			clearInterval(gameGunshipSpawn);
			clearInterval(gameProtectorSpawn);
			clearInterval(gameMissileSpawn);
			windowState.inFocus = false;
			clearInterval(gameUpdate);
			
			if (waveStarted) {
				pauseSound.play();
				showPausedScreen();
			}
		}
	}
}

