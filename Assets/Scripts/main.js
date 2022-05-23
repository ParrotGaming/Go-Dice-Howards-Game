const ConnectedDice = {};
let RollStates = [];
const DiceStates = {};

let diceRolled = 0;
let rollNum = 0;
let rollTotal = 0;

const setDieImage = (diceId, value) =>
  `../Assets/Images/${DiceStates[diceId].color}-${value}.png`;

const getDiceHtmlEl = (diceID) => {
  if (!document.getElementById(diceID)) {
    const newDiceEl = document.createElement("div");
    newDiceEl.id = diceID;
    newDiceEl.className = "dice-wrapper";
    return newDiceEl;
  }
  return document.getElementById(diceID);
};

const openConnectionDialog = () => {
  const newDice = new GoDice();
  newDice.requestDevice();
};

const calculateRoll = () => {
  // if (!RollStates[diceId].isCounted) {
  //   if (RollStates[diceId].isRolling) {
  //     rollTotal -= RollStates[diceId].value;
  //     console.log(`Roll #: ${RollStates[diceId].rollCount}`);
  //   } else {
  //     rollTotal += RollStates[diceId].value;
  //     RollStates[diceId].isCounted = true;
  //   }
  // }
  for (const id in RollStates) {
    if (RollStates[id].isRolling) {
      if (RollStates[id].isRolling) {
        rollTotal += RollStates[id].value;
        RollStates[id].isRolling = false;
      }
    }
  }

  console.log(`Score: ${rollTotal}`);
};

const turnOnLed = (diceId) => {
  for (const id in RollStates) {
    if (RollStates[id].led === "on") {
      ConnectedDice[id].setLed([255, 0, 0], [255, 0, 0]);
    }
  }
};

const turnOffLed = () => {
  for (const id in RollStates) {
    if (RollStates[id].led === "on") {
      ConnectedDice[id].setLed([0]);
      RollStates[id].led = "off";
    }
  }
};

GoDice.prototype.onDiceConnected = (diceId, diceInstance) => {
  ConnectedDice[diceId] = diceInstance;
  ConnectedDice[diceId].getDiceColor();
  const diceHtmlEl = getDiceHtmlEl(diceId);
  const diceHost = document.getElementById("dice-host");

  const diceValue = document.createElement("img");
  diceValue.id = `${diceId}-die-value`;
  diceHtmlEl.append(diceValue);

  DiceStates[diceId] = {
    value: 0,
    led: "off",
    isCounted: false,
    rollCount: 0,
  };

  diceHost.appendChild(diceHtmlEl);
};

GoDice.prototype.onRollStart = (diceId) => {
  console.log(`${diceId} Is Rolling...`);

  DiceStates[diceId].rollCount += 1;
  DiceStates[diceId].value = 0;
  // RollStates = {};

  const diceValueEl = document.getElementById(diceId + "-die-value");
  diceValueEl.src = `../Assets/Images/${DiceStates[diceId].color}-rolling.gif`;
  // calculateRoll();
};

GoDice.prototype.onStable = (diceId, value) => {
  console.log(`${diceId} Rolled A: ${value}`);

  // RollStates[diceId] = { value: value };
  DiceStates[diceId].value = value;
  // RollStates[diceId].isRolling = false;
  clearInterval(setDieImage);
  // calculateRoll();

  const diceValueEl = document.getElementById(diceId + "-die-value");
  diceValueEl.src = setDieImage(diceId, value);
  console.log(rollTotal);
};

GoDice.prototype.onDiceColor = (diceId, color) => {
  console.log("DiceColor: ", diceId, color);

  DiceStates[diceId].color = color;

  const diceValueEl = document.getElementById(diceId + "-die-value");
  diceValueEl.src = `../Assets/Images/${DiceStates[diceId].color}-1.png`;
};
