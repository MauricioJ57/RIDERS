import { Scene } from 'phaser';

// -----------------------------
// CLASES DE OBSTÁCULOS
class Obstaculo extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setVelocityY(200); // velocidad base de caída
  }
}

class Caja extends Obstaculo {
  constructor(scene, x, y) {
    super(scene, x, y, 'caja');
    this.tipo = 'caja';
  }
}

class Tomate extends Obstaculo {
  constructor(scene, x, y) {
    super(scene, x, y, 'tomate');
    this.tipo = 'tomate';
  }
}

class Banana extends Obstaculo {
  constructor(scene, x, y) {
    super(scene, x, y, 'banana');
    this.tipo = 'banana';
  }
}

// -----------------------------
// ESCENA PRINCIPAL
export class Game extends Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x00ff00);

    //-- Carriles (x)
    this.lanes = [200, 350, 500, 650, 800];

    //-- Jugador
    this.currentLane = 2;
    this.player = this.physics.add.sprite(this.lanes[this.currentLane], 600, 'bici');
    this.player.setCollideWorldBounds(true);

    //-- Camión
    this.camionLane = 2;
    this.camion = this.physics.add.sprite(this.lanes[this.camionLane], 100, 'camion');
    this.camion.setScale(4);

    //-- Controles
    this.cursors = this.input.keyboard.createCursorKeys();

    //-- Grupo de obstáculos
    this.obstaculos = this.add.group();

    //-- Colisiones
    this.physics.add.overlap(this.obstaculos, this.player, this.onPlayerHit, null, this);

    //-- IA del camión
    this.time.addEvent({
      delay: 1000, // cada segundo decide qué hacer
      callback: this.camionAI,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.movePlayer(-1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.movePlayer(1);
    }
  }

  // -----------------------------
  // Movimiento jugador
  movePlayer(direction) {
    const newLane = this.currentLane + direction;
    if (newLane >= 0 && newLane < this.lanes.length) {
      this.currentLane = newLane;
      this.player.x = this.lanes[this.currentLane];
    }
  }

  // -----------------------------
  // IA del camión
  camionAI() {
    const action = Phaser.Math.Between(0, 2); // 0 = mover izq, 1 = mover der, 2 = soltar obstáculo

    if (action === 0) this.moveCamion(-1);
    else if (action === 1) this.moveCamion(1);
    else this.soltarObstaculo();
  }

  moveCamion(direction) {
    const newLane = this.camionLane + direction;
    if (newLane >= 0 && newLane < this.lanes.length) {
      this.camionLane = newLane;
      this.camion.x = this.lanes[this.camionLane];
    }
  }

  soltarObstaculo() {
    const tipo = Phaser.Math.RND.pick([Caja, Tomate, Banana]); // random
    const obstaculo = new tipo(this, this.camion.x, this.camion.y + 40);
    this.obstaculos.add(obstaculo);
  }

  // -----------------------------
  // Colisiones
  onPlayerHit(obstaculo, player) {
    console.log(`El jugador fue golpeado por un ${obstaculo.tipo}`);
    obstaculo.destroy(); // el obstáculo desaparece, pero el jugador sigue
  }
}
