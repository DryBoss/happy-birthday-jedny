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
const finalScore = document.getElementById("final-score");
const endText2 = document.getElementById("end-text-2");
const endText3 = document.getElementById("end-text-3");
const startButton = document.getElementById("start");

// --- GAME STATE VARIABLES ---
let gameActive = false;
let score = 0;
let activeObjects = [];

let spawnInterval;
let reactionTimeout;

// Physics & Screen Caching (THE MOBILE LAG FIX)
let gameWidth = window.innerWidth;
let gameHeight = window.innerHeight;

// Update screen sizes only if they rotate their phone
window.addEventListener("resize", () => {
  gameWidth = window.innerWidth;
  gameHeight = window.innerHeight;
});

let playerY = gameHeight / 2;
let velocity = 0;
const gravity = 0.4;
const jumpStrength = -7;

// --- FAILSAFE LOADING SCREEN ---
window.addEventListener("load", () => {
  player.style.transform = `translateY(${playerY}px)`;

  let hasLoaded = false;
  function finishLoading() {
    if (hasLoaded) return;
    hasLoaded = true;
    if (loading) loading.style.display = "none";
    if (gameArea) gameArea.style.display = "block";
  }

  document.fonts.ready.then(finishLoading);
  setTimeout(finishLoading, 2000); // 2-second failsafe
});

// --- GAME ASSETS (Images Removed) ---
const objects = [
  // Value changes the color logic below (Positive = Good, Negative = Bad)
  ["good", 10],
  ["good", 10],
  ["good", 10],
  ["good", 5],
  ["bad", -5],
  ["bad", -10],
];

// Anti-pop-in preloader loop removed because images are gone.

// --- EVENT LISTENERS ---
startButton.addEventListener("click", () => {
  if (gameActive) return;
  startButton.disabled = true;
  startButton.blur();
  backgroundMusic.play();
  startGame();
});

function flap() {
  if (gameActive) {
    velocity = jumpStrength;
  }
}

document.addEventListener("mousedown", flap);
document.addEventListener(
  "touchstart",
  (e) => {
    if (e.target !== startButton) {
      e.preventDefault();
      flap();
    }
  },
  { passive: false },
);

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    if (!e.repeat) flap();
  }
});

// --- MOBILE-OPTIMIZED GAME LOGIC (Images Removed) ---
function spawnObject() {
  if (!gameActive) return;

  // Select a random object type (for scoring logic)
  let randomObject = objects[Math.floor(Math.random() * objects.length)];

  // Create a styled DIV block instead of an IMG asset
  const objElement = document.createElement("div");
  objElement.classList.add("object");

  // Define visual appearance via code instead of heavy asset download
  objElement.style.borderRadius = "10px";
  objElement.style.border = "2px solid rgba(0,0,0,0.1)";
  objElement.style.boxShadow = "0 6px 10px rgba(0,0,0,0.1)";

  // Color Logic: Green = Good, Red = Bad
  objElement.style.backgroundColor =
    randomObject[1] > 0 ? "#2ecc71" : "#e74c3c";

  // Using cached screen sizes instead of asking the browser
  let startX = gameWidth + 100;
  let startY = Math.random() * (gameHeight - 50);

  // Use GPU Transforms instead of Top/Left for lag-free performance
  objElement.style.transform = `translate(${startX}px, ${startY}px)`;
  gameArea.appendChild(objElement);

  activeObjects.push({
    el: objElement,
    value: randomObject[1], // Store score value
    x: startX,
    y: startY,
  });
}

function gameLoop() {
  if (!gameActive && player.style.display === "none") return;

  velocity += gravity;
  playerY += velocity;

  // Using cached gameHeight completely stops mobile lag
  if (playerY > gameHeight - 60) {
    playerY = gameHeight - 60;
    velocity = 0;
  }
  if (playerY < 0) {
    playerY = 0;
    velocity = 0;
  }

  if (gameActive) {
    player.style.transform = `translateY(${playerY}px)`;
  }

  // Pre-calculated player boundaries ONCE per frame
  let pLeft = gameWidth * 0.1;
  let pRight = pLeft + 60;
  let pTop = playerY;
  let pBottom = playerY + 60;

  for (let i = 0; i < activeObjects.length; i++) {
    let obj = activeObjects[i];
    obj.x -= 4; // Float speed
    obj.el.style.transform = `translate(${obj.x}px, ${obj.y}px)`;

    // Math Collision (Instant calc)
    let oLeft = obj.x;
    let oRight = obj.x + 45;
    let oTop = obj.y;
    let oBottom = obj.y + 45;

    if (
      gameActive &&
      pLeft < oRight &&
      pRight > oLeft &&
      pTop < oBottom &&
      pBottom > oTop
    ) {
      // Handle Score update
      score += obj.value;
      scoreElement.textContent = `Score: ${score}`;

      // Set reaction text (YUMMY for green, EWW for red)
      reaction.textContent = obj.value > 0 ? "YUMMY!" : "EWW!";
      clearTimeout(reactionTimeout);
      reactionTimeout = setTimeout(() => (reaction.textContent = ""), 500);

      // Clean up DOM and array
      obj.el.remove();
      activeObjects.splice(i, 1);
      i--;
      continue;
    }

    // Remove if off-screen (with buffer)
    if (obj.x < -100) {
      obj.el.remove();
      activeObjects.splice(i, 1);
      i--;
    }
  }

  requestAnimationFrame(gameLoop);
}

