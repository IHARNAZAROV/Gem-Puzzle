// Init main
const main = document.createElement('main');
main.id = 'main';
const steps = document.createElement('p');
steps.id = 'steps';
const msMeter = document.createElement('p');
msMeter.id = 'msMeter';
const container = document.createElement('div');
container.id = 'container';
const sizeTable = 4;
const keysound = new Audio('./assets/switch.wav');
const keywin = new Audio('./assets/win.mp3');
let matrix; // the numbers
const els = []; // the elements
const elSize = 11; // distance between divs
let ms = 0;
let won = false;
let running = false;
let now = Date.now();
let moves = 0;
let victoryWindow;

function loadGame() {
  const header = document.createElement('header');

  const div = document.createElement('div');
  div.classList.add('head__title');

  const img = document.createElement('img');
  img.classList.add('css-logo');
  img.src = './assets/icon/icon.png';
  img.height = '100';

  const h1 = document.createElement('h1');
  h1.innerHTML = 'The Gem Puzzle';

  const emoji = document.createElement('section');
  emoji.id = 'reaction';
  emoji.innerHTML = '&#128528';

  const buttonPlay = document.createElement('button');
  buttonPlay.textContent = 'Start Game';
  buttonPlay.classList.add('button_play');

  const infoBottom = document.createElement('div');
  infoBottom.classList.add('infoBottom');
  infoBottom.innerHTML = 'The Gem Puzzle, also called Game of Fifteen, is a sliding puzzle that consists of a frame of numbered square tiles in random order with one tile missing. To solve the puzzle, you must place the tiles in order by making sliding moves that use the empty space.';

  document.body.appendChild(header);
  document.body.appendChild(main);
  header.appendChild(div);
  div.appendChild(img);
  div.appendChild(h1);
  div.appendChild(emoji);
  main.appendChild(buttonPlay);
  main.appendChild(infoBottom);
  buttonPlay.addEventListener('click', () => {
    document.querySelector('main').classList.toggle('anim-trans');
    main.textContent = '';
    init();
    startGame();
  });
}
loadGame();

function init() {
  // controls div
  const controls = document.createElement('div');
  controls.id = 'controls';
  main.appendChild(controls);

  // button Solve
  const buttonSolve = document.createElement('button');
  buttonSolve.textContent = 'Solve Game';
  buttonSolve.id = 'button_solve';
  controls.appendChild(buttonSolve);
  document.getElementById('button_solve').addEventListener('click', seeSolution);

  // Create the button to sound on/off
  const buttonSound = document.createElement('button');
  buttonSound.id = 'button_sound';
  const buttonSoundIcon = document.createElement('i');
  buttonSoundIcon.classList.add('fas', 'fa-volume-up');
  controls.appendChild(buttonSound);
  buttonSound.appendChild(buttonSoundIcon);
  const buttonZvuk = document.querySelector('#button_sound');
  const icon = document.querySelector('#button_sound > i');
  buttonZvuk.addEventListener('click', () => {
    if (keysound.muted === true && keywin.muted === true) {
      keysound.muted = false;
      keywin.muted = false;
      icon.classList.remove('fa-volume-mute');
      icon.classList.add('fa-volume-up');
    } else {
      keysound.muted = true;
      keywin.muted = true;
      icon.classList.remove('fa-volume-up');
      icon.classList.add('fa-volume-mute');
    }
  });

  // button Shuffle
  const buttonShuffle = document.createElement('button');
  buttonShuffle.textContent = 'Shuffle Game';
  buttonShuffle.id = 'button_shuffle';
  controls.appendChild(buttonShuffle);
  document.getElementById('button_shuffle').addEventListener('click', startGame);

  // info
  const info = document.createElement('div');
  info.classList.add('info_title');
  main.appendChild(info);
  info.appendChild(msMeter);
  info.appendChild(steps);

  // Create Cells
  let num = 0;
  for (let x = 0; x < sizeTable; x += 1) {
    for (let y = 0; y < sizeTable; y += 1) {
      num += 1;
      if (num === sizeTable * sizeTable) return;
      const element = document.createElement('div');
      element.className = 'tile';
      element.classList.add(
        (x % 2 === 0 && y % 2 > 0) || (x % 2 > 0 && y % 2 === 0)
          ? 'dark'
          : 'light',
      );

      element.textContent = num;
      element.addEventListener('click', (function movement(numbers) {
        return function elements() {
          MoveCell(numbers);
        };
      }(num)));
      els.push(element);
      setElementsPosition(num, x, y);
      main.appendChild(container);
      container.appendChild(element);
    }
  }
}

