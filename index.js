const state = {
  equation: undefined,
  answer: undefined,
};

const OPERANDS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const OPERATORS = ["+", "-", "*", "/"];
document.onreadystatechange = () => {
  if (document.readyState === "complete") {
    initGame();
  }
};
const initGame = () => {
  state.equation = generateEquation();
  state.answer = eval(state.equation);
  console.log(eval(state.equation));
  loadBoard(state.equation);
  addKeypadsEvents();
  handleKeyboardInput();
};

const loadBoard = (equation) => {
  let boardHTML = "";
  for (let i = 0; i < 6; i++) {
    boardHTML += `<div class="row ${i === 0 ? "activeRow" : ""}">${
      `<div class="box outline"></div>`.repeat(7) +
      `<div class="ans ans_${i} ${i === 0 ? "" : "hide"}">= ${eval(
        equation
      )}</div>`
    }</div>`;
  }
  document.querySelector(".board").insertAdjacentHTML("afterbegin", boardHTML);
};
const addKeypadsEvents = () => {
  const btnArr = Array.from(document.querySelectorAll(".btn-pushable")).filter(
    (btn) => btn.value !== "=" && btn.value !== "clear"
  );

  btnArr.forEach((btn) => {
    btn.addEventListener("click", addValueToCurrentBox.bind(null, btn.value));
  });

  document
    .querySelector('.btn-pushable[value="clear"]')
    .addEventListener("click", clearLastBoxValue);
  document
    .querySelector('.btn-pushable[value="="]')
    .addEventListener("click", evaluate);
};

const addValueToCurrentBox = (val) => {
  const curBox = Array.from(
    document.querySelector(".activeRow").children
  ).filter((el) => el.className.includes("box") && el.innerText === "")[0];
  if (curBox) curBox.innerText = val;
};

const clearLastBoxValue = () => {
  const boxesWithValue = Array.from(
    document.querySelector(".activeRow").children
  ).filter((el) => el.className.includes("box") && el.innerText !== "");
  if (!boxesWithValue.length) return;
  boxesWithValue[boxesWithValue.length - 1].innerText = "";
};

const handleKeyboardInput = () => {
  const allowedChars = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
    "+",
    "-",
    "*",
    "/",
  ];
  document.addEventListener("keyup", (e) => {
    if (allowedChars.includes(e.key)) {
      let keyVal = e.key;
      if (e.key === "*") keyVal = "×";
      if (e.key === "/") keyVal = "÷";
      addValueToCurrentBox(keyVal);
    }
    if (e.key === "Backspace" || e.key === "c") clearLastBoxValue();
    if (e.key === "Enter" || e.key === "=") evaluate();
  });
};

const evaluate = () => {
  const boxes = Array.from(
    document.querySelector(".activeRow").children
  ).filter((el) => el.className.includes("box"));
  if (checkBoxesWithEquation(boxes, state.equation)) {
    console.log(true);
    const [right, partly, wrong] = checkForCorrectBoxes(boxes, state.equation);
    handleColoring(right, partly, wrong);
    //CHECK IF WON
    continueNextRow();
  } else {
    shakeEmUp();
  }
};

const generateEquation = () => {
  let equation = OPERANDS[Math.floor(Math.random() * OPERANDS.length)];
  for (let i = 0; i < 3; i++) {
    equation += OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
    if (equation[equation.length - 1] === "/") {
      equation += getRandomDividableNum(equation[equation.length - 2]);
    } else {
      equation += OPERANDS[Math.floor(Math.random() * OPERANDS.length)];
    }
  }
  console.log(equation);
  return equation;
};

const getRandomDividableNum = (num) => {
  const nums = [];
  if (num === "0") return Math.floor(Math.random() * (9 - 1) + 1);

  for (let i = 1; i <= num; i++) {
    if (eval(num % i) === 0) {
      nums.push(i);
    }
  }
  return nums[Math.floor(Math.random() * nums.length)];
};

