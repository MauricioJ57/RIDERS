import { Scene } from 'phaser';

// -----------------------------
// CLASE STATE MACHINE
class StateMachine {
  constructor(initial, possibleStates, context) {
    this.initial = initial;
    this.possibleStates = possibleStates;
    this.context = context;
    this.state = null;
  }

  step() {
    if (!this.state) {
      this.state = this.initial;
      this.possibleStates[this.state].enter?.call(this.context);
    }
    this.possibleStates[this.state].execute?.call(this.context);
  }

  transition(newState) {
    if (this.state === newState) return;
    this.possibleStates[this.state].exit?.call(this.context);
    this.state = newState;
    this.possibleStates[this.state].enter?.call(this.context);
  }
}

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
    this.setDisplaySize(128, 32); 
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
    const marginX = 200;
    const laneCount = 5;
    const laneWidth = (gameWidth - marginX * 2) / laneCount;

    this.lanes = [];
    for (let i = 0; i < laneCount; i++) {
      this.lanes.push(marginX + laneWidth / 2 + i * laneWidth);
    }

    // Dibujar líneas divisorias
    for (let i = 1; i < laneCount; i++) {
      const lineX = marginX + i * laneWidth;
      this.add.rectangle(lineX, gameHeight / 2, 2, gameHeight, 0x000000).setOrigin(0.5);
    }

    // Fondo de la calle
    this.add.rectangle(
      gameWidth / 2,
      gameHeight / 2,
      gameWidth - marginX * 2,
      gameHeight,
      0x444444,
      0.3
    ).setDepth(-1);

    // --- Jugador ---
    this.currentLane = 2;
    this.player = this.physics.add.sprite(this.lanes[this.currentLane], 600, 'bici');
    this.player.setCollideWorldBounds(true);

    // --- Camión ---
    this.camionLane = 2;
    this.camion = this.physics.add.sprite(this.lanes[this.camionLane], 100, 'camion');
    this.camion.setScale(4);

    // --- Controles ---
    this.cursors = this.input.keyboard.createCursorKeys();

    // --- Grupo de obstáculos ---
    this.obstaculos = this.add.group();

    // --- Colisiones ---
    this.physics.add.overlap(this.obstaculos, this.player, this.onPlayerHit, null, this);

// --- State Machine del Camión ---
this.camionFSM = new StateMachine('idle', {
  idle: {
    enter: () => { this.camionTimer = 0; },
    execute: () => {
      this.camionTimer++;
      if (this.camionTimer > 60) { // 1 seg aprox a 60fps
        const choice = Phaser.Math.Between(0, 2);
        if (choice === 0) this.camionFSM.transition('move');
        else if (choice === 1) this.camionFSM.transition('drop');
        else this.camionFSM.transition('pattern');
      }
    },
    exit: () => {}
  },

  move: {
    enter: () => {
      const dir = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
      this.moveCamion(dir);
      this.camionFSM.transition('idle');
    },
    execute: () => {},
    exit: () => {}
  },

  drop: {
    enter: () => {
      this.soltarObstaculo();
      this.camionFSM.transition('idle');
    },
    execute: () => {},
    exit: () => {}
  },

  pattern: {
    enter: () => {
      // Ejemplo de patrón: carril 0 → caja, carril 1 → caja, carril 3 → tomate
      this.patron = [
        { lane: 0, tipo: Caja },
        { lane: 1, tipo: Caja },
        { lane: 3, tipo: Tomate }
      ];
      this.patronIndex = 0;
    },
    execute: () => {
      if (this.patronIndex < this.patron.length) {
        const paso = this.patron[this.patronIndex];

        // Si no está en el carril correcto → moverse
        if (this.camionLane !== paso.lane) {
          if (this.camionLane < paso.lane) this.moveCamion(1);
          else this.moveCamion(-1);
        } else {
          // Ya está en el carril correcto → soltar obstáculo
          const obstaculo = new paso.tipo(this, this.camion.x, this.camion.y + 40);
          this.obstaculos.add(obstaculo);
          this.patronIndex++;
        }
      } else {
        this.camionFSM.transition('idle');
      }
    },
    exit: () => { this.patron = null; }
  }
}, this);
  }
  update() {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.movePlayer(-1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.movePlayer(1);
    }

    // Actualizar FSM del camión
    this.camionFSM.step();
  }

  // -----------------------------
  movePlayer(direction) {
    const newLane = this.currentLane + direction;
    if (newLane >= 0 && newLane < this.lanes.length) {
      this.currentLane = newLane;
      this.player.x = this.lanes[this.currentLane];
    }
  }

  moveCamion(direction) {
    const newLane = this.camionLane + direction;
    if (newLane >= 0 && newLane < this.lanes.length) {
      this.camionLane = newLane;
      this.camion.x = this.lanes[this.camionLane];
    }
  }

  soltarObstaculo() {
    let tipo = Phaser.Math.RND.pick([Caja, Tomate, Banana]);
    let x = this.camion.x;

    if (tipo === Tomate) {
      if (this.camionLane === 0) x = this.lanes[1];
      else if (this.camionLane === this.lanes.length - 1) x = this.lanes[this.lanes.length - 2];
    }

    const obstaculo = new tipo(this, x, this.camion.y + 40);
    this.obstaculos.add(obstaculo);
  }

  onPlayerHit(obstaculo, player) {
    console.log(`El jugador fue golpeado por un ${obstaculo.tipo}`);
    obstaculo.destroy();
  }
}
