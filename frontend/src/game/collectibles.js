
import * as THREE from 'three';

export function createCollectibles(scene) {
  const collectibles = [];

  const positions = [
    [-5, 0, -5],
    [5, 0, -7],
    [-8, 0, 3],
    [9, 0, 2],
    [3, 0, 9],
    [-10, 0, -10],
    [12, 0, -5],
    [-4, 0, 12],
    [10, 0, 11],
    [0, 0, -12]
  ];

  const geometry = new THREE.OctahedronGeometry(0.35, 0);

  const material = new THREE.MeshStandardMaterial({
    color: 0xffd54f,
    emissive: 0xffa000,
    emissiveIntensity: 1.5,
    metalness: 0.25,
    roughness: 0.3
  });

  positions.forEach(([x, y, z]) => {
    const star = new THREE.Mesh(geometry, material);

    star.position.set(x, 0.8, z);
    star.castShadow = true;

    scene.add(star);
    collectibles.push(star);
  });

  return collectibles;
}

export function updateCollectibles(
  collectibles,
  player,
  delta,
  onCollect
) {
  for (let i = collectibles.length - 1; i >= 0; i--) {
    const star = collectibles[i];

    star.rotation.y += delta * 2;
    star.position.y = 0.8 + Math.sin(performance.now() * 0.002 + i) * 0.12;

    const distance = star.position.distanceTo(player.position);

    if (distance < 1.2) {
      star.parent.remove(star);
      collectibles.splice(i, 1);
      onCollect();
    }
  }
}