function startGame() {
  ms = 0;
  moves = 0;
  running = false;
  won = false;
  const numArr = [];
  for (let i = 0; i < (sizeTable * sizeTable); i += 1) numArr.push(i);
  matrix = [];
  for (let x = 0; x < sizeTable; x += 1) {
    matrix.push([]);
    for (let y = 0; y < sizeTable; y += 1) {
      const num = getRandomItem(numArr);
      numArr.splice(numArr.indexOf(num), 1);
      matrix[x].push(num);
      setPosition(num, x, y);
    }
  }
  updateReaction('happy');
  checkFinished();
}

function setPosition(num, x, y) {
  if (num === 0) return;
  setElementsPosition(num, x, y);
}

function setElementsPosition(num, x, y) {
  const el = els[num - 1];
  el.style.top = `${x * elSize}vh`;
  el.style.left = `${y * elSize}vh`;
}

function Timer() {
  if (ms >= 120000) {
    updateReaction('wait');
  }

  if (ms < 0) ms = -ms;
  const time = {
    day: Math.floor((ms / 86400000)),
    hour: Math.floor((ms / 3600000) % 24),
    minute: Math.floor((ms / 60000) % 60),
    second: Math.floor((ms / 1000) % 60),
  };
  return Object.entries(time)
    .filter((val) => val[1] !== 0)
    .map(([key, val]) => `${val} ${key}${val !== 1 ? 's' : ''}`)
    .join(', ');
}

function getRandomItem(ar) {
  const RandomItem = parseInt((Math.random() * ar.length), 10);
  return ar[RandomItem];
}

function searchNum(num) {
  for (let i = 0; i < matrix.length; i += 1) {
    const index = matrix[i].indexOf(num);

    if (index > -1) {
      return {
        x: i,
        y: index,
      };
    }
  }

  return false;
}

function checkFinished() {
  let num = 1;
  let is = true;
  for (let i = 0; i < matrix.length; i += 1) {
    for (let j = 0; j < matrix[i].length; j += 1) {
      if (num === sizeTable * sizeTable) num = 0;

      if (matrix[i][j] !== num) {
        is = false;

        if (matrix[i][j] !== 0) els[matrix[i][j] - 1].classList.remove('correct');
      } else if (num !== 0) els[num - 1].classList.add('correct');

      num += 1;
    }
  }
  return is;
}

function moveZero(num, x, y, nX, nY) {
  matrix[x][y] = 0;
  matrix[nX][nY] = num;
  setPosition(num, nX, nY);
}

function getCell(x, y) {
  if (matrix[x]) return matrix[x][y];
  return undefined;
}

function MoveCell(num) {
  if (won) startGame();
  updateReaction('wink');
  const pos = searchNum(num);
  const {
    x,
  } = pos;
  const {
    y,
  } = pos;

  if (getCell(x, y - 1) === 0) {
    moves += 1;
    makeSound();
    moveZero(num, x, y, x, y - 1);
  }
  if (getCell(x, y + 1) === 0) {
    moves += 1;
    makeSound();
    moveZero(num, x, y, x, y + 1);
  }
  if (getCell(x + 1, y) === 0) {
    moves += 1;
    makeSound();
    moveZero(num, x, y, x + 1, y);
  }
  if (getCell(x - 1, y) === 0) {
    moves += 1;
    makeSound();
    moveZero(num, x, y, x - 1, y);
  }

  if (!running) {
    now = Date.now();
    running = true;
    DataInfo();
  }
  steps.textContent = moves;
  if (checkFinished()) {
    win();
  }
}

