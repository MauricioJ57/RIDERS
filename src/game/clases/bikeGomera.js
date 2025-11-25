// src/game/clases/bikeGomera.js
import Phaser from 'phaser';
import { INPUT_ACTIONS } from '../systems/InputSystem.js';

export function handleBikeGomera(bike) {
  const scene = bike.scene;
  const esVersus = scene.scene.key === 'Versus';

  // posicionar mira
  if (esVersus) {
    bike.mira.x = bike.x;
    bike.mira.y = bike.y - 150;
  } else {
    bike.handleMiraMovement();
  }

  const shooterId = 'player1';
  const botonDisparo = esVersus ? INPUT_ACTIONS.WEST : INPUT_ACTIONS.SOUTH;

  if (scene.inputSystem.isJustPressed(botonDisparo, shooterId)) {
    bike.fireGomera();
  }
}

export function fireGomeraImpl(bike) {
  const scene = bike.scene;
  const camion = scene.camion;
  if (!camion) return;

  const bounds = camion.getBounds();
  const acierta =
    (bike.mira.visible &&
      Phaser.Geom.Rectangle.Contains(bounds, bike.mira.x, bike.mira.y)) ||
    bike.currentLane === scene.camionLane;

  if (acierta) {
    camion.setTint(0xff0000);
    scene.time.delayedCall(500, () => camion.clearTint());

    scene.sound.play('sfx_disparo', { volume: 0.6 });

    const sonidosRisas = [
      'sfx_neneRisa1',
      'sfx_neneRisa2',
      'sfx_neneRisa3',
      'sfx_neneRisa4'
    ];
    const sonidoElegidoRisa = Phaser.Utils.Array.GetRandom(sonidosRisas);
    scene.sound.play(sonidoElegidoRisa, { volume: 0.8 });

    scene.vidasCamion -= 1;
    if (scene.vidasCamion < 0) scene.vidasCamion = 0;

    if (scene.actualizarBarraVidaCamion) {
      scene.actualizarBarraVidaCamion(
        scene.vidasCamion,
        scene.vidasCamionMax
      );
    }

    // victoria
    if (scene.vidasCamion <= 0 && !scene.gameOver) {
      scene.gameOver = true;
      const modo = scene.scene.key === 'Versus' ? 'Versus' : 'Cooperativo';
      let payload;

      if (modo === 'Cooperativo') {
        payload = { modo, resultado: 'victoria', ganador: 'equipo' };
      } else {
        payload = { modo, resultado: 'victoria', ganador: 'bici' };
      }

      if (scene.puntuacion !== undefined) {
        payload.puntaje = scene.puntuacion;
      }

      // parar sonidos al terminar
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
    }
  } else {
    // fallo solo si no acertó
    scene.sound.play('sfx_fallo', { volume: 0.6 });
  }

  bike.hasGomera = false;
  bike.mira.setVisible(false);
  bike.play('pedalear');
}

export function giveGomeraImpl(bike) {
  const scene = bike.scene;

  if (!bike.hasGomera) {
    bike.hasGomera = true;
    bike.mira.setVisible(true);
    bike.mira.x = bike.x;
    bike.mira.y = bike.y - 200;
  } else {
    bike.mira.setVisible(true);
  }

  bike.play('biciConGomera');
  scene.sound.play('sfx_recogerItem', { volume: 0.7 });
  scene.time.delayedCall(200, () => {
    scene.sound.play('sfx_gomeraSonido', { volume: 0.4 });
  });
}
