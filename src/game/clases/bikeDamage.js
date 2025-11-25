// src/game/clases/bikeDamage.js
import Phaser from 'phaser';

export function perderVidaImpl(bike) {
  const scene = bike.scene;

  bike.lives--;

  // sonidos de daño random
  const sonidosDañoNene = ['sfx_neneDaño1', 'sfx_neneDaño2'];
  const sonidoElegidoNene = Phaser.Utils.Array.GetRandom(sonidosDañoNene);
  scene.sound.play(sonidoElegidoNene, { volume: 0.8 });
  scene.sound.play('sfx_daño', { volume: 0.7 });

  // avisar a la UI cuántas vidas quedaron
  scene.events.emit('ui_setLives', bike.lives);

  // avisar HUD de corazones (Coop)
  if (scene.actualizarVidasBici) {
    scene.actualizarVidasBici(bike.lives);
  }

  // muerte
  if (bike.lives <= 0 && !scene.gameOver) {
    scene.gameOver = true;
    const modo = scene.scene.key === 'Versus' ? 'Versus' : 'Cooperativo';
    const payload =
      modo === 'Cooperativo'
        ? { modo, resultado: 'derrota', ganador: 'ninguno' }
        : { modo, resultado: 'derrota', ganador: 'camion' };

    if (scene.puntuacion !== undefined) {
      payload.puntaje = scene.puntuacion;
    }

    // detener sonidos al terminar
    if (bike.sonidoBici) {
      bike.sonidoBici.stop();
      bike.sonidoBici.destroy();
      bike.sonidoBici = null;
    }
    if (scene.sonidoCamion) {
      scene.sonidoCamion.stop();
      scene.sonidoCamion.destroy();
      scene.sonidoCamion = null;
    }

    scene.scene.start('GameOver', payload);
    return;
  }

  // daño sin morir
  bike.invulnerable = true;

  if (bike.danoTween) {
    bike.danoTween.remove();
    bike.setAlpha(1);
  }

  bike.danoTween = scene.tweens.add({
    targets: bike,
    alpha: 0.3,
    yoyo: true,
    repeat: 6,
    duration: 200,
    onComplete: () => {
      bike.setAlpha(1);
      bike.danoTween = null;
    }
  });

  if (bike.shakeCamera) {
    bike.shakeCamera.shake(500, 0.001);
  }

  scene.time.delayedCall(2000, () => {
    bike.invulnerable = false;
    bike.setAlpha(1);
  });
}

export function limpiarEfectosImpl(bike) {
  if (bike.danoTween) {
    bike.danoTween.remove();
    bike.danoTween = null;
  }
  bike.setAlpha(1);
  bike.invulnerable = false;
}
