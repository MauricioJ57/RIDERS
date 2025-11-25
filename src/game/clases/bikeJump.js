// src/game/clases/bikeJump.js
import Phaser from 'phaser';
import { INPUT_ACTIONS } from '../systems/InputSystem.js';

export function handleBikeJump(bike, input) {
  const scene = bike.scene;

  const esVersus = scene.scene.key === 'Versus';
  const jumperId = esVersus ? 'player1' : 'player2';
  const botonSalto = esVersus ? INPUT_ACTIONS.SOUTH : INPUT_ACTIONS.WEST;

  if (
    input.isJustPressed(botonSalto, jumperId) &&
    bike.FSM.state === 'normal' &&
    !bike.estaSaltando
  ) {
    bike.estaSaltando = true;
    const duracionSalto = esVersus ? 700 : 1000;
    const duracionTween = esVersus ? 350 : 500;

    scene.sound.play('sfx_salto', { volume: 0.3 });

    // sonidos de salto random
    const sonidosSalto = ['sfx_neneSalto1', 'sfx_neneSalto2'];
    const sonidoElegidoSalto = Phaser.Utils.Array.GetRandom(sonidosSalto);
    scene.sound.play(sonidoElegidoSalto, { volume: 0.8 });

    // pausar sonido de bici al saltar
    if (bike.sonidoBici && bike.sonidoBici.isPlaying) {
      bike.sonidoBici.pause();
    }

    bike.FSM.transition('jumping', { duration: duracionSalto });
    bike.setDepth(1);

    if (bike.jumpTween) {
      bike.jumpTween.remove();
      bike.jumpTween = null;
      bike.setScale(1);
    }

    bike.jumpTween = scene.tweens.add({
      targets: bike,
      scale: 1.5,
      duration: duracionTween,
      ease: 'Quad.easeOut',
      yoyo: true,
      hold: 80,
      onComplete: () => {
        bike.setDepth(0);
        bike.FSM.transition('normal');
        bike.estaSaltando = false;
        bike.jumpTween = null;

        // reanudar sonido de bici al caer
        if (bike.sonidoBici && !bike.sonidoBici.isPlaying) {
          bike.sonidoBici.resume();
        }
      }
    });
  }
}
