
import * as THREE from 'three';

import { createEnvironment } from './game/environment.js';

import {
  createPlayer,
  updatePlayer
} from './game/player.js';

import {
  createCollectibles,
  updateCollectibles
} from './game/collectibles.js';

import {
  collectStar as processStarCollection,
  getProgress,
  awardXP
} from './game/progression.js';

import {
  createGardenPlots,
  getNearestPlot,
  interactWithNearestPlot,
  updateGardenPlots
} from './game/gardenPlots.js';

import './style.css';


// SCENE
const scene = new THREE.Scene();

scene.background = new THREE.Color(0xb5dce9);
scene.fog = new THREE.Fog(0xb5dce9, 35, 85);


// CAMERA
const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(0, 5, 8);


// RENDERER
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

document.querySelector('#app').appendChild(renderer.domElement);


// LIGHTING
const ambientLight = new THREE.HemisphereLight(
  0xdff3ff,
  0x6d8752,
  2
);

scene.add(ambientLight);

const sunlight = new THREE.DirectionalLight(0xfff0d6, 2.5);

sunlight.position.set(-10, 18, 10);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(2048, 2048);
sunlight.shadow.camera.left = -25;
sunlight.shadow.camera.right = 25;
sunlight.shadow.camera.top = 25;
sunlight.shadow.camera.bottom = -25;

scene.add(sunlight);


// ENVIRONMENT
createEnvironment(scene);


// PLAYER
const { player, legs } = createPlayer(scene);


// COLLECTIBLES
const collectibles = createCollectibles(scene);


// GARDEN PLOTS
const gardenPlots = createGardenPlots(scene);


// INVENTORY
const inventory = {
  seeds: 5,
  harvested: 0
};


// HUD ELEMENTS
const starCounter = document.querySelector('#star-count');
const levelCounter = document.querySelector('#level-count');
const xpCounter = document.querySelector('#xp-count');
const xpFill = document.querySelector('#xp-fill');

const seedCounter = document.querySelector('#seed-count');
const harvestCounter = document.querySelector('#harvest-count');

const questOneStatus = document.querySelector('#quest-one-status');
const questTwoStatus = document.querySelector('#quest-two-status');

const questOneFill = document.querySelector('#quest-one-fill');
const questTwoFill = document.querySelector('#quest-two-fill');

const message = document.querySelector('#game-message');
const plotHint = document.querySelector('#plot-hint');

let messageTimeout;
let lastHint = '';


// REFRESH PLAYER HUD
function refreshHUD(progress) {
  starCounter.textContent = progress.stars;
  levelCounter.textContent = progress.level;

  xpCounter.textContent =
    `${progress.xpIntoLevel} / ${progress.xpNeeded} XP`;

  xpFill.style.width = `${progress.xpPercentage}%`;

  const firstQuest = progress.quests[0];
  const secondQuest = progress.quests[1];

  questOneStatus.textContent = firstQuest.completed
    ? '✓ Done'
    : `${firstQuest.progress}/${firstQuest.target}`;

  questTwoStatus.textContent = secondQuest.completed
    ? '✓ Done'
    : `${secondQuest.progress}/${secondQuest.target}`;

  questOneFill.style.width =
    `${(firstQuest.progress / firstQuest.target) * 100}%`;

  questTwoFill.style.width =
    `${(secondQuest.progress / secondQuest.target) * 100}%`;
}


// REFRESH INVENTORY HUD
function refreshInventory() {
  seedCounter.textContent = inventory.seeds;
  harvestCounter.textContent = inventory.harvested;
}


// DISPLAY MESSAGE
function showMessage(text) {
  message.textContent = text;

  clearTimeout(messageTimeout);

  messageTimeout = setTimeout(() => {
    message.textContent = 'Explore your little garden 🌱';
  }, 2500);
}


// COLLECT STAR
function handleStarCollection() {
  const result = processStarCollection();

  refreshHUD(result);

  let text = '✨ Magical star collected! +20 XP';

  if (result.completedQuests.length > 0) {
    text = `🏆 Quest complete: ${result.completedQuests.join(', ')}!`;
  }

  if (result.levelUp) {
    text = `🎉 LEVEL UP! You are now level ${result.level}!`;
  }

  showMessage(text);
}


// GARDEN INTERACTION
function handleGardenInteraction() {
  const result = interactWithNearestPlot(
    gardenPlots,
    player,
    inventory
  );

  refreshInventory();

  if (result.harvested) {
    const progress = awardXP(15);

    refreshHUD(progress);

    if (progress.levelUp) {
      result.message = `🎉 LEVEL UP! You reached level ${progress.level}!`;
    }
  }

  showMessage(result.message);
}


// INITIAL HUD
refreshHUD(getProgress());
refreshInventory();


// KEYBOARD INPUT
const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  shift: false
};

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();

  if (key in keys) {
    keys[key] = true;
  }

  if (key === 'e' && !event.repeat) {
    handleGardenInteraction();
  }
});

window.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase();

  if (key in keys) {
    keys[key] = false;
  }
});

window.addEventListener('blur', () => {
  Object.keys(keys).forEach(key => {
    keys[key] = false;
  });
});


// GAME LOOP
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  updatePlayer(
    player,
    legs,
    camera,
    keys,
    delta
  );

  updateCollectibles(
    collectibles,
    player,
    delta,
    handleStarCollection
  );

  updateGardenPlots(
    gardenPlots,
    delta
  );

  // Show interaction hint when near a plot.
  const nearbyPlot = getNearestPlot(gardenPlots, player);

  let hint = 'Find a garden plot to plant a seed.';

  if (nearbyPlot) {
    if (nearbyPlot.state === 'empty') {
      hint = 'Press E to plant a seed 🌱';
    } else if (nearbyPlot.state === 'planted') {
      hint = 'Press E to water your seed 💧';
    } else if (nearbyPlot.state === 'watered') {
      hint = 'Your flower is growing... 🌿';
    } else if (nearbyPlot.state === 'mature') {
      hint = 'Press E to harvest your flower 🌸';
    }

    if (nearbyPlot.state === 'empty' && inventory.seeds <= 0) {
      hint = 'You need seeds to plant here 🌰';
    }
  }

  if (hint !== lastHint) {
    plotHint.textContent = hint;
    lastHint = hint;
  }

  renderer.render(scene, camera);
}

animate();


// RESIZE
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
});
