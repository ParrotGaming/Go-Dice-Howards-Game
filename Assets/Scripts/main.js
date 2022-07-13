const connectedDice = {};
const diceStates = {};
const connectedPlayers = {};

let playerTurnNum = 0;
let countedDice = [];
let newRoll = false;
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
  if (connectedPlayers[playerTurnNum] != null) {
    const newDice = new GoDice();
    newDice.requestDevice();
  } else {
    document.getElementById("connect-dice-button").innerText = "No Players";
    setTimeout(function(){document.getElementById("connect-dice-button").innerText = "Connect GoDice"}, 1000);
  }
};

const addNewPlayer = () => {
  let name = document.getElementById("newPlayerName").value;
  if (name != null && name != "") {
    document.getElementById("newPlayerName").value = "";
    let tmpPlayer = {playerName:name, playerScore:0};
    connectedPlayers[playerTurnNum + Object.keys(connectedPlayers).length] = tmpPlayer;
    var conDiv = document.createElement("div");
    conDiv.innerText = name + ": " + 0;
    conDiv.id = "player-" + (playerTurnNum + Object.keys(connectedPlayers).length-1);
    document.getElementById("leaderboard").appendChild(conDiv);
  }
}

const endPlayerTurn = () => {
  if (connectedPlayers[playerTurnNum].playerScore + totalScore >= 500) {
    connectedPlayers[playerTurnNum].playerScore += totalScore;
    document.getElementById("player-" + playerTurnNum).innerText = connectedPlayers[playerTurnNum].playerName + ": " + connectedPlayers[playerTurnNum].playerScore;
  }
  //Reset Game State
  if (playerTurnNum < Object.keys(connectedPlayers).length -1) {
    playerTurnNum += 1;
  } else {
    playerTurnNum = 0;
  }
  countedDice = [];
  newRoll = false;
  rollStates = [];
  currentRoll = [];
  setAsideDice = [];
  newRollDice = [];
  diceRolled = 0;
  rollNum = 0;
  totalScore = 0;
  const totalScoreEl = document.getElementById("score");
  totalScoreEl.textContent = totalScore;
}

const determineRoll = () => {
  if (currentRoll.length + setAsideDice.length === 5) {
    console.log(`Roll Completed. ${currentRoll.length} Dice were rolled.`);
    calculateRoll(currentRoll,true);
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

const calculateMultipleValue = (array, final) => {
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
  if (final == true) {
    array.forEach(function (die, index) {countedDice.push(die.id);});
  }
  return total;
};

const calculateRoll = async (roll, final) => {
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
      total = calculateMultipleValue(one, final);
    } else if (two.length >= 3) {
      total = calculateMultipleValue(two, final);
    } else if (three.length >= 3) {
      total = calculateMultipleValue(three, final);
    } else if (four.length >= 3) {
      total = calculateMultipleValue(four, final);
    } else if (five.length >= 3) {
      total = calculateMultipleValue(five, final);
    } else if (six.length >= 3) {
      total = calculateMultipleValue(six, final);
    }
  }

  roll.map((die) => {
    if (die.value === 1 && one.length < 3) {
      total += 100;
      if (final == true) {
        countedDice.push(die.id);
      }
    } else if (die.value === 5 && five.length < 3) {
      total += 50;
      if (final == true) {
        countedDice.push(die.id);
      }
    }
  });

  if (roll.length === 5 && newRoll == false || roll.length === setAsideDice.length && newRoll == false) {
    totalScore = total;
    setAsideDice = roll;
  } else {
    totalScore += total;
    setAsideDice = setAsideDice.concat(roll);
  }
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
  if (countedDice.length == 5) {
    newRoll = true;
    countedDice = [];
    rollStates = [];
    currentRoll = [];
    setAsideDice = [];
    newRollDice = [];
    diceRolled = 0;
    rollNum = 0;
  } else {
    countedDice.forEach(function (id, index) {
      if (id == diceId) {
        countedDice.pop(index);
      }
    });
  }
  diceStates[diceId].rollCount += 1;
  newRollDice.push(diceStates[diceId]);

  setAsideDice = setAsideDice.filter((die) => die.id !== diceId);
  if (newRollDice.length + setAsideDice.length === 5 && newRoll == false) {
    calculateRoll(setAsideDice, false);
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