function DataInfo() {
  if (running) window.requestAnimationFrame(DataInfo);
  ms = Date.now() - now;
  msMeter.innerHTML = `Your Time is : ${Timer()}`;
  steps.innerHTML = `Your Moves are : ${moves} steps`;
}

function win() {
  running = false;
  won = true;
  msMeter.textContent = `YOU WIN! ${Timer()} and ${moves} steps`;
  updateReaction('happy');
  makeSound();
  generateVictoryWindow();
}

function seeSolution() {
  ms = 0;
  moves = 0;
  running = false;
  won = true;
  let num = 1;
  matrix = [];
  for (let x = 0; x < sizeTable; x += 1) {
    matrix.push([]);
    for (let y = 0; y < sizeTable; y += 1) {
      if (num === sizeTable * sizeTable) break;
      matrix[x].push(num);
      setPosition(num, x, y);
      num += 1;
    }
  }
  checkFinished();
  updateReaction('sad');
}

function updateReaction(emotion) {
  const reactionEmoji = document.getElementById('reaction');

  if (emotion === 'happy') {
    reactionEmoji.innerHTML = '&#128522';
  } else if (emotion === 'sad') {
    reactionEmoji.innerHTML = '&#128551';
  } else if (emotion === 'wtf') {
    reactionEmoji.innerHTML = '&#128528';
  } else if (emotion === 'wait') {
    reactionEmoji.innerHTML = '&#128564';
  } else if (emotion === 'wink') {
    reactionEmoji.innerHTML = '&#128521';
  }
}

function makeSound() {
  keysound.play();
  if (won) keywin.play();
}

function generateVictoryWindow() {
  const baloon1 = document.createElement('div');
  baloon1.classList.add('balloon');
  const baloon2 = document.createElement('div');
  baloon2.classList.add('balloon');
  const baloon3 = document.createElement('div');
  baloon3.classList.add('balloon');
  const baloon4 = document.createElement('div');
  baloon4.classList.add('balloon');
  const baloon5 = document.createElement('div');
  baloon5.classList.add('balloon');
  victoryWindow = document.createElement('div');
  victoryWindow.classList.add('victory-window');
  const victoryH1 = document.createElement('h1');
  victoryH1.classList.add('victory');
  victoryH1.innerHTML = 'VICTORY';
  const timeVictory = document.createElement('span');
  timeVictory.classList.add('time-victory');
  timeVictory.innerHTML = `Your victory time is: ${Timer()}`;
  const br = document.createElement('br');
  const stepsVictory = document.createElement('span');
  stepsVictory.classList.add('steps-victory');
  stepsVictory.innerHTML = `Your victory steps are: ${moves} steps`;
  const buttonClose = document.createElement('span');
  buttonClose.classList.add('victory-window-close');
  buttonClose.innerHTML = '&times;';
  victoryWindow.appendChild(buttonClose);
  victoryWindow.appendChild(baloon1);
  victoryWindow.appendChild(baloon2);
  victoryWindow.appendChild(baloon3);
  victoryWindow.appendChild(baloon4);
  victoryWindow.appendChild(baloon5);
  victoryWindow.appendChild(victoryH1);
  victoryWindow.appendChild(timeVictory);
  victoryWindow.appendChild(br);
  victoryWindow.appendChild(stepsVictory);
  main.appendChild(victoryWindow);

  document.querySelector('.victory-window-close').addEventListener('click', clearVictoryWindow);
  document.querySelector('.victory-window').addEventListener('click', clearVictoryWindow);
}

function clearVictoryWindow() {
  victoryWindow.classList.add('victory-window-hidden');
  victoryWindow.innerHTML = '';
}
