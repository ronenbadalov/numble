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
  Array.from(document.querySelector(".board").children).forEach((child) =>
    child.remove()
  );
  state.equation = generateEquation();
  state.answer = eval(state.equation);
  const [played, won] = getStats();
  loadBoard(state.equation);
  loadBtns();
  addKeypadsEvents();
  handleKeyboardInput();
  handleModal();
  updateModalData();
};

//return [played,won,[win distribution]]
const getStats = () => {
  if (!localStorage.getItem("stats")) localStorage.setItem("stats", "0,0");
  if (!localStorage.getItem("distribution"))
    localStorage.setItem("distribution", "0,0,0,0,0,0");
  const stats = localStorage.getItem("stats").split(",");
  stats.push(localStorage.getItem("distribution").split(","));
  return stats;
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
    const [right, partly, wrong] = checkForCorrectBoxes(boxes, state.equation);
    handleColoring(right, partly, wrong);
    //CHECK IF WON
    if (right.length === 7) {
      win();
      showNewGameBtn();
    } else continueNextRow();
  } else {
    shakeEmUp();
  }
};

const generateEquation = () => {
  let equation = 0.1;
  while (!Number.isInteger(eval(equation))) {
    equation = OPERANDS[Math.floor(Math.random() * OPERANDS.length)];
    for (let i = 0; i < 3; i++) {
      equation += OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
      if (equation[equation.length - 1] === "/") {
        equation += getRandomDividableNum(equation[equation.length - 2]);
      } else {
        equation += OPERANDS[Math.floor(Math.random() * OPERANDS.length)];
      }
    }
    console.log(`if you want to cheat: ${equation}`);
  }
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
  const ansArr = document.querySelectorAll(".ans");
  rowArr[iOfActiveRow].classList.remove("activeRow");
  if (iOfActiveRow === rowArr.length - 1) {
    lose();
    return;
  }
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
  ansArr[iOfActiveRow].classList.add("hide");
  rowArr[iOfActiveRow + 1].classList.add("activeRow");
  ansArr[iOfActiveRow + 1].classList.remove("hide");
};

const win = () => {
  const [played, won, distributionArr] = getStats();
  const guessNum =
    +document.querySelector(".activeRow .ans").classList[1][4] + 1;
  localStorage.setItem("stats", `${+played + 1},${+won + 1}`);
  +distributionArr[guessNum - 1]++;
  localStorage.setItem("distribution", distributionArr.join(","));
  makeChart();
  updateModalData();
  document.querySelector(".modal").style.display = "block";
  const duration = 15 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        zIndex: 1000,
      })
    );
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        zIndex: 1000,
      })
    );
  }, 250);
};

const reset = () => {
  Array.from(document.querySelector(".board").children).forEach((child) =>
    child.remove()
  );
  document.querySelector(".ngBtn-hover").remove();
  state.equation = generateEquation();
  state.answer = eval(state.equation);
  loadBoard(state.equation);
  loadBtns();
};

const loadBtns = () => {
  const btnHTML = `
  <div class="row">
            <button class="btn-pushable" role="button" id="kp1" value="1">
              <span class="btn-shadow"></span>
              <span class="btn-edge"></span>
              <span class="btn-front text">1</span>
            </button>
            <button class="btn-pushable" role="button" id="kp2" value="2">
              <span class="btn-shadow"></span>
              <span class="btn-edge"></span>
              <span class="btn-front text">2</span>
            </button>
            <button class="btn-pushable" role="button" id="kp3" value="3">
              <span class="btn-shadow"></span>
              <span class="btn-edge"></span>
              <span class="btn-front text">3</span>
            </button>
            <button class="btn-pushable" role="button" id="kp+" value="+">
              <span class="btn-shadow"></span>
              <span class="btn-edge"></span>
              <span class="btn-front text">+</span>
            </button>
          </div>
          <div class="row">
            <button class="btn-pushable" role="button" id="kp4" value="4">
              <span class="btn-shadow"></span>
              <span class="btn-edge"></span>
              <span class="btn-front text">4</span>
            </button>
            <button class="btn-pushable" role="button" id="kp5" value="5">
              <span class="btn-shadow"></span>
              <span class="btn-edge"></span>
              <span class="btn-front text">5</span>
            </button>
            <button class="btn-pushable" role="button" id="kp6" value="6">
              <span class="btn-shadow"></span>
              <span class="btn-edge"></span>
              <span class="btn-front text">6</span>
            </button>
            <button class="btn-pushable" role="button" id="kp-" value="-">
              <span class="btn-shadow"></span>
              <span class="btn-edge"></span>
              <span class="btn-front text">-</span>
            </button>
          </div>
          <div class="row">
            <button class="btn-pushable" role="button" id="kp7" value="7">
              <span class="btn-shadow"></span>
              <span class="btn-edge"></span>
              <span class="btn-front text">7</span>
            </button>
            <button class="btn-pushable" role="button" id="kp8" value="8">
              <span class="btn-shadow"></span>
              <span class="btn-edge"></span>
              <span class="btn-front text">8</span>
            </button>
            <button class="btn-pushable" role="button" id="kp9" value="9">
              <span class="btn-shadow"></span>
              <span class="btn-edge"></span>
              <span class="btn-front text">9</span>
            </button>
            <button class="btn-pushable" role="button" id="kp*" value="×">
              <span class="btn-shadow"></span>
              <span class="btn-edge"></span>
              <span class="btn-front text">×</span>
            </button>
          </div>
          <div class="row">
            <button class="btn-pushable" role="button" id="kpclear" value="clear">
              <span class="btn-shadow"></span>
              <span class="btn-edge"></span>
              <span class="btn-front text">C</span>
            </button>
            <button class="btn-pushable" role="button" id="kp0" value="0">
              <span class="btn-shadow"></span>
              <span class="btn-edge"></span>
              <span class="btn-front text">0</span>
            </button>
            <button class="btn-pushable" role="button" id="kp=" value="=">
              <span class="btn-shadow"></span>
              <span class="btn-edge"></span>
              <span class="btn-front text">=</span>
            </button>
            <button class="btn-pushable" role="button" id="kp/" value="÷">
              <span class="btn-shadow"></span>
              <span class="btn-edge"></span>
              <span class="btn-front text">÷</span>
            </button>
          </div>`;
  document.querySelector(".keypad").insertAdjacentHTML("afterbegin", btnHTML);
};

