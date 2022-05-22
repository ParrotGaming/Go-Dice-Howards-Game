const ConnectedDice = {}
const RollStates = {}

dice_rolled = 0;
roll_num = 0;

function openConnectionDialog() {
	const newDice = new GoDice();
	newDice.requestDevice();
}

function calculateRoll() {
    dice_rolled += 1
}

GoDice.prototype.onDiceConnected = (diceId, diceInstance) => {
    console.log("Dice Connected: " + diceId);
    ConnectedDice[diceId] = diceInstance;
    RollStates[diceId] = [0, false];
}

GoDice.prototype.onRollStart = (diceId) => {
    console.log(diceId + " Is Rolling...");
}

GoDice.prototype.onStable = (diceId, value, xyzArray) => {
    console.log(diceId + " Rolled A: " + value);
    RollStates[diceId] = [value, false];
    calculateRoll();
}