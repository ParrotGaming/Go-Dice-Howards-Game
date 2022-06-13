const connectedDice = {};
const diceStates = {};

let rollStates = [];
let currentRoll = [];
let setAsideDice = [];
let newRollDice = [];
let diceRolled = 0;
let rollNum = 0;
let totalScore = 0;

const setDieImage = (diceId, value) =>
  `../Assets/Images/${diceStates[diceId].color}-${value}.png`;

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
  if (currentRoll.length + setAsideDice.length === 5) {
    console.log(`Roll Completed. ${currentRoll.length} Dice were rolled.`);
    calculateRoll(currentRoll);
    currentRoll = [];
  }
};

const determineSameRoll = (array) => {
  let sameRoll = [];
  array.map((die, i, arr) => {
    if (i === 0) {
      sameRoll.push(die);
    } else if (die.rollCount === arr[0].rollCount) {
      sameRoll.push(die);
    }
  });
  return sameRoll;
};

const calculateMultipleValue = (array) => {
  let total = 0;
  let sameRoll = determineSameRoll(array);
  console.log(sameRoll);
  sameRoll.map((die) => {
    let value = die.value === 1 ? 1000 : die.value * 100;
    switch (array.length) {
      case 3:
        return (total = value);
      case 4:
        return (total = value * 2);
      case 5:
        return (total = value * 3);
      default:
        break;
    }
  });

  return total;
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
    roll.map((die) => {
      switch (die.value) {
        case 1:
          one.push(die);
          break;
        case 2:
          two.push(die);
          break;
        case 3:
          three.push(die);
          break;
        case 4:
          four.push(die);
          break;
        case 5:
          five.push(die);
          break;
        case 6:
          six.push(die);
          break;
      }
    });

    if (one.length >= 3) {
      total = calculateMultipleValue(one);
    } else if (two.length >= 3) {
      total = calculateMultipleValue(two);
    } else if (three.length >= 3) {
      total = calculateMultipleValue(three);
    } else if (four.length >= 3) {
      total = calculateMultipleValue(four);
    } else if (five.length >= 3) {
      total = calculateMultipleValue(five);
    } else if (six.length >= 3) {
      total = calculateMultipleValue(six);
    }
  }

  roll.map((die) => {
    if (die.value === 1 && one.length < 3) {
      total += 100;
    } else if (die.value === 5 && five.length < 3) {
      total += 50;
    }
  });

  if (roll.length === 5 || roll.length === setAsideDice.length) {
    totalScore = total;
    setAsideDice = roll;
  } else {
    totalScore += total;
    setAsideDice = setAsideDice.concat(roll);
  }

  console.log(`This Roll's Total Is: ${total}`);
  console.log(`The total score is: ${totalScore}`);
  const totalScoreEl = document.getElementById("score");
  totalScoreEl.textContent = totalScore;
};

const turnOnLed = () => {
  for (const id in rollStates) {
    if (rollStates[id].led === "on") {
      connectedDice[id].setLed([255, 0, 0], [255, 0, 0]);
    }
  }
};

const turnOffLed = () => {
  for (const id in rollStates) {
    if (rollStates[id].led === "on") {
      connectedDice[id].setLed([0]);
      rollStates[id].led = "off";
    }
  }
};

GoDice.prototype.onDiceConnected = (diceId, diceInstance) => {
  connectedDice[diceId] = diceInstance;
  connectedDice[diceId].getDiceColor();
  const diceHtmlEl = getDiceHtmlEl(diceId);
  const diceHost = document.getElementById("dice-host");

  const diceValue = document.createElement("img");
  diceValue.id = `${diceId}-die-value`;
  diceHtmlEl.append(diceValue);

  diceStates[diceId] = {
    id: diceId,
    value: 0,
    led: "off",
    isCounted: false,
    rollCount: 0,
  };

  diceHost.appendChild(diceHtmlEl);
};

GoDice.prototype.onRollStart = (diceId) => {
  diceStates[diceId].rollCount += 1;
  newRollDice.push(diceStates[diceId]);

  setAsideDice = setAsideDice.filter((die) => die.id !== diceId);
  if (newRollDice.length + setAsideDice.length === 5) {
    calculateRoll(setAsideDice);
  }

  const diceValueEl = document.getElementById(diceId + "-die-value");
  diceValueEl.src = `../Assets/Images/${diceStates[diceId].color}-rolling.gif`;
};

GoDice.prototype.onStable = (diceId, value) => {
  diceStates[diceId].value = value;
  currentRoll.push(diceStates[diceId]);

  clearInterval(setDieImage);

  const diceValueEl = document.getElementById(diceId + "-die-value");
  diceValueEl.src = setDieImage(diceId, value);
  setTimeout(determineRoll, 2000);
  // if (currentRoll.length + setAsideDice.length === 5) {
  //   calculateRoll(currentRoll);
  //   currentRoll = [];
  // }
  newRollDice = [];
};

GoDice.prototype.onFakeStable = (diceId, value) => {
  console.log("onFakeStable");
  diceStates[diceId].value = value;
  currentRoll.push(diceStates[diceId]);

  clearInterval(setDieImage);

  const diceValueEl = document.getElementById(diceId + "-die-value");
  diceValueEl.src = setDieImage(diceId, value);
};

GoDice.prototype.onMoveStable = (diceId, value) => {
  console.log("onMoveStable");
  diceStates[diceId].value = value;
  currentRoll.push(diceStates[diceId]);

  clearInterval(setDieImage);

  const diceValueEl = document.getElementById(diceId + "-die-value");
  diceValueEl.src = setDieImage(diceId, value);
};

GoDice.prototype.onDiceColor = (diceId, color) => {
  console.log("DiceColor: ", diceId, color);

  diceStates[diceId].color = color;

  const diceValueEl = document.getElementById(diceId + "-die-value");
  diceValueEl.src = `../Assets/Images/${diceStates[diceId].color}-1.png`;
};
