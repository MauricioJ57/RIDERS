// src/clases/Obstaculos.js
import Phaser from 'phaser';

export class Obstaculo extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setVelocityY(300);
  }

reset(x, y) {
  this.enableBody(true, x, y, true, true);

  // si estamos en el modo Versus, aumentamos la velocidad
  const velocidadBase = 300;
  const velocidadExtra = (this.scene.scene.key === 'Versus') ? 200 : 0;
  this.body.setVelocityY(velocidadBase + velocidadExtra);
}

  deactivate() {
    this.disableBody(true, true);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.y > this.scene.sys.game.config.height + 50) {
      this.deactivate();
    }
  }
}

// --- SUBCLASES ---
export class Caja extends Obstaculo {
  constructor(scene, x, y) {
    super(scene, x, y, 'caja');
    this.tipo = 'caja';
    this.setScale(1.5);
  }
}

export class Tomate extends Obstaculo {
  constructor(scene, x, y) {
    super(scene, x, y, 'tomates');
    this.tipo = 'tomates';
    this.setDisplaySize(128, 32);
    this.setScale(1.5);
  }
}

export class Banana extends Obstaculo {
  constructor(scene, x, y) {
    super(scene, x, y, 'banana');
    this.tipo = 'banana';
    this.setScale(1.5);
  }
}

// --- POWER-UP ---
export class PickupGomera extends Obstaculo {
  constructor(scene, x, y) {
    super(scene, x, y, 'gomera');
    this.tipo = 'gomera';
    this.setScale(1);
    this.play('GomeraParpadeo');
  }
}
