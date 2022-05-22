const ConnectedDice = {}

function openConnectionDialog() {
	const newDice = new GoDice();
	newDice.requestDevice();
}

GoDice.prototype.onDiceConnected = (diceId, diceInstance) => {
    console.log("Dice Connected: " + diceId);
    ConnectedDice[diceId] = diceInstance;
}

GoDice.prototype.onRollStart = (diceId) => {
    console.log(diceId + " Is Rolling...")
}

GoDice.prototype.onStable = (diceId, value, xyzArray) => {
    console.log(diceId + " Rolled A: " +value)
    if (value == 6) {
        ConnectedDice[diceId].setLed([0,0,255], [255,0,0]);
    }
}