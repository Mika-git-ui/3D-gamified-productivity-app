
import * as THREE from 'three';

const GROWTH_TIME = 12;

export function createGardenPlots(scene) {
  const positions = [
    [-4, 0, 2],
    [4, 0, -2],
    [-7, 0, 7],
    [9, 0, -7]
  ];

  const plots = [];

  positions.forEach(([x, y, z], index) => {
    const group = new THREE.Group();

    // Soil
    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.95, 0.18, 16),
      new THREE.MeshStandardMaterial({
        color: 0x79583d,
        roughness: 1
      })
    );

    soil.position.y = 0.09;
    soil.receiveShadow = true;
    group.add(soil);

    // Wooden border
    const border = new THREE.Mesh(
      new THREE.TorusGeometry(0.88, 0.09, 6, 24),
      new THREE.MeshStandardMaterial({
        color: 0xa77a50
      })
    );

    border.rotation.x = Math.PI / 2;
    border.position.y = 0.17;
    group.add(border);

    // Plant container
    const plantGroup = new THREE.Group();
    plantGroup.position.y = 0.18;
    group.add(plantGroup);

    group.position.set(x, y, z);
    scene.add(group);

    plots.push({
      id: index + 1,
      group,
      plantGroup,
      state: 'empty',
      growthTime: 0
    });
  });

  return plots;
}

function clearPlant(plantGroup) {
  while (plantGroup.children.length > 0) {
    const object = plantGroup.children[0];

    plantGroup.remove(object);

    if (object.geometry) object.geometry.dispose();

    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(material => material.dispose());
      } else {
        object.material.dispose();
      }
    }
  }
}

function createPlant(plantGroup, stage) {
  clearPlant(plantGroup);

  if (stage === 'empty') return;

  const stemMaterial = new THREE.MeshStandardMaterial({
    color: 0x39834b
  });

  const stemHeight = stage === 'mature' ? 1.1 :
    stage === 'watered' ? 0.65 : 0.35;

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.055, stemHeight, 8),
    stemMaterial
  );

  stem.position.y = stemHeight / 2;
  stem.castShadow = true;
  plantGroup.add(stem);

  // Leaves
  const leafMaterial = new THREE.MeshStandardMaterial({
    color: 0x65a85b
  });

  const leafCount = stage === 'planted' ? 1 : 2;

  for (let i = 0; i < leafCount; i++) {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 8, 8),
      leafMaterial
    );

    leaf.scale.set(1.4, 0.45, 0.7);
    leaf.position.set(
      i === 0 ? -0.15 : 0.15,
      stemHeight * 0.55,
      0
    );

    leaf.rotation.z = i === 0 ? -0.35 : 0.35;
    plantGroup.add(leaf);
  }

  // Flower
  if (stage === 'mature') {
    const flowerColors = [
      0xff8fab,
      0xcdb4db,
      0xffd166,
      0xffffff
    ];

    const color = flowerColors[
      Math.floor(Math.random() * flowerColors.length)
    ];

    const petalMaterial = new THREE.MeshStandardMaterial({
      color
    });

    const centerMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd166
    });

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;

      const petal = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 8, 8),
        petalMaterial
      );

      petal.position.set(
        Math.cos(angle) * 0.16,
        stemHeight + 0.05,
        Math.sin(angle) * 0.16
      );

      plantGroup.add(petal);
    }

    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 10, 10),
      centerMaterial
    );

    center.position.y = stemHeight + 0.05;
    plantGroup.add(center);
  }
}

export function getNearestPlot(plots, player) {
  let nearestPlot = null;
  let nearestDistance = Infinity;

  plots.forEach(plot => {
    const distance = plot.group.position.distanceTo(player.position);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestPlot = plot;
    }
  });

  if (nearestDistance > 2.2) return null;

  return nearestPlot;
}

export function interactWithNearestPlot(
  plots,
  player,
  inventory
) {
  const plot = getNearestPlot(plots, player);

  if (!plot) {
    return {
      message: '🌱 Walk closer to a garden plot!'
    };
  }

  if (plot.state === 'empty') {
    if (inventory.seeds <= 0) {
      return {
        message: '🌰 You need more seeds!'
      };
    }

    inventory.seeds--;

    plot.state = 'planted';
    createPlant(plot.plantGroup, 'planted');

    return {
      message: '🌱 Seed planted! Press E again to water it.'
    };
  }

  if (plot.state === 'planted') {
    plot.state = 'watered';
    plot.growthTime = 0;

    createPlant(plot.plantGroup, 'watered');

    return {
      message: '💧 Watered! Your flower is growing.'
    };
  }

  if (plot.state === 'watered') {
    return {
      message: '🌿 Your flower is growing. Give it a little time!'
    };
  }

  if (plot.state === 'mature') {
    plot.state = 'empty';
    plot.growthTime = 0;

    createPlant(plot.plantGroup, 'empty');

    inventory.seeds += 2;
    inventory.harvested++;

    return {
      message: '🌸 Flower harvested! +15 XP and 2 seeds!',
      harvested: true
    };
  }
}

export function updateGardenPlots(plots, delta) {
  plots.forEach(plot => {
    if (plot.state !== 'watered') return;

    plot.growthTime += delta;

    if (plot.growthTime >= GROWTH_TIME) {
      plot.state = 'mature';
      createPlant(plot.plantGroup, 'mature');
    }
  });
}
