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

// Physics
let playerY = window.innerHeight / 2;
let velocity = 0;
const gravity = 0.4;
const jumpStrength = -7;

//document.addEventListener("DOMContentLoaded", () => {
//if (loading) loading.style.display = "none";
//if (gameArea) gameArea.style.display = "block";
//});

// NEW: Waits for HTML, Images, AND Fonts to finish loading before starting!
window.addEventListener("load", () => {
  document.fonts.ready.then(() => {
    if (loading) loading.style.display = "none";
    if (gameArea) gameArea.style.display = "block";
  });
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
  if (!gameActive && player.style.display === "none") return;

  velocity += gravity;
  playerY += velocity;

  if (playerY > gameArea.offsetHeight - player.offsetHeight) {
    playerY = gameArea.offsetHeight - player.offsetHeight;
    velocity = 0;
  }
  if (playerY < 0) {
    playerY = 0;
    velocity = 0;
  }

  // Only apply physics to player if she hasn't blasted off yet
  if (gameActive) {
    player.style.top = `${playerY}px`;
  }

  for (let i = 0; i < activeObjects.length; i++) {
    let obj = activeObjects[i];
    obj.x -= 4;
    obj.el.style.left = `${obj.x}px`;

    const playerRect = player.getBoundingClientRect();
    const objRect = obj.el.getBoundingClientRect();

    if (
      gameActive &&
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

// --- AUDIO SYNC CHOREOGRAPHY (TAB-BUG PROOF) ---
// These events trigger exactly when the audio reaches the specified seconds.
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
      player.style.transition = "all 1.5s ease-in";
      player.style.left = "150vw";
      player.style.top = "-20%";
      player.style.transform = "rotate(45deg) scale(1.5)";
    },
  },
  {
    time: 77.5,
    done: false,
    action: () => {
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

// This listens to the music playing and runs the game based on the song's timestamp
backgroundMusic.addEventListener("timeupdate", () => {
  const currentTime = backgroundMusic.currentTime;

  // Update the on-screen countdown timer
  if (gameActive) {
    let timeLeft = Math.ceil(68 - currentTime);
    if (timeLeft > 0) {
      timerElement.innerHTML = `Party starts in<br>${timeLeft} seconds`;
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
    backgroundMusic.pause(); // Because the logic is now tied to the music, pausing the music pauses the entire game timeline perfectly!
  } else {
    if (gameActive) {
      spawnInterval = setInterval(spawnObject, 800);
      backgroundMusic.play();
    }
  }
});
