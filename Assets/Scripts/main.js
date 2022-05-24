const ConnectedDice = {};
let RollStates = [];
const DiceStates = {};
let CurrentRoll = [];
let SetAsideDice = [];

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

const determineRoll = () => {
  if (CurrentRoll.length != 0) {
    console.log(`Roll Completed. ${CurrentRoll.length} Dice were rolled.`);
    calculateRoll(CurrentRoll);
    CurrentRoll = [];
  }
};

const calculateRoll = async (roll) => {
  let one = [];
  let two = [];
  let three = [];
  let four = [];
  let five = [];
  let six = [];
  let total = 0;

  if (roll.length >= 3) {
    roll.map(die => {
      if (die[1] === 1) {
        one.push(die)
      } else if (die[1] === 2) {
        two.push(die)
      } else if (die[1] === 3) {
        three.push(die)
      } else if (die[1] === 4) {
        four.push(die)
      } else if (die[1] === 5) {
        five.push(die)
      } else {
        six.push(die)
      }
    })
    if (one.length >= 3) {
      for(let i = 0; i < one.length - 2; i++) {
        total += 1000
      }
    } else if (two.length >= 3) {
      for(let i = 0; i < two.length - 2; i++) {
        total += 200
      }
    } else if (three.length >= 3) {
      for(let i = 0; i < three.length - 2; i++) {
        total += 300
      }
    } else if (four.length >= 3) {
      for(let i = 0; i < four.length - 2; i++) {
        total += 400
      }
    } else if (five.length >= 3) {
      for(let i = 0; i < five.length - 2; i++) {
        total += 500
      }
    } else if (six.length >= 3) {
      for(let i = 0; i < six.length - 2; i++) {
        total += 600
      }
    }
    if (five.length < 3 && one.length < 3){
      roll.map(die => {
        if (die[1] == 1) {
          total += 100
        } else if (die[1] == 5) {
          total += 50
        }
      })
    }
  } else {
    roll.map(die => {
      if (die[1] == 1) {
        total += 100
      } else if (die[1] == 5) {
        total += 50
      }
    })
  }
  SetAsideDice = roll
  console.log(`This Roll's Total Is: ${total}`)
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
  DiceStates[diceId].rollCount += 1;
  DiceStates[diceId].value = 0;
  // RollStates = {};

  const diceValueEl = document.getElementById(diceId + "-die-value");
  diceValueEl.src = `../Assets/Images/${DiceStates[diceId].color}-rolling.gif`;
  // calculateRoll();
};

GoDice.prototype.onStable = (diceId, value) => {
  CurrentRoll.push([diceId, value]);

  // RollStates[diceId] = { value: value };
  DiceStates[diceId].value = value;
  // RollStates[diceId].isRolling = false;
  clearInterval(setDieImage);
  // calculateRoll();

  const diceValueEl = document.getElementById(diceId + "-die-value");
  diceValueEl.src = setDieImage(diceId, value);
  setTimeout(determineRoll, 2000)
};

GoDice.prototype.onDiceColor = (diceId, color) => {
  console.log("DiceColor: ", diceId, color);

  DiceStates[diceId].color = color;

  const diceValueEl = document.getElementById(diceId + "-die-value");
  diceValueEl.src = `../Assets/Images/${DiceStates[diceId].color}-1.png`;
};