const checkBoxesWithEquation = (boxesArr, equationStr) => {
  const boxesTextArr = boxesArr.map((box) => {
    if (box.innerText === "÷") return "/";
    if (box.innerText === "×") return "*";
    else return box.innerText;
  });
  // console.log(boxesTextArr);
  if (boxesTextArr.includes("")) return false;
  for (let i = 0; i < equationStr.length; i++) {
    if (i % 2 === 0 && !OPERANDS.includes(boxesTextArr[i])) return false;
    if (i % 2 === 1 && !OPERATORS.includes(boxesTextArr[i])) return false;
  }
  return eval(boxesTextArr.join("")) === state.answer ? true : false;
};

const checkForCorrectBoxes = (boxesArr, equationStr) => {
  const right = [];
  const wrong = [];
  const partly = [];
  const removeIndex = [];
  let formattedEq = equationStr.replaceAll("*", "×").replaceAll("/", "÷");
  // find correct and remove them
  boxesArr.forEach((box, i) => {
    if (box.innerText === formattedEq[i]) {
      right.push(box);
      const temp = formattedEq.split("");
      temp[i] = "@";
      formattedEq = temp.join("");
      removeIndex.push(i);
    }
  });
  console.log(formattedEq);
  // find partly and remove them
  boxesArr.forEach((box, i) => {
    if (!removeIndex.includes(i)) {
      if (formattedEq.includes(box.innerText)) {
        partly.push(box);
        const temp = formattedEq.split("");
        temp[temp.indexOf(box.innerText)] = "@";
        formattedEq = temp.join("");
        removeIndex.push(i);
      }
    }
  });
  console.log(formattedEq);
  // find wrong
  boxesArr.forEach((box, i) => {
    if (!removeIndex.includes(i)) {
      wrong.push(box);
    }
  });
  return [right, partly, wrong];
};

const shakeEmUp = () => {
  const boxes = Array.from(
    document.querySelector(".activeRow").children
  ).filter((el) => el.className.includes("box"));
  boxes.forEach((box) => {
    box.classList.add("shake");
  });
  setTimeout(() => {
    boxes.forEach((box) => {
      box.classList.remove("shake");
    });
  }, 1000);
};

const handleColoring = (right, partly, wrong) => {
  const rightBtns = [];
  const partlyBtns = [];
  const wrongBtns = [];
  right.forEach((rBox) => {
    rBox.classList.add("right");
    rightBtns.push(rBox.innerText);
  });
  partly.forEach((rBox) => {
    rBox.classList.add("partly");
    if (!rightBtns.includes(rBox.innerText)) partlyBtns.push(rBox.innerText);
  });
  wrong.forEach((rBox) => {
    rBox.classList.add("wrong");
    if (
      !rightBtns.includes(rBox.innerText) &&
      !partlyBtns.includes(rBox.innerText)
    )
      wrongBtns.push(rBox.innerText);
  });
  console.log(rightBtns);
  rightBtns.forEach((value) => {
    const btnEl = document.querySelector(`.btn-pushable[value="${value}"]`);
    btnEl.querySelector(".btn-shadow").classList.add("right-shadow");
    btnEl.querySelector(".btn-edge").classList.add("right-edge");
    btnEl.querySelector(".btn-front").classList.add("right");
  });

  partlyBtns.forEach((value) => {
    const btnEl = document.querySelector(`.btn-pushable[value="${value}"]`);
    btnEl.querySelector(".btn-shadow").classList.add("partly-shadow");
    btnEl.querySelector(".btn-edge").classList.add("partly-edge");
    btnEl.querySelector(".btn-front").classList.add("partly");
  });

  wrongBtns.forEach((value) => {
    const btnEl = document.querySelector(`.btn-pushable[value="${value}"]`);
    btnEl.querySelector(".btn-shadow").classList.add("wrong-shadow");
    btnEl.querySelector(".btn-edge").classList.add("wrong-edge");
    btnEl.querySelector(".btn-front").classList.add("wrong");
  });
};

const continueNextRow = () => {
  const iOfActiveRow = Array.from(document.querySelectorAll(".board .row"))
    .map((div) => div.classList.value)
    .indexOf("row activeRow");
  const rowArr = Array.from(document.querySelectorAll(".board .row"));
  rowArr[iOfActiveRow].classList.remove("activeRow");
  if (iOfActiveRow === rowArr.length - 1) return;
  rowArr[iOfActiveRow + 1].classList.add("activeRow");
};
