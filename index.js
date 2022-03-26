document.onreadystatechange = () => {
  if (document.readyState === "complete") {
    initGame();
  }
};

const initGame = () => {
  loadBoard();
  addKeypadsEvents();
  handleKeyboardInput();
};

const loadBoard = () => {
  let boardHTML = "";
  for (let i = 0; i < 6; i++) {
    boardHTML += `<div class="row ${i === 0 ? "activeRow" : ""}">${
      `<div class="box outline"></div>`.repeat(7) +
      `<div class="ans ans_${i} ${i === 0 ? "" : "hide"}">= ${1}</div>`
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
  console.log("eval");
};

const generateEquation = () => {
  // make sure there is no zero devision and float numbers
  const operands = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  const operators = ["+", "-", "*", "/"];
  let equation = operands[Math.floor(Math.random() * operands.length)];
  for (let i = 0; i < 3; i++) {
    equation += operators[Math.floor(Math.random() * operators.length)];
    equation += operands[Math.floor(Math.random() * operands.length)];
  }
  return equation;
};
