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
    this.setVelocityY(200);
  }

  // reset cuando se reutiliza desde el pool
  reset(x, y) {
    this.enableBody(true, x, y, true, true);
    this.setVelocityY(200);
  }

  // cuando desaparece (colisión o fuera de pantalla)
  deactivate() {
    this.disableBody(true, true);
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

    const gameWidth = 1024;
    const gameHeight = 768;

    const marginX = 200;
    const laneCount = 5;
    const laneWidth = (gameWidth - marginX * 2) / laneCount;

    this.lanes = [];
    for (let i = 0; i < laneCount; i++) {
      this.lanes.push(marginX + laneWidth / 2 + i * laneWidth);
    }

    // líneas divisorias
    for (let i = 1; i < laneCount; i++) {
      const lineX = marginX + i * laneWidth;
      this.add.rectangle(lineX, gameHeight / 2, 2, gameHeight, 0x000000).setOrigin(0.5);
    }

    // fondo de la calle
    this.add.rectangle(
      gameWidth / 2,
      gameHeight / 2,
      gameWidth - marginX * 2,
      gameHeight,
      0x444444,
      0.3
    ).setDepth(-1);

    // jugador
    this.currentLane = 2;
    this.player = this.physics.add.sprite(this.lanes[this.currentLane], 600, 'bici');
    this.player.setCollideWorldBounds(true);

    // camión
    this.camionLane = 2;
    this.camion = this.physics.add.sprite(this.lanes[this.camionLane], 100, 'camion');
    this.camion.setScale(4);

    // controles
    this.cursors = this.input.keyboard.createCursorKeys();

    // -----------------------------
    // POOLS DE OBSTÁCULOS
    this.poolCajas = this.physics.add.group({
      classType: Caja,
      maxSize: 20,
      runChildUpdate: false
    });

    this.poolTomates = this.physics.add.group({
      classType: Tomate,
      maxSize: 10,
      runChildUpdate: false
    });

    this.poolBananas = this.physics.add.group({
      classType: Banana,
      maxSize: 20,
      runChildUpdate: false
    });

    // colisiones
    this.physics.add.overlap(this.poolCajas, this.player, this.onPlayerHit, null, this);
    this.physics.add.overlap(this.poolTomates, this.player, this.onPlayerHit, null, this);
    this.physics.add.overlap(this.poolBananas, this.player, this.onPlayerHit, null, this);

    // FSM del camión
    this.camionFSM = new StateMachine('idle', {
      idle: {
        enter: () => { this.camionTimer = 0; },
        execute: () => {
          this.camionTimer++;
          if (this.camionTimer > 60) {
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
        }
      },

      drop: {
        enter: () => {
          this.soltarObstaculo();
          this.camionFSM.transition('idle');
        }
      },

      pattern: {
        enter: () => {
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
            if (this.camionLane !== paso.lane) {
              if (this.camionLane < paso.lane) this.moveCamion(1);
              else this.moveCamion(-1);
            } else {
              this.spawnObstaculo(paso.tipo, this.camion.x, this.camion.y + 40);
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

  // Spawner centralizado
  spawnObstaculo(Tipo, x, y) {
    let pool;
    if (Tipo === Caja) pool = this.poolCajas;
    else if (Tipo === Tomate) pool = this.poolTomates;
    else if (Tipo === Banana) pool = this.poolBananas;

    const obstaculo = pool.get(x, y);
    if (obstaculo) obstaculo.reset(x, y);
  }

  soltarObstaculo() {
    const tipo = Phaser.Math.RND.pick([Caja, Tomate, Banana]);
    let x = this.camion.x;

    if (tipo === Tomate) {
      if (this.camionLane === 0) x = this.lanes[1];
      else if (this.camionLane === this.lanes.length - 1) x = this.lanes[this.lanes.length - 2];
    }

    this.spawnObstaculo(tipo, x, this.camion.y + 40);
  }

  // -----------------------------
  onPlayerHit(player, obstaculo) {
    console.log(`El jugador fue golpeado por un ${obstaculo.tipo}`);
    obstaculo.deactivate(); // vuelve al pool
  }
}
