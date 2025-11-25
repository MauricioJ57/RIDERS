// src/game/clases/PlayerBike.js
import Phaser from 'phaser';
import { INPUT_ACTIONS } from '../systems/InputSystem.js';
import StateMachine from '../clases/StateMachine.js';

// Helpers
import { handleBikeJump } from '../clases/bikeJump.js';
import { handleBikeGomera, fireGomeraImpl, giveGomeraImpl } from '../clases/bikeGomera.js';
import { perderVidaImpl, limpiarEfectosImpl } from '../clases/bikeDamage.js';
import { handleCollisionImpl } from '../clases/bikeCollision.js';

export default class PlayerBike extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, lanes) {
    super(scene, x, y, 'bici');

    // Estado inicial
    this.lives = 3;
    this.invulnerable = false;
    this.danoTween = null;
    this.setAlpha(1);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;
    this.lanes = lanes;
    this.currentLane = 2;
    this.setScale(1);
    this.setCollideWorldBounds(true);
    this.play('pedalear');

    // hitbox
    this.setSize(40, 60);

    // cámara para sacudidas de daño
    this.shakeCamera = scene.cameras.main;

    // gomera
    this.hasGomera = false;
    this.mira = scene.add
      .sprite(this.x, this.y - 200, 'mira')
      .setDepth(1)
      .setVisible(false);

    this.estaSaltando = false;
    this.jumpTween = null;

    // FSM simple para salto
    this.FSM = new StateMachine(
      'normal',
      {
        normal: {},
        jumping: {
          enter: (data) => {
            this.jumpUntil = this.scene.time.now + data.duration;
          },
          execute: () => {
            if (this.scene.time.now > this.jumpUntil) this.FSM.transition('normal');
          },
          exit: () => {
            this.jumpUntil = null;
          }
        }
      },
      this
    );

    // SONIDO DE LA BICI
    this.sonidoBici = this.scene.sound.add('sfx_biciSonido', {
      volume: 0.6,
      loop: true
    });
    this.sonidoBici.play();

    // Avisar a la UI cuántas vidas tenemos al inicio
    this.scene.events.emit('ui_setLives', this.lives);
  }

  update() {
    this.FSM.step();

    const input = this.scene.inputSystem;
    if (!input) return;

    // movimiento lateral
    if (input.isJustPressed(INPUT_ACTIONS.LEFT, 'player1')) this.move(-1);
    if (input.isJustPressed(INPUT_ACTIONS.RIGHT, 'player1')) this.move(1);

    // salto (delegado)
    handleBikeJump(this, input);

    // gomera (delegado)
    if (this.hasGomera) {
      handleBikeGomera(this);
    }
  }

  move(dir) {
    const newLane = this.currentLane + dir;
    if (newLane >= 0 && newLane < this.lanes.length) {
      this.currentLane = newLane;
      this.x = this.lanes[newLane];
    }
  }

  handleMiraMovement() {
    const speed = 5;
    const input = this.scene.inputSystem;
    if (!input) return;

    if (input.isPressed(INPUT_ACTIONS.LEFT, 'player2')) this.mira.x -= speed;
    if (input.isPressed(INPUT_ACTIONS.RIGHT, 'player2')) this.mira.x += speed;
    if (input.isPressed(INPUT_ACTIONS.UP, 'player2')) this.mira.y -= speed;
    if (input.isPressed(INPUT_ACTIONS.DOWN, 'player2')) this.mira.y += speed;

    const { width, height } = this.scene.sys.game.config;
    this.mira.x = Phaser.Math.Clamp(this.mira.x, 0, width);
    this.mira.y = Phaser.Math.Clamp(this.mira.y, 0, height);
  }

  // Delegar a implementación externa
  fireGomera() {
    fireGomeraImpl(this);
  }

  giveGomera() {
    giveGomeraImpl(this);
  }

  handleCollision(obstaculo) {
    handleCollisionImpl(this, obstaculo);
  }

  perderVida() {
    perderVidaImpl(this);
  }

  limpiarEfectos() {
    limpiarEfectosImpl(this);
  }

  destroy(fromScene) {
    this.limpiarEfectos();
    this.mira?.destroy();
    super.destroy(fromScene);
  }
}
