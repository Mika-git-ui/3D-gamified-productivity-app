
import * as THREE from 'three';

const GROWTH_TIME = 12;

const FLOWER_TYPES = {
  daisy: {
    name: 'Daisy',
    color: 0xff8fab,
    unlockLevel: 1
  },
  tulip: {
    name: 'Tulip',
    color: 0xcdb4db,
    unlockLevel: 2
  },
  sunflower: {
    name: 'Sunflower',
    color: 0xffc928,
    unlockLevel: 3
  }
};

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

    const border = new THREE.Mesh(
      new THREE.TorusGeometry(0.88, 0.09, 6, 24),
      new THREE.MeshStandardMaterial({
        color: 0xa77a50
      })
    );

    border.rotation.x = Math.PI / 2;
    border.position.y = 0.17;
    group.add(border);

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
      growthTime: 0,
      seedType: null
    });
  });

  return plots;
}

function clearPlant(plantGroup) {
  while (plantGroup.children.length > 0) {
    const object = plantGroup.children[0];

    plantGroup.remove(object);

    if (object.geometry) {
      object.geometry.dispose();
    }

    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(material => material.dispose());
      } else {
        object.material.dispose();
      }
    }
  }
}

function createPlant(plantGroup, stage, seedType) {
  clearPlant(plantGroup);

  if (stage === 'empty') return;

  const flower = FLOWER_TYPES[seedType];

  const stemHeight =
    stage === 'mature' ? 1.1 :
    stage === 'watered' ? 0.65 : 0.35;

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.055, stemHeight, 8),
    new THREE.MeshStandardMaterial({
      color: 0x39834b
    })
  );

  stem.position.y = stemHeight / 2;
  stem.castShadow = true;
  plantGroup.add(stem);

  const leafMaterial = new THREE.MeshStandardMaterial({
    color: 0x65a85b
  });

  for (let i = 0; i < 2; i++) {
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

  if (stage === 'mature') {
    const petalMaterial = new THREE.MeshStandardMaterial({
      color: flower.color
    });

    const centerMaterial = new THREE.MeshStandardMaterial({
      color: seedType === 'sunflower' ? 0x70451f : 0xffd166
    });

    const petalCount = seedType === 'tulip' ? 3 : 6;

    if (seedType === 'tulip') {
      const tulip = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 10, 10),
        petalMaterial
      );

      tulip.scale.set(0.8, 1.25, 0.8);
      tulip.position.y = stemHeight + 0.16;
      plantGroup.add(tulip);
    } else {
      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;

        const petal = new THREE.Mesh(
          new THREE.SphereGeometry(
            seedType === 'sunflower' ? 0.16 : 0.13,
            8,
            8
          ),
          petalMaterial
        );

        petal.position.set(
          Math.cos(angle) * 0.19,
          stemHeight + 0.05,
          Math.sin(angle) * 0.19
        );

        plantGroup.add(petal);
      }

      const center = new THREE.Mesh(
        new THREE.SphereGeometry(
          seedType === 'sunflower' ? 0.17 : 0.11,
          10,
          10
        ),
        centerMaterial
      );

      center.position.y = stemHeight + 0.05;
      plantGroup.add(center);
    }
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

  return nearestDistance > 2.2 ? null : nearestPlot;
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
    const seedType = inventory.selectedSeed;

    if (!FLOWER_TYPES[seedType]) {
      return { message: 'Choose a valid seed first!' };
    }

    if (inventory.seeds[seedType] <= 0) {
      return {
        message: `🌰 You don't have any ${FLOWER_TYPES[seedType].name} seeds!`
      };
    }

    inventory.seeds[seedType]--;

    plot.state = 'planted';
    plot.seedType = seedType;

    createPlant(plot.plantGroup, 'planted', seedType);

    return {
      message: `🌱 ${FLOWER_TYPES[seedType].name} seed planted! Press E to water it.`
    };
  }

  if (plot.state === 'planted') {
    plot.state = 'watered';
    plot.growthTime = 0;

    createPlant(plot.plantGroup, 'watered', plot.seedType);

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
    const harvestedType = plot.seedType;

    plot.state = 'empty';
    plot.growthTime = 0;
    plot.seedType = null;

    createPlant(plot.plantGroup, 'empty');

    inventory.seeds[harvestedType] += 2;
    inventory.harvested++;

    return {
      message: `🌸 ${FLOWER_TYPES[harvestedType].name} harvested! +15 XP and 2 seeds!`,
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

      createPlant(
        plot.plantGroup,
        'mature',
        plot.seedType
      );
    }
  });
}

export function getFlowerTypes() {
  return FLOWER_TYPES;
}
