import * as THREE from 'three';

export function createEnvironment(scene) {

  // GROUND
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({
      color: 0x8fbd78,
      roughness: 1
    })
  );

  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);


  // SKY
  scene.background = new THREE.Color(0xb5dce9);
  scene.fog = new THREE.Fog(0xb5dce9, 35, 85);


  // TREE FUNCTION
  function createTree(x, z, scale = 1) {

    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.18 * scale,
        0.25 * scale,
        1.6 * scale,
        7
      ),
      new THREE.MeshStandardMaterial({
        color: 0x805438
      })
    );

    trunk.position.y = 0.8 * scale;
    trunk.castShadow = true;
    tree.add(trunk);


    const colors = [
      0x397b49,
      0x4c9255,
      0x679d57
    ];

    const foliageMaterial = new THREE.MeshStandardMaterial({
      color: colors[Math.floor(Math.random() * colors.length)]
    });

    const foliage = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.05 * scale, 1),
      foliageMaterial
    );

    foliage.position.y = 2 * scale;
    foliage.castShadow = true;
    tree.add(foliage);

    tree.position.set(x, 0, z);
    scene.add(tree);
  }


  // CREATE TREES
  const trees = [
    [-10, -8, 1.2],
    [-8, 7, 1],
    [9, -8, 1.3],
    [11, 7, 1],
    [-13, 0, 1],
    [13, 1, 1.2],
    [-5, 12, 1.1],
    [5, 12, 1.1],
    [-14, 11, 0.9],
    [14, -12, 1]
  ];

  trees.forEach(([x, z, scale]) => {
    createTree(x, z, scale);
  });


  // FLOWER FUNCTION
  function createFlower(x, z, color) {

    const flower = new THREE.Group();

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.035, 0.45, 5),
      new THREE.MeshStandardMaterial({
        color: 0x39764a
      })
    );

    stem.position.y = 0.22;
    flower.add(stem);


    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0xffd166
      })
    );

    center.position.y = 0.48;
    flower.add(center);


    for (let i = 0; i < 5; i++) {

      const angle = (i / 5) * Math.PI * 2;

      const petal = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshStandardMaterial({
          color
        })
      );

      petal.position.set(
        Math.cos(angle) * 0.16,
        0.48,
        Math.sin(angle) * 0.16
      );

      flower.add(petal);
    }

    flower.position.set(x, 0, z);
    scene.add(flower);
  }


  // FLOWER PATCHES
  const flowerColors = [
    0xff8fab,
    0xcdb4db,
    0xffd6a5,
    0xffffff,
    0xff6f91
  ];

  for (let i = 0; i < 90; i++) {

    const x = (Math.random() - 0.5) * 25;
    const z = (Math.random() - 0.5) * 25;

    // Leave the central area open for walking.
    if (Math.abs(x) < 3 && Math.abs(z) < 4) {
      continue;
    }

    const color = flowerColors[
      Math.floor(Math.random() * flowerColors.length)
    ];

    createFlower(x, z, color);
  }


  // POND
  const pond = new THREE.Mesh(
    new THREE.CircleGeometry(2.5, 32),
    new THREE.MeshStandardMaterial({
      color: 0x72c7d5,
      roughness: 0.25,
      metalness: 0.1
    })
  );

  pond.rotation.x = -Math.PI / 2;
  pond.position.set(6, 0.025, 4);
  scene.add(pond);


  // POND BORDER
  const pondBorder = new THREE.Mesh(
    new THREE.TorusGeometry(2.5, 0.16, 8, 40),
    new THREE.MeshStandardMaterial({
      color: 0xb9a17a
    })
  );

  pondBorder.rotation.x = Math.PI / 2;
  pondBorder.position.set(6, 0.05, 4);
  scene.add(pondBorder);


  // STONE PATH
  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0xc8bba0,
    roughness: 1
  });

  for (let i = 0; i < 12; i++) {

    const stone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.52, 0.12, 6),
      stoneMaterial
    );

    stone.position.set(
      0,
      0.08,
      -7 + i * 0.8
    );

    stone.rotation.y = Math.random() * 0.4;
    stone.receiveShadow = true;

    scene.add(stone);
  }


  // ROCKS
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x999b91,
    roughness: 1
  });

  for (let i = 0; i < 16; i++) {

    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(
        0.3 + Math.random() * 0.35,
        0
      ),
      rockMaterial
    );

    const x = (Math.random() - 0.5) * 25;
    const z = (Math.random() - 0.5) * 25;

    if (Math.abs(x) < 3 && Math.abs(z) < 3) continue;

    rock.position.set(x, 0.25, z);
    rock.castShadow = true;

    scene.add(rock);
  }


  // DECORATIVE BUSHES
  const bushMaterial = new THREE.MeshStandardMaterial({
    color: 0x548b50
  });

  for (let i = 0; i < 18; i++) {

    const bush = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.5, 1),
      bushMaterial
    );

    const x = (Math.random() - 0.5) * 25;
    const z = (Math.random() - 0.5) * 25;

    bush.position.set(x, 0.4, z);
    bush.castShadow = true;

    scene.add(bush);
  }

}