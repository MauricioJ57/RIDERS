import Phaser from 'phaser';
import { INPUT_ACTIONS } from '../systems/InputSystem.js';
import StateMachine from '../clases/StateMachine.js';

export default class PlayerBike extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, lanes) {
    super(scene, x, y, 'bici');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;
    this.lanes = lanes;
    this.currentLane = 2;
    this.setScale(1);
    this.setCollideWorldBounds(true);
    this.play('pedalear');

    // hitbox ajustable
    this.setSize(40, 60);
    // this.setOffset(10, 20);

    // vidas e invulnerabilidad
    this.lives = 3;
    this.invulnerable = false;

    // interfaz de corazones
    this.vidasVisiblesLlenas = scene.add.image(1600, 16, 'corazones-llenos').setOrigin(0, 0).setScrollFactor(0);
    this.vidasVisibles2 = scene.add.image(1600, 16, 'dos corazones').setOrigin(0, 0).setScrollFactor(0).setVisible(false);
    this.vidasVisibles1 = scene.add.image(1600, 16, 'un corazon').setOrigin(0, 0).setScrollFactor(0).setVisible(false);

    // gomera
    this.hasGomera = false;
    this.mira = scene.add.sprite(this.x, this.y - 200, 'mira').setDepth(1).setVisible(false);

    // FSM (salto y normal)
    this.FSM = new StateMachine('normal', {
      normal: {},
      jumping: {
        enter: (data) => { this.jumpUntil = this.scene.time.now + data.duration; },
        execute: () => {
          if (this.scene.time.now > this.jumpUntil) this.FSM.transition('normal');
        },
        exit: () => { this.jumpUntil = null; }
      }
    }, this);
  }

  update() {
    this.FSM.step();

    const input = this.scene.inputSystem;

    // movimiento lateral
    if (input.isJustPressed(INPUT_ACTIONS.LEFT, "player1")) this.move(-1);
    if (input.isJustPressed(INPUT_ACTIONS.RIGHT, "player1")) this.move(1);

    // salto
    if (input.isJustPressed(INPUT_ACTIONS.WEST, "player2") && this.FSM.state === 'normal') {
      this.FSM.transition('jumping', { duration: 1000 });
      this.setScale(1.5);
      this.scene.time.delayedCall(1000, () => this.setScale(1));
      this.setDepth(1);
    }

    // uso de la gomera
    if (this.hasGomera) {
      this.handleMiraMovement();
      if (input.isJustPressed(INPUT_ACTIONS.EAST, "player1")) this.fireGomera();
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

    if (input.isPressed(INPUT_ACTIONS.LEFT, "player2")) this.mira.x -= speed;
    if (input.isPressed(INPUT_ACTIONS.RIGHT, "player2")) this.mira.x += speed;
    if (input.isPressed(INPUT_ACTIONS.UP, "player2")) this.mira.y -= speed;
    if (input.isPressed(INPUT_ACTIONS.DOWN, "player2")) this.mira.y += speed;

    const { width, height } = this.scene.sys.game.config;
    this.mira.x = Phaser.Math.Clamp(this.mira.x, 0, width);
    this.mira.y = Phaser.Math.Clamp(this.mira.y, 0, height);
  }

  fireGomera() {
    const camion = this.scene.camion;
    const bounds = camion.getBounds();

    const acierta = Phaser.Geom.Rectangle.Contains(bounds, this.mira.x, this.mira.y) ||
                    this.currentLane === this.scene.camionLane;

    if (acierta) {
      camion.setTint(0xff0000);
      this.scene.time.delayedCall(500, () => camion.clearTint());
      this.scene.vidasCamion -= 1;
      this.scene.textoVidasCamion.setText('Vidas Camión: ' + this.scene.vidasCamion);
      if (this.scene.vidasCamion <= 0) this.scene.scene.start('GameOver');
    }

    this.hasGomera = false;
    this.mira.setVisible(false);
  }

  giveGomera() {
    if (!this.hasGomera) {
      this.hasGomera = true;
      this.mira.setVisible(true);
      this.mira.x = this.x;
      this.mira.y = this.y - 200;
    } else {
      this.mira.setVisible(true);
    }
  }

  handleCollision(obstaculo) {
    if (this.FSM.state === 'jumping' && obstaculo.tipo === 'tomates') return;

    if (obstaculo.tipo === 'banana') {
      obstaculo.deactivate();
      let dir = 0;
      if (this.currentLane === 0) dir = 1;
      else if (this.currentLane === this.lanes.length - 1) dir = -1;
      else dir = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;

      this.currentLane += dir;
      this.x = this.lanes[this.currentLane];
      return;
    }

    if (!this.invulnerable && (obstaculo.tipo === 'caja' || obstaculo.tipo === 'tomates')) {
      this.perderVida();
    }
  }

  perderVida() {
    this.lives--;
    if (this.lives === 2) {
      this.vidasVisiblesLlenas.setVisible(false);
      this.vidasVisibles2.setVisible(true);
    } else if (this.lives === 1) {
      this.vidasVisibles2.setVisible(false);
      this.vidasVisibles1.setVisible(true);
    } else if (this.lives <= 0) {
      this.scene.scene.start('GameOver');
      return;
    }

    this.invulnerable = true;
    this.scene.tweens.add({ targets: this, alpha: 0.3, yoyo: true, repeat: 6, duration: 200 });
    this.scene.time.delayedCall(2000, () => {
      this.invulnerable = false;
      this.setAlpha(1);
    });
  }
}
