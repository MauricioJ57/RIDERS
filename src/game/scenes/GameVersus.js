import { Scene } from "phaser";
import InputSystem, { INPUT_ACTIONS } from "../systems/InputSystem.js";
import PlayerBike from "../clases/PlayerBike.js";
import PlayerCamionVersus from "../clases/PlayerCamionVersus.js";
import { Caja, Tomate, Banana, PickupGomera } from "../clases/obstaculos.js";
import { crearFondoTriple } from "../utils/crearFondoTriple.js";
import AudioManager from "../systems/AudioManager.js";

import HUDVersus from "../ui/HUDVersus.js";   // 👈 NUEVO!

export class Versus extends Scene {
  constructor() {
    super("Versus");
  }

  create() {
    this.gameOver = false;

    AudioManager.playMusic(this, "musica_juego", 0.3);

    this.sonidoCamion = this.sound.add("sfx_camionMotor", {
      volume: 0.3,
      loop: true
    });
    this.sonidoCamion.play();

    this.fondo = crearFondoTriple(this, {
      xCalle: this.scale.width / 2 - 50,
      anchoCalle: 1028,
      velocidad: 8
    });

    // Animaciones
    this.anims.create({
      key: "pedalear",
      frames: this.anims.generateFrameNumbers("bici", { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: "GomeraParpadeo",
      frames: this.anims.generateFrameNumbers("gomera", { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1
    });

    // INPUT
    this.inputSystem = new InputSystem(this.input);

    this.inputSystem.configureKeyboard({
      [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.LEFT],
      [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.RIGHT],
      [INPUT_ACTIONS.WEST]: [Phaser.Input.Keyboard.KeyCodes.K],
      [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.SPACE]
    }, "player1");

    // jugador 2
    this.inputSystem.configureKeyboard({
      [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.A],
      [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.D],
      [INPUT_ACTIONS.UP]: [Phaser.Input.Keyboard.KeyCodes.W],
      [INPUT_ACTIONS.DOWN]: [Phaser.Input.Keyboard.KeyCodes.S],
      [INPUT_ACTIONS.WEST]: [Phaser.Input.Keyboard.KeyCodes.F],
      [INPUT_ACTIONS.NORTH]: [Phaser.Input.Keyboard.KeyCodes.G]
    }, "player2");

    // Lanes
    const gameWidth = 1024;
    const gameHeight = 768;
    const screenWidth = this.sys.game.config.width;
    const screenHeight = this.sys.game.config.height;

    const offsetX = (screenWidth - gameWidth) / 2;
    const offsetY = (screenHeight - gameHeight) / 2;

    const marginX = 200;
    const laneCount = 5;
    const laneWidth = (gameWidth - marginX * 2) / laneCount;

    this.lanes = [];
    for (let i = 0; i < laneCount; i++) {
      this.lanes.push(offsetX + marginX + laneWidth / 2 + i * laneWidth);
    }

    // Players
    this.player1 = new PlayerBike(this, this.lanes[2], offsetY + 700, this.lanes);
    this.player2 = new PlayerCamionVersus(this, this.lanes[2], offsetY - 10, this.lanes);

    this.camion = this.player2;
    this.camionLane = this.player2.currentLane;

    // === UI ===
    this.hud = new HUDVersus(this, 6, 3);

    this.actualizarBarraVidaCamion = (vidas, max) => {
      this.hud.actualizarBarraVidaCamion(vidas, max);
    };

    this.actualizarVidasBici = (vidas) => {
      this.hud.actualizarVidasBici(vidas);
    };

    // Obstáculos
    this.poolCajas = this.physics.add.group({ classType: Caja, maxSize: 20 });
    this.poolTomates = this.physics.add.group({ classType: Tomate, maxSize: 10 });
    this.poolBananas = this.physics.add.group({ classType: Banana, maxSize: 20 });

    this.physics.add.overlap(this.player1, this.poolCajas, (p, o) => p.handleCollision(o));
    this.physics.add.overlap(this.player1, this.poolTomates, (p, o) => p.handleCollision(o));
    this.physics.add.overlap(this.player1, this.poolBananas, (p, o) => p.handleCollision(o));

    // Gomeras
    this.poolGomeras = this.physics.add.group({ classType: PickupGomera, maxSize: 5 });
    this.physics.add.overlap(this.player1, this.poolGomeras, (player, gomera) => {
      gomera.deactivate();
      player.giveGomera();
    });

    this.scheduleNextGomera();
  }

  update() {
    this.player1.update();
    this.player2.update();
    this.fondo.update();

    this.camionLane = this.player2.currentLane;
  }

  spawnObstaculo(Tipo, x, y) {
    let pool;

    if (Tipo === Caja) pool = this.poolCajas;
    else if (Tipo === Tomate) pool = this.poolTomates;
    else if (Tipo === Banana) pool = this.poolBananas;
    else if (Tipo === PickupGomera) pool = this.poolGomeras;

    if (!pool) return;

    let spawnX = x;
    const laneIndex = this.lanes.indexOf(x);

    if (Tipo === Tomate) {
      if (laneIndex === 0) spawnX = this.lanes[1];
      else if (laneIndex === this.lanes.length - 1) spawnX = this.lanes[this.lanes.length - 2];
    }

    const obj = pool.get(spawnX, y);
    if (obj) obj.reset(spawnX, y);
  }

  scheduleNextGomera() {
    const delay = Phaser.Math.Between(8000, 12000);
    this.time.delayedCall(delay, () => {
      const lane = Phaser.Math.Between(0, this.lanes.length - 1);
      this.spawnObstaculo(PickupGomera, this.lanes[lane], 0);
      this.scheduleNextGomera();
    });
  }
}
