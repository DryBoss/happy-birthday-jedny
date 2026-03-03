import { confetti } from "./medias/confetti.js";
import { balloonAnimation } from "./medias/balloon.js";

// --- DOM ELEMENTS ---
const loading = document.getElementById("loading");
const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");
const peekingFriend = document.getElementById("peeking-friend");
const reaction = document.getElementById("reaction");
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const backgroundMusic = document.getElementById("backgroundMusic");

const dance1 = document.getElementById("dance1");
const dance2 = document.getElementById("dance2");
const dance3 = document.getElementById("dance3");
const dance4 = document.getElementById("dance4");

const titleDialog = document.querySelector(".title");
const startText = document.getElementById("start-text");
const cakeIcon = document.getElementById("cake");
const endText1 = document.getElementById("end-text-1");
const endText2 = document.getElementById("end-text-2");
const endText3 = document.getElementById("end-text-3");
const startButton = document.getElementById("start");

// --- GAME STATE VARIABLES ---
let gameActive = false;
let score = 0;
let time = 68;
let activeObjects = [];

// Timers & Intervals
let spawnInterval;
let timerInterval;
let reactionTimeout;

// Physics & Controls
let playerY = window.innerHeight / 2;
let velocity = 0;
let isFlapping = false; // Tracks if the player is holding the button
const gravity = 0.4;
const jumpStrength = -7; // Initial boost when tapped
const liftThrust = 0.8; // Continuous upward push while held
const maxSpeed = 8; // Prevents flying up or falling down too fast

// --- INITIALIZATION & ASSETS ---
document.addEventListener("DOMContentLoaded", () => {
  if (loading) loading.style.display = "none";
  if (gameArea) gameArea.style.display = "block";
});

const objects = [
  ["./medias/objects/beef.png", 10],
  ["./medias/objects/noodles.png", 10],
  ["./medias/objects/pizza.png", 10],
  ["./medias/objects/fish.png", 5],
  ["./medias/objects/burger.png", -5],
  ["./medias/objects/strawberry.png", -10],
];

objects.forEach((object) => {
  const img = new Image();
  img.src = object[0];
});

// --- EVENT LISTENERS ---
startButton.addEventListener("click", () => {
  if (gameActive) return;
  startButton.disabled = true;
  backgroundMusic.play();

  // Remove focus from start button so pressing Spacebar later doesn't click it again
  startButton.blur();

  startGame();
});

// JETPACK / FLAP CONTROLS
function startFlap() {
  if (!gameActive) return;
  isFlapping = true;
  velocity = jumpStrength; // Gives a nice punchy boost the moment you press
}

function stopFlap() {
  isFlapping = false;
}

// 1. Mouse Controls
document.addEventListener("mousedown", startFlap);
document.addEventListener("mouseup", stopFlap);

// 2. Touch Controls (Mobile)
document.addEventListener(
  "touchstart",
  (e) => {
    if (e.target !== startButton) {
      e.preventDefault();
      startFlap();
    }
  },
  { passive: false },
);
document.addEventListener("touchend", stopFlap);

// 3. Keyboard Controls (Spacebar)
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault(); // Stops the page from scrolling down
    if (!e.repeat) startFlap(); // Ignores the "held down" repeat key trigger
  }
});
document.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    stopFlap();
  }
});

// --- GAME LOGIC ---
function spawnObject() {
  if (!gameActive) return;

  let randomObject = objects[Math.floor(Math.random() * objects.length)];
  const objElement = document.createElement("img");
  objElement.src = randomObject[0];
  objElement.classList.add("object");

  objElement.style.left = `${gameArea.offsetWidth}px`;
  objElement.style.top = `${Math.random() * (gameArea.offsetHeight - 50)}px`;

  gameArea.appendChild(objElement);

  activeObjects.push({
    el: objElement,
    value: randomObject[1],
    x: gameArea.offsetWidth,
  });
}

