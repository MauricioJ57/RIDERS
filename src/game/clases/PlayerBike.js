// PlayerBike.js
import Phaser from 'phaser';
import { INPUT_ACTIONS } from '../systems/InputSystem.js';
import StateMachine from '../clases/StateMachine.js';

export default class PlayerBike extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, lanes) {
    super(scene, x, y, 'bici');

    // Asegurarse de que no quede estado viejo
    this.lives = 3;
    this.invulnerable = false;
    this.danoTween = null;
    this.setAlpha(1);

    // Animación bici con gomera (si no existe)
    if (!scene.anims.exists('biciConGomera')) {
      scene.anims.create({
        key: 'biciConGomera',
        frames: scene.anims.generateFrameNumbers('bicigomera', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
      });
    }

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;
    this.lanes = lanes;
    this.currentLane = 2;
    this.setScale(1);
    this.setCollideWorldBounds(true);
    this.play('pedalear');

    this.setSize(40, 60);

    // HUD de vidas
    const centerX = scene.scale.width / 2;
    const posY = scene.scale.height - 80;

    this.vidasVisiblesLlenas = scene.add.image(centerX, posY, 'corazones-llenos')
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);

    this.vidasVisibles2 = scene.add.image(centerX, posY, 'dos corazones')
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setVisible(false)
      .setDepth(100);

    this.vidasVisibles1 = scene.add.image(centerX, posY, 'un corazon')
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setVisible(false)
      .setDepth(100);

    // efecto de camara
    this.shakeCamera = this.scene.cameras.add(0, 0, this.scene.sys.game.config.width, this.scene.sys.game.config.height).setScroll(0, 0);

    // gomera
    this.hasGomera = false;
    this.mira = scene.add.sprite(this.x, this.y - 200, 'mira').setDepth(1).setVisible(false);

    this.estaSaltando = false;
    this.jumpTween = null;

    // FSM
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
    if (!input) return;

    // movimiento
    if (input.isJustPressed(INPUT_ACTIONS.LEFT, "player1")) this.move(-1);
    if (input.isJustPressed(INPUT_ACTIONS.RIGHT, "player1")) this.move(1);

    // salto
    const esVersus = (this.scene.scene.key === 'Versus');
    const jumperId = esVersus ? "player1" : "player2";
    const botonSalto = esVersus ? INPUT_ACTIONS.SOUTH : INPUT_ACTIONS.WEST;

    if (input.isJustPressed(botonSalto, jumperId) && this.FSM.state === 'normal' && !this.estaSaltando) {
      this.estaSaltando = true;
      const duracionSalto = esVersus ? 700 : 1000;
      const duracionTween = esVersus ? 350 : 500;

      this.FSM.transition('jumping', { duration: duracionSalto });
      this.setDepth(1);

      if (this.jumpTween) {
        this.jumpTween.remove();
        this.jumpTween = null;
        this.setScale(1);
      }

      this.jumpTween = this.scene.tweens.add({
        targets: this,
        scale: 1.5,
        duration: duracionTween,
        ease: 'Quad.easeOut',
        yoyo: true,
        hold: 80,
        onComplete: () => {
          this.setDepth(0);
          this.FSM.transition('normal');
          this.estaSaltando = false;
          this.jumpTween = null;
        }
      });
    }

    // gomera
    if (this.hasGomera) {
      if (esVersus) {
        this.mira.x = this.x;
        this.mira.y = this.y - 150;
      } else {
        this.handleMiraMovement();
      }

      const shooterId = "player1";
      const botonDisparo = esVersus ? INPUT_ACTIONS.WEST : INPUT_ACTIONS.SOUTH;

      if (this.scene.inputSystem.isJustPressed(botonDisparo, shooterId)) {
        this.fireGomera();
      }
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
    if (!camion) return;

    const bounds = camion.getBounds();
    const acierta =
      (this.mira.visible && Phaser.Geom.Rectangle.Contains(bounds, this.mira.x, this.mira.y)) ||
      this.currentLane === this.scene.camionLane;

    if (acierta) {
      camion.setTint(0xff0000);
      this.scene.time.delayedCall(500, () => camion.clearTint());

      this.scene.vidasCamion -= 1;
      if (this.scene.vidasCamion < 0) this.scene.vidasCamion = 0;

      if (this.scene.actualizarBarraVidaCamion)
        this.scene.actualizarBarraVidaCamion(this.scene.vidasCamion, this.scene.vidasCamionMax);

      // --- Victoria ---
      if (this.scene.vidasCamion <= 0 && !this.scene.gameOver) {
        this.scene.gameOver = true;
        const modo = (this.scene.scene.key === 'Versus') ? 'Versus' : 'Cooperativo';
        let payload;

        if (modo === 'Cooperativo') {
          payload = { modo, resultado: 'victoria', ganador: 'equipo' };
        } else {
          payload = { modo, resultado: 'victoria', ganador: 'bici' };
        }

        if (this.scene.puntuacion !== undefined) payload.puntaje = this.scene.puntuacion;

        this.scene.scene.start('GameOver', payload);
      }
    }

    this.hasGomera = false;
    this.mira.setVisible(false);
    this.play('pedalear');
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
    this.play('biciConGomera');
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
    } else if (this.lives <= 0 && !this.scene.gameOver) {
      this.scene.gameOver = true;
      const modo = (this.scene.scene.key === 'Versus') ? 'Versus' : 'Cooperativo';
      const payload = (modo === 'Cooperativo')
        ? { modo, resultado: 'derrota', ganador: 'ninguno' }
        : { modo, resultado: 'derrota', ganador: 'camion' };

console.log('💀 vidas bici:', this.lives, 'gameOver:', this.scene.gameOver);
console.log('Modo detectado:', this.scene.scene.key);
console.log('Payload:', payload);


      if (this.scene.puntuacion !== undefined) payload.puntaje = this.scene.puntuacion;
      this.scene.scene.start('GameOver', payload);
      return;
    }

    this.invulnerable = true;

    if (this.danoTween) {
      this.danoTween.remove();
      this.setAlpha(1);
    }

    this.danoTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      yoyo: true,
      repeat: 6,
      duration: 200,
      onComplete: () => {
        this.setAlpha(1);
        this.danoTween = null;
      }
    });

    this.shakeCamera.shake(500, 0.001);

    this.scene.time.delayedCall(2000, () => {
      this.invulnerable = false;
      this.setAlpha(1);
    });
  }

  // 🔹 Método nuevo: limpieza completa
  limpiarEfectos() {
    if (this.danoTween) {
      this.danoTween.remove();
      this.danoTween = null;
    }
    this.setAlpha(1);
    this.invulnerable = false;
  }

  // 🔹 Destruir con limpieza
  destroy(fromScene) {
    this.limpiarEfectos();
    this.mira?.destroy();
    this.vidasVisiblesLlenas?.destroy();
    this.vidasVisibles2?.destroy();
    this.vidasVisibles1?.destroy();
    super.destroy(fromScene);
  }
}