// --- AUDIO SYNC CHOREOGRAPHY (TAB-BUG PROOF) ---
const choreography = [
  {
    time: 18,
    done: false,
    action: () => (gameArea.style.backgroundColor = "#f3e5f5"),
  },
  {
    time: 34,
    done: false,
    action: () => (gameArea.style.backgroundColor = "#e1bee7"),
  },
  {
    time: 52,
    done: false,
    action: () => (gameArea.style.backgroundColor = "#ce93d8"),
  },
  {
    time: 69,
    done: false,
    action: () => {
      gameArea.style.backgroundColor = "#ba68c8";
      dance1.style.display = "inline";
      dance1.classList.add("anim-pop");
    },
  },
  {
    time: 71,
    done: false,
    action: () => {
      dance2.style.display = "inline";
      dance2.classList.add("anim-pop");
    },
  },
  {
    time: 73,
    done: false,
    action: () => {
      dance3.style.display = "inline";
      dance3.classList.add("anim-pop");
    },
  },
  {
    time: 75,
    done: false,
    action: () => {
      dance4.style.display = "inline";
      dance4.classList.add("anim-pop");
    },
  },
  {
    time: 76,
    done: false,
    action: () => {
      gameActive = false;
      clearInterval(spawnInterval);

      // Rocket Exit via Transform (Tab-bug proof)
      player.style.transition = "transform 1.5s ease-in";
      // Blast way off to the right and top while scaling and rotating
      player.style.transform = `translate(150vw, -50vh) rotate(45deg) scale(1.5)`;
    },
  },
  {
    time: 77.5,
    done: false,
    action: () => {
      // Clear remaining screen objects (DIVs)
      activeObjects.forEach((obj) => obj.el.remove());
      activeObjects = [];
      player.style.display = "none";

      confetti.start();
      titleDialog.style.display = "flex";
      titleDialog.classList.add("anim-pop");
      cakeIcon.style.display = "block";
      cakeIcon.classList.add("anim-cake");
      endText1.style.display = "block";
      endText1.classList.add("anim-slide");
      finalScore.style.display = "block";
      finalScore.textContent = `You scored: ${score} points!`;
      finalScore.classList.add("anim-slide");
    },
  },
  {
    time: 80,
    done: false,
    action: () => {
      endText2.style.display = "block";
      endText2.classList.add("anim-slide");
    },
  },
  {
    time: 83,
    done: false,
    action: () => {
      endText3.style.display = "block";
      endText3.classList.add("anim-slide");
      balloonAnimation.start();
    },
  },
  {
    time: 86,
    done: false,
    action: () => {
      if (peekingFriend) peekingFriend.style.transform = "translateX(0px)";
    },
  },
];

let lastTimeLeft = -1; // Mobile optimized timer caching

// This listens to the music playing and runs the game based on the song's timestamp
backgroundMusic.addEventListener("timeupdate", () => {
  const currentTime = backgroundMusic.currentTime;

  // Update the on-screen countdown timer (Domspam fixed)
  if (gameActive) {
    let timeLeft = Math.ceil(68 - currentTime);
    if (timeLeft > 0) {
      if (timeLeft !== lastTimeLeft) {
        timerElement.innerHTML = `Party starts in<br>${timeLeft} seconds`;
        lastTimeLeft = timeLeft;
      }
    } else {
      timerElement.style.display = "none";
    }
  }

  // Trigger events when the music reaches the right second
  choreography.forEach((event) => {
    if (!event.done && currentTime >= event.time) {
      event.done = true;
      event.action();
    }
  });
});

function startGame() {
  gameActive = true;
  scoreElement.style.display = "inline";
  timerElement.style.display = "inline";

  titleDialog.style.display = "none";
  startText.style.display = "none";
  startButton.style.display = "none";

  gameLoop();
  spawnInterval = setInterval(spawnObject, 800);
}

// --- TAB SWITCHING CLEANUP ---
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearInterval(spawnInterval);
    backgroundMusic.pause();
  } else {
    if (gameActive) {
      spawnInterval = setInterval(spawnObject, 800);
      backgroundMusic.play();
    }
  }
});
