import * as THREE from 'three';

export function createPlayer(scene) {

  const player = new THREE.Group();

  // BODY
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.35, 0.55, 4, 8),
    new THREE.MeshStandardMaterial({
      color: 0xe7a0b5
    })
  );

  body.position.y = 0.85;
  body.castShadow = true;
  player.add(body);


  // HEAD
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xffd5b5
    })
  );

  head.position.y = 1.55;
  head.castShadow = true;
  player.add(head);


  // HAIR
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.65),
    new THREE.MeshStandardMaterial({
      color: 0x65412e
    })
  );

  hair.position.y = 1.62;
  player.add(hair);


  // LEGS
  const legMaterial = new THREE.MeshStandardMaterial({
    color: 0x765b9e
  });

  const legs = [];

  for (let i = 0; i < 2; i++) {

    const leg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.11, 0.32, 3, 6),
      legMaterial
    );

    leg.position.set(
      i === 0 ? -0.16 : 0.16,
      0.28,
      0
    );

    leg.castShadow = true;
    player.add(leg);

    legs.push(leg);
  }


  player.position.set(0, 0, 0);

  scene.add(player);

  return {
    player,
    legs
  };
}


export function updatePlayer(
  player,
  legs,
  camera,
  keys,
  delta
) {

  const direction = new THREE.Vector3();

  if (keys.w) direction.z -= 1;
  if (keys.s) direction.z += 1;
  if (keys.a) direction.x -= 1;
  if (keys.d) direction.x += 1;

  const moving = direction.lengthSq() > 0;

  if (moving) {

    direction.normalize();

    const running = keys.shift;
    const speed = running ? 9 : 5;

    player.position.x += direction.x * speed * delta;
    player.position.z += direction.z * speed * delta;

    // Keep player inside the garden.
    player.position.x = THREE.MathUtils.clamp(
      player.position.x, -17, 17
    );

    player.position.z = THREE.MathUtils.clamp(
      player.position.z, -17, 17
    );

    // Face the direction of movement.
    const targetRotation = Math.atan2(
      direction.x,
      direction.z
    );

    player.rotation.y = THREE.MathUtils.lerp(
      player.rotation.y,
      targetRotation,
      Math.min(1, delta * 10)
    );
  }


  // LEG ANIMATION
  const time = performance.now() * 0.012;

  legs[0].rotation.x = moving ? Math.sin(time) * 0.6 : 0;
  legs[1].rotation.x = moving ? -Math.sin(time) * 0.6 : 0;


  // CAMERA FOLLOWING
  const cameraOffset = new THREE.Vector3(0, 5, 8);

  const desiredCameraPosition = player.position.clone()
    .add(cameraOffset);

  camera.position.lerp(
    desiredCameraPosition,
    Math.min(1, delta * 4)
  );

  camera.lookAt(
    player.position.x,
    player.position.y + 1,
    player.position.z
  );

}