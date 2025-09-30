import Bici from "../clases/bici.js";
import Camion from "../clases/camion.js";
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
    this.setScale(2);
  }
}

class Tomate extends Obstaculo {
  constructor(scene, x, y) {
    super(scene, x, y, 'tomates');
    this.tipo = 'tomates';
    this.setDisplaySize(128, 32); // ocupa más ancho
    this.setScale(2.5);
  }
}

class Banana extends Obstaculo {
  constructor(scene, x, y) {
    super(scene, x, y, 'banana');
    this.tipo = 'banana';
    this.setScale(2);
  }
}

class Piedra extends Obstaculo {
  constructor(scene, x, y) {
    super(scene, x, y, 'piedra');
    this.tipo = 'piedra';
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

    // --- Resolución ---
    const gameWidth = 1024;
    const gameHeight = 768;

// --- Márgenes y carriles ---
const marginX = 200; // veredas más grandes
const laneCount = 5;
const laneWidth = (gameWidth - marginX * 2) / laneCount;

// calcular centros de carriles
this.lanes = [];
for (let i = 0; i < laneCount; i++) {
  this.lanes.push(marginX + laneWidth / 2 + i * laneWidth);
}

// --- Dibujar líneas divisorias ---
for (let i = 1; i < laneCount; i++) {
  const lineX = marginX + i * laneWidth;
  this.add.rectangle(lineX, gameHeight / 2, 2, gameHeight, 0x000000).setOrigin(0.5);
}

// --- Rectángulo de la calle (opcional, sin colisión) ---
this.add.rectangle(
  gameWidth / 2,
  gameHeight / 2,
  gameWidth - marginX * 2,
  gameHeight,
  0x444444,
  0.3 // alpha, transparente
).setDepth(-1);

    // --- Jugador ---
    this.currentLane = 2; // empieza en el del medio
    this.player = new Bici(this, this.lanes[this.currentLane], 600, 'bici');
    this.player.setScale(4);

    // --- Mira ---
    this.mira = this.add.sprite(this.player.x, this.player.y - 500, 'mira');
    this.mira.setDepth(1); // encima de todo
    
    // --- Estado de la piedra ---
    this.hasPiedra = false;

    // --- Disparo ---
    this.input.keyboard.on('keydown-SPACE',() => {  
      if (this.hasPiedra) {
        const piedra = this.physics.add.sprite(this.player.x, this.player.y - 50, 'piedra');
        piedra.setVelocityY(-300);
        this.hasPiedra = false;
      }
    });

    // --- Controles de la mira ---
    this.input.on('pointermove', (pointer) => {
      // mover mira horizontalmente con el ratón
      this.mira.x = Phaser.Math.Clamp(pointer.x, marginX, gameWidth - marginX);
      // alinear jugador con la mira
      let closestLane = 0;
      let minDist = Math.abs(this.lanes[0] - this.mira.x);
      for (let i = 1; i < this.lanes.length; i++) {
        const dist = Math.abs(this.lanes[i] - this.mira.x);
        if (dist < minDist) {
          minDist = dist;
          closestLane = i;
        }
      }
    });

    // --- Camión ---
    this.camionLane = 2;
    this.camion = this.physics.add.sprite(this.lanes[this.camionLane], 100, 'camion');
    this.camion.setScale(6);

    // --- Controles ---
    this.cursors = this.input.keyboard.createCursorKeys();

    // --- Grupo de obstáculos ---
    this.obstaculos = this.add.group();

    // --- Colisiones ---
    this.physics.add.overlap(this.obstaculos, this.player, this.onPlayerHit, null, this);

    // --- IA del camión ---
    this.time.addEvent({
      delay: 1000, // cada segundo decide qué hacer
      callback: this.camionAI,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    // --- Movimiento del jugador ---
    this.player.mover(this.cursors);
    // --- IA del camión ---
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
  let tipo = Phaser.Math.RND.pick([Caja, Tomate, Banana, Piedra]);

  if (tipo === Tomate) {
    // casos borde
    if (this.camionLane === 0) {
      // primer carril → arrancar desde carril 1
      var x = this.lanes[1]; 
    } else if (this.camionLane === this.lanes.length - 1) {
      // último carril → centrar en carril 3
      var x = this.lanes[this.lanes.length - 2]; 
    } else {
      // cualquier otro carril → normal
      var x = this.camion.x;
    }
    var obstaculo = new Tomate(this, x, this.camion.y + 40);
  } else {
    // resto de obstáculos
    var obstaculo = new tipo(this, this.camion.x, this.camion.y + 40);
  }

  this.obstaculos.add(obstaculo);
}

  // -----------------------------
  // Colisiones
  onPlayerHit(obstaculo, player) {
    if (obstaculo.tipo === 'piedra') {
      // recoger piedra
      this.hasPiedra = true;
      console.log('se ha recogido una piedra.');
    } else {
      // chocar con otro obstáculo
      console.log(`¡Has chocado con una ${obstaculo.tipo}!`);
    }
    obstaculo.destroy();
  }
}
