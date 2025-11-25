// src/game/clases/bikeCollision.js

export function handleCollisionImpl(bike, obstaculo) {
  const scene = bike.scene;

  // si está saltando, ignora tomates
  if (bike.FSM.state === 'jumping' && obstaculo.tipo === 'tomates') return;

  if (obstaculo.tipo === 'banana') {
    scene.sound.play('sfx_banana', { volume: 0.4 });
    obstaculo.deactivate();

    let dir = 0;
    if (bike.currentLane === 0) dir = 1;
    else if (bike.currentLane === bike.lanes.length - 1) dir = -1;
    else dir = Math.random() < 0.5 ? -1 : 1;

    bike.currentLane += dir;
    bike.x = bike.lanes[bike.currentLane];
    return;
  }

  if (
    !bike.invulnerable &&
    (obstaculo.tipo === 'caja' || obstaculo.tipo === 'tomates')
  ) {
    bike.perderVida();
  }
}