function gameLoop() {
  if (!gameActive) return;

  // 1. Apply Jetpack Thrust & Gravity
  if (isFlapping) {
    velocity -= liftThrust; // Pushes player up while holding
  }
  velocity += gravity; // Gravity always pulls down

  // Enforce speed limits so gameplay stays smooth
  if (velocity < -maxSpeed) velocity = -maxSpeed;
  if (velocity > maxSpeed) velocity = maxSpeed;

  playerY += velocity;

  // 2. Floor and Ceiling bounds
  if (playerY > gameArea.offsetHeight - player.offsetHeight) {
    playerY = gameArea.offsetHeight - player.offsetHeight;
    velocity = 0;
  }
  if (playerY < 0) {
    playerY = 0;
    velocity = 0;
  }
  player.style.top = `${playerY}px`;

  // 3. Move Objects & Check Collisions
  for (let i = 0; i < activeObjects.length; i++) {
    let obj = activeObjects[i];
    obj.x -= 4; // Floating speed
    obj.el.style.left = `${obj.x}px`;

    const playerRect = player.getBoundingClientRect();
    const objRect = obj.el.getBoundingClientRect();

    if (
      playerRect.left < objRect.right &&
      playerRect.right > objRect.left &&
      playerRect.top < objRect.bottom &&
      playerRect.bottom > objRect.top
    ) {
      score += obj.value;
      scoreElement.textContent = `Score: ${score}`;

      reaction.textContent = obj.value > 0 ? "YUMMY!" : "EWW!";
      clearTimeout(reactionTimeout);
      reactionTimeout = setTimeout(() => (reaction.textContent = ""), 500);

      obj.el.remove();
      activeObjects.splice(i, 1);
      i--;
      continue;
    }

    if (obj.x < -50) {
      obj.el.remove();
      activeObjects.splice(i, 1);
      i--;
    }
  }

  requestAnimationFrame(gameLoop);
}

// --- TIMELINES & CHOREOGRAPHY ---
function startGame() {
  gameActive = true;
  scoreElement.style.display = "inline";
  timerElement.style.display = "inline";

  titleDialog.style.display = "none";
  startText.style.display = "none";
  startButton.style.display = "none";

  gameLoop();
  spawnInterval = setInterval(spawnObject, 800);

  const colors = [
    ["#f3e5f5", 18000],
    ["#e1bee7", 34000],
    ["#ce93d8", 52000],
    ["#ba68c8", 69000],
  ];

  colors.forEach((color) => {
    setTimeout(() => {
      gameArea.style.backgroundColor = color[0];
    }, color[1]);
  });

  timerInterval = setInterval(() => {
    time > 0 ? (time -= 1) : (timerElement.style.display = "none");
    timerElement.innerHTML = `Party starts in<br>${time} seconds`;
  }, 1000);

  setTimeout(() => {
    dance1.style.display = "inline";
  }, 69000);
  setTimeout(() => {
    dance2.style.display = "inline";
  }, 71000);
  setTimeout(() => {
    dance3.style.display = "inline";
  }, 73000);
  setTimeout(() => {
    dance4.style.display = "inline";
  }, 75000);

  setTimeout(() => {
    gameActive = false;
    isFlapping = false; // Reset controls
    clearInterval(spawnInterval);
    clearInterval(timerInterval);
    player.style.display = "none";

    activeObjects.forEach((obj) => obj.el.remove());
    activeObjects = [];

    confetti.start();
    titleDialog.style.display = "flex";
    cakeIcon.style.display = "block";
    endText1.style.display = "block";
  }, 77000);

  setTimeout(() => {
    endText2.style.display = "block";
  }, 80000);

  setTimeout(() => {
    endText3.style.display = "block";
    balloonAnimation.start();
  }, 83000);

  setTimeout(() => {
    if (peekingFriend) peekingFriend.style.transform = "translateX(0px)";
  }, 86000);
}

// --- TAB SWITCHING BUG FIX ---
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearInterval(spawnInterval);
    backgroundMusic.pause();
    isFlapping = false; // Prevents her from flying into the ceiling if they alt-tab while holding space
  } else {
    if (gameActive) {
      spawnInterval = setInterval(spawnObject, 800);
      backgroundMusic.play();
    }
  }
});
