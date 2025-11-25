// src/game/scenes/Game.js
import { Scene } from 'phaser';
import InputSystem, { INPUT_ACTIONS } from '../systems/InputSystem.js';
import PlayerBike from '../clases/PlayerBike.js';
import { Caja, Tomate, Banana, PickupGomera } from '../clases/obstaculos.js';
import { crearFondoTriple } from '../utils/crearFondoTriple.js';
import CamionFSM from '../systems/CamionFSM.js';
import AudioManager from '../systems/AudioManager.js';
import HUDCoop from '../ui/HUDCoop.js';

export class Game extends Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.lastSpawnTime = 0;
    this.spawnCooldown = 800;

    AudioManager.playMusic(this, 'musica_juego', 0.3);

    this.sonidoCamion = this.sound.add('sfx_camionMotor', { volume: 0.3, loop: true });
    this.sonidoCamion.play();

    this.anims.create({
      key: 'pedalear',
      frames: this.anims.generateFrameNumbers('bici', { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1
    });

    this.fondo = crearFondoTriple(this, {
      xCalle: this.scale.width / 2 - 50,
      anchoCalle: 1028,
      velocidad: 8
    });

    // HUD
    this.hud = new HUDCoop(this, 6);
    this.actualizarBarraVidaCamion = (...a) => this.hud.actualizarBarraVidaCamion(...a);
    this.actualizarVidasBici = (v) => this.hud.actualizarVidasBici(v);

    // Inputs
    this.inputSystem = new InputSystem(this.input);
    this.inputSystem.configureKeyboard(
      {
        [INPUT_ACTIONS.SOUTH]: [32],
        [INPUT_ACTIONS.WEST]: [75],
        [INPUT_ACTIONS.UP]: [38],
        [INPUT_ACTIONS.DOWN]: [40],
        [INPUT_ACTIONS.LEFT]: [37],
        [INPUT_ACTIONS.RIGHT]: [39]
      },
      'player1'
    );

    this.inputSystem.configureKeyboard(
      {
        [INPUT_ACTIONS.EAST]: [70],
        [INPUT_ACTIONS.SOUTH]: [32],
        [INPUT_ACTIONS.UP]: [87],
        [INPUT_ACTIONS.DOWN]: [83],
        [INPUT_ACTIONS.LEFT]: [65],
        [INPUT_ACTIONS.RIGHT]: [68]
      },
      'player2'
    );

    // lanes
    const gameWidth = 1024;
    const gameHeight = 768;
    const offsetX = (this.sys.game.config.width - gameWidth) / 2;
    const offsetY = (this.sys.game.config.height - gameHeight) / 2;

    const marginX = 200;
    const laneWidth = (gameWidth - marginX * 2) / 5;
    this.lanes = Array.from({ length: 5 }, (_, i) => offsetX + marginX + laneWidth / 2 + i * laneWidth);

    // jugador
    this.player = new PlayerBike(this, this.lanes[2], offsetY + 700, this.lanes);

    // camión
    this.camionLane = 2;
    this.camion = this.physics.add.sprite(this.lanes[2], offsetY - 10, 'camion').setScale(0.9);

    this.tweens.add({
      targets: this.camion,
      y: this.camion.y + 2,
      duration: 100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Pools
    this.poolCajas = this.physics.add.group({ classType: Caja, maxSize: 20, runChildUpdate: true });
    this.poolTomates = this.physics.add.group({ classType: Tomate, maxSize: 10, runChildUpdate: true });
    this.poolBananas = this.physics.add.group({ classType: Banana, maxSize: 20, runChildUpdate: true });
    this.poolGomeras = this.physics.add.group({ classType: PickupGomera, maxSize: 5, runChildUpdate: true });

    this.physics.add.overlap(this.player, this.poolCajas, (p, o) => p.handleCollision(o));
    this.physics.add.overlap(this.player, this.poolTomates, (p, o) => p.handleCollision(o));
    this.physics.add.overlap(this.player, this.poolBananas, (p, o) => p.handleCollision(o));

    this.physics.add.overlap(this.player, this.poolGomeras, (player, gomera) => {
      gomera.deactivate();
      this.player.giveGomera();
    });

    this.scheduleNextGomera();

    // FSM
    this.camionFSM = new CamionFSM(this);
  }

  update() {
    this.player.update();
    this.camionFSM.step();
    this.fondo.update();
  }

  moveCamion(dir) {
    const nl = this.camionLane + dir;
    if (nl >= 0 && nl < this.lanes.length) {
      this.camionLane = nl;
      this.camion.x = this.lanes[nl];
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
      else if (this.camionLane === 4) x = this.lanes[3];
    }

    this.spawnObstaculo(tipo, x, this.camion.y + 120);
  }

  scheduleNextGomera() {
    const delay = Phaser.Math.Between(5000, 10000);
    this.time.delayedCall(delay, () => {
      const lane = Phaser.Math.Between(0, this.lanes.length - 1);
      this.spawnObstaculo(PickupGomera, this.lanes[lane], 0);
      this.scheduleNextGomera();
    });
  }
}