const showNewGameBtn = () => {
  const newGameBtn = `
    <button class="ngBtn-hover color">New Game</button>
`;
  Array.from(document.querySelector(".keypad").children).forEach((child) =>
    child.remove()
  );
  document
    .querySelector(".board")
    .insertAdjacentHTML("beforebegin", newGameBtn);
  document.querySelector(".ngBtn-hover").addEventListener("click", reset);
};

const handleModal = () => {
  const modal = document.querySelector(".modal");
  const btn = document.querySelector(".openModalIcon");
  const span = document.querySelector(".modal-close");

  span.onclick = () => {
    modal.style.display = "none";
  };

  btn.onclick = () => {
    modal.style.display = "block";
  };

  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
};

const updateModalData = () => {
  const [played, won, _] = getStats();
  const modal = document.querySelector(".modal");
  modal.querySelector(".modal-played .card-number").innerText = played;
  modal.querySelector(".modal-won .card-number").innerText = won;
  const percent =
    +played === 0 || +won === 0 ? 0 : Number.parseInt((won / played) * 100);
  modal.querySelector(".modal-percent .card-number").innerHTML = percent;
  makeChart();
};

const makeChart = () => {
  const distributionArr = localStorage.getItem("distribution").split(",");
  if (document.querySelector("#chart"))
    document.querySelector("#chart").remove();
  if (document.querySelector(".chart lottie-player")) {
    document.querySelector(".chart lottie-player").remove();
    document.querySelector(".chart .text-not-found ").remove();
  }
  if (
    distributionArr.filter((distribution) => distribution != 0).length === 0
  ) {
    document.querySelector(".chart").insertAdjacentHTML(
      "afterbegin",
      `<p class="text-not-found">It seems there is not enough data to show chart</p><lottie-player
      src="./lotties/waiting.json"
      background="transparent"
      class="margin-auto"
      speed="1"
      style="width:350px; height: 350px"
      loop
      autoplay
    ></lottie-player>`
    );
  } else {
    document
      .querySelector(".chart")
      .insertAdjacentHTML("afterbegin", '<canvas id="chart"></canvas>');
    const ctx = document.getElementById("chart").getContext("2d");

    const data = {
      labels: ["1", "2", "3", "4", "5", "6"],
      datasets: [
        {
          axis: "y",
          label: "",
          data: distributionArr,
          fill: true,
          backgroundColor: [
            "#36a2eb",
            "#ff6384",
            "#ff9f40",
            "#ffcd56",
            "#4bc0c0",
            "#9966ff",
          ],
          borderColor: [
            "#36a2eb",
            "#ff6384",
            "#ff9f40",
            "#ffcd56",
            "#4bc0c0",
            "#9966ff",
          ],
          borderWidth: 1,
        },
      ],
    };
    const config = {
      type: "bar",
      data,
      options: {
        indexAxis: "y",
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Winning Guess Distribution",
          },
        },
      },
    };

    const stackedBar = new Chart(ctx, config);
  }
};

const lose = () => {
  const [played, won, _] = getStats();
  localStorage.setItem("stats", `${+played + 1},${won}`);
  makeChart();
  updateModalData();
  document.querySelector(".modal").style.display = "block";
  showNewGameBtn();
};
