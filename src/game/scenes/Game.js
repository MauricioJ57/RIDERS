import { Scene } from 'phaser';

// -----------------------------
// CLASE STATE MACHINE GENÉRICA
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

  transition(newState, data) {
    if (this.state === newState) return;
    this.possibleStates[this.state].exit?.call(this.context);
    this.state = newState;
    this.possibleStates[this.state].enter?.call(this.context, data);
  }
}

// -----------------------------
// OBSTÁCULOS
class Obstaculo extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setVelocityY(200);
  }

  reset(x, y) {
    this.enableBody(true, x, y, true, true);
    this.setVelocityY(200);
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
// POWER-UP: GOMERA
class PickupGomera extends Obstaculo {
  constructor(scene, x, y) {
    super(scene, x, y, 'gomera');
    this.tipo = 'gomera';
    this.setScale(2);
  }
}

// -----------------------------
// CLASE PLAYER BIKE
class PlayerBike extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, lanes) {
    super(scene, x, y, 'bici');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;
    this.lanes = lanes;
    this.currentLane = 2;

    this.setScale(3);
    this.setCollideWorldBounds(true);

    // GOMERA
    this.hasGomera = false;

    // INPUT
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.jumpKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.shootKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.aimKeys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      fire: Phaser.Input.Keyboard.KeyCodes.F
    });

    // MIRA (oculta al inicio)
    this.mira = scene.add.sprite(this.x, this.y - 200, 'mira');
    this.mira.setDepth(1);
    this.mira.setVisible(false);

    // STATE MACHINE
    this.FSM = new StateMachine('normal', {
      normal: {
        enter: () => {},
        execute: () => {},
        exit: () => {}
      },
      jumping: {
        enter: (data) => {
          this.jumpUntil = this.scene.time.now + data.duration;
        },
        execute: () => {
          if (this.scene.time.now > this.jumpUntil) {
            this.FSM.transition('normal');
          }
        },
        exit: () => { this.jumpUntil = null; }
      }
    }, this);
  }

  update() {
    this.FSM.step();

    // movimiento por lanes
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) this.move(-1);
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) this.move(1);

    // salto
    if (Phaser.Input.Keyboard.JustDown(this.jumpKey) && this.FSM.state === 'normal') {
      this.FSM.transition('jumping', { duration: 1000 });
      console.log("¡Saltó!");
    }

    // disparo normal (si tenés otra mecánica con SHIFT)
    if (Phaser.Input.Keyboard.JustDown(this.shootKey) && this.hasGomera === false) {
      this.shoot();
    }

    // --------------------------
    // CONTROL DE LA GOMERA + MIRA
    // --------------------------
    if (this.hasGomera) {
      this.handleMiraMovement();

      if (Phaser.Input.Keyboard.JustDown(this.aimKeys.fire)) {
        this.fireGomera();
      }
    }
  }

  move(direction) {
    const newLane = this.currentLane + direction;
    if (newLane >= 0 && newLane < this.lanes.length) {
      this.currentLane = newLane;
      this.x = this.lanes[this.currentLane];
    }
  }

  shoot() {
    console.log("Disparó la gomera (placeholder proyectil)!");
  }

  // --- Movimiento de la mira con WASD ---
  handleMiraMovement() {
    const speed = 5;
    if (this.aimKeys.left.isDown) this.mira.x -= speed;
    if (this.aimKeys.right.isDown) this.mira.x += speed;
    if (this.aimKeys.up.isDown) this.mira.y -= speed;
    if (this.aimKeys.down.isDown) this.mira.y += speed;

    // límites dentro de la pantalla
    const { width, height } = this.scene.sys.game.config;
    this.mira.x = Phaser.Math.Clamp(this.mira.x, 0, width);
    this.mira.y = Phaser.Math.Clamp(this.mira.y, 0, height);
  }

  // --- Disparo de la gomera ---
  fireGomera() {
    const camion = this.scene.camion;

    // chequeo simple: ¿está la mira dentro del área del camión?
    const bounds = camion.getBounds();
    if (Phaser.Geom.Rectangle.Contains(bounds, this.mira.x, this.mira.y)) {
      console.log("¡Le pegó al camión!");
    } else {
      console.log("Falló el disparo...");
    }

    // reset estado
    this.hasGomera = false;
    this.mira.setVisible(false);
  }

  // --- Cuando agarra el power-up de gomera ---
  giveGomera() {
    this.hasGomera = true;
    this.mira.setVisible(true);
    this.mira.x = this.x;       // aparece cerca del jugador
    this.mira.y = this.y - 200; // un poco arriba
  }

  handleCollision(obstaculo) {
    if (this.FSM.state === 'jumping' && obstaculo.tipo === 'tomates') {
      console.log("Saltó los tomates!");
      return;
    }
    console.log(`Golpeado por ${obstaculo.tipo}`);
    obstaculo.deactivate();
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

    // PLAYER
    this.player = new PlayerBike(this, this.lanes[2], 600, this.lanes);

    // CAMIÓN
    this.camionLane = 2;
    this.camion = this.physics.add.sprite(this.lanes[this.camionLane], 100, 'camion');
    this.camion.setScale(4);

    // OBSTÁCULOS
    this.poolCajas = this.physics.add.group({
      classType: Caja,
      maxSize: 20,
      runChildUpdate: true
    });
    this.poolTomates = this.physics.add.group({
      classType: Tomate,
      maxSize: 10,
      runChildUpdate: true
    });
    this.poolBananas = this.physics.add.group({
      classType: Banana,
      maxSize: 20,
      runChildUpdate: true
    });

    // --- GOMERAS ---
    this.poolGomeras = this.physics.add.group({
      classType: PickupGomera,
      maxSize: 5,
      runChildUpdate: true
    });
    this.physics.add.overlap(this.player, this.poolGomeras, (player, gomera) => {
      gomera.deactivate();
      this.player.giveGomera();
      console.log("¡Agarró la gomera!");
    });
    this.scheduleNextGomera();

    // COLISIONES
    this.physics.add.overlap(this.player, this.poolCajas, (player, obstaculo) => {
      this.player.handleCollision(obstaculo);
    });
    this.physics.add.overlap(this.player, this.poolTomates, (player, obstaculo) => {
      this.player.handleCollision(obstaculo);
    });
    this.physics.add.overlap(this.player, this.poolBananas, (player, obstaculo) => {
      this.player.handleCollision(obstaculo);
    });

    // STATE MACHINE DEL CAMIÓN (igual que antes)
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
        }
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
          this.patternTimer = 0;
          this.patternDelay = 15;
          this.targetLane = this.patron[0].lane;
        },
        execute: () => {
          this.patternTimer++;
          if (this.patternTimer >= this.patternDelay) {
            this.patternTimer = 0;
            if (this.camionLane !== this.targetLane) {
              if (this.camionLane < this.targetLane) this.moveCamion(1);
              else this.moveCamion(-1);
            } else {
              const paso = this.patron[this.patronIndex];
              this.spawnObstaculo(paso.tipo, this.camion.x, this.camion.y + 40);
              this.patronIndex++;
              if (this.patronIndex < this.patron.length) {
                this.targetLane = this.patron[this.patronIndex].lane;
              } else {
                this.camionFSM.transition('idle');
              }
            }
          }
        },
        exit: () => { this.patron = null; }
      }
    }, this);
  }

  update() {
    this.player.update();
    this.camionFSM.step();
  }

  moveCamion(direction) {
    const newLane = this.camionLane + direction;
    if (newLane >= 0 && newLane < this.lanes.length) {
      this.camionLane = newLane;
      this.camion.x = this.lanes[this.camionLane];
    }
  }

  spawnObstaculo(Tipo, x, y) {
    let pool;
    if (Tipo === Caja) pool = this.poolCajas;
    else if (Tipo === Tomate) pool = this.poolTomates;
    else if (Tipo === Banana) pool = this.poolBananas;
    else if (Tipo === PickupGomera) pool = this.poolGomeras;

    const obj = pool.get(x, y);
    if (obj) obj.reset(x, y);
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

  // --- Spawner de gomeras por tiempo ---
  scheduleNextGomera() {
    const delay = Phaser.Math.Between(10000, 20000); // 10–20s
    this.time.delayedCall(delay, () => {
      const lane = Phaser.Math.Between(0, this.lanes.length - 1);
      this.spawnObstaculo(PickupGomera, this.lanes[lane], 0);
      this.scheduleNextGomera(); // programar el próximo
    });
  }
}
