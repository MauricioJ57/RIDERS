import { Scene } from 'phaser';
import InputSystem, { INPUT_ACTIONS } from '../systems/InputSystem.js';
import PlayerBike from '../clases/PlayerBike.js';
import PlayerCamionVersus from '../clases/PlayerCamionVersus.js';
import { Caja, Tomate, Banana } from '../clases/obstaculos.js';

// ==========================
// ESCENA VERSUS
// ==========================
export class Versus extends Scene {
  constructor() {
    super('Versus');
  }

  create() {
    // Fondo
    this.fondoCiudad = this.add.tileSprite(0, 0, 2048, 1536, 'ciudad').setOrigin(0, 0);

    // Sistema de input
    this.inputSystem = new InputSystem(this.input);

    // Controles jugador 1 (bici)
    this.inputSystem.configureKeyboard({
      [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.LEFT],
      [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.RIGHT],
      [INPUT_ACTIONS.WEST]: [Phaser.Input.Keyboard.KeyCodes.SPACE],
      [INPUT_ACTIONS.EAST]: [Phaser.Input.Keyboard.KeyCodes.K]
    }, "player1");

    // Controles jugador 2 (camión)
    this.inputSystem.configureKeyboard({
      [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.A],
      [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.D],
      [INPUT_ACTIONS.UP]: [Phaser.Input.Keyboard.KeyCodes.W],
      [INPUT_ACTIONS.DOWN]: [Phaser.Input.Keyboard.KeyCodes.S],
      [INPUT_ACTIONS.WEST]: [Phaser.Input.Keyboard.KeyCodes.F],
      [INPUT_ACTIONS.EAST]: [Phaser.Input.Keyboard.KeyCodes.E]
    }, "player2");

    // === Lanes (mismo cálculo que el modo cooperativo) ===
    const gameWidth = 1024;
    const gameHeight = 768;
    const screenWidth = this.sys.game.config.width;
    const screenHeight = this.sys.game.config.height;

    // offset para centrar visualmente el área jugable
    const offsetX = (screenWidth - gameWidth) / 2;
    const offsetY = (screenHeight - gameHeight) / 2;

    const marginX = 200;
    const laneCount = 5;
    const laneWidth = (gameWidth - marginX * 2) / laneCount;

    this.lanes = [];
    for (let i = 0; i < laneCount; i++) {
      this.lanes.push(offsetX + marginX + laneWidth / 2 + i * laneWidth);
    }

    // Jugador 1 (bici)
    this.player1 = new PlayerBike(this, this.lanes[2], offsetY + 700, this.lanes);

    // Crear UI de slots antes del camión
    this.slotText = this.add.text(960, 32, '', { fontSize: '24px', fill: '#000' }).setOrigin(0.5);

    // Jugador 2 (camión)
    this.player2 = new PlayerCamionVersus(this, this.lanes[2], offsetY -10 , this.lanes);

    // Grupos de obstáculos
    this.poolCajas = this.physics.add.group({ classType: Caja, maxSize: 20, runChildUpdate: true });
    this.poolTomates = this.physics.add.group({ classType: Tomate, maxSize: 10, runChildUpdate: true });
    this.poolBananas = this.physics.add.group({ classType: Banana, maxSize: 20, runChildUpdate: true });

    // Colisiones básicas
    this.physics.add.overlap(this.player1, this.poolCajas, (p, o) => p.handleCollision(o));
    this.physics.add.overlap(this.player1, this.poolTomates, (p, o) => p.handleCollision(o));
    this.physics.add.overlap(this.player1, this.poolBananas, (p, o) => p.handleCollision(o));

    
  // --- INTRO: mostrar solo player + fondo durante 3s ---
  this.introRunning = true;

  // texto de tutorial
  this.textoIntroduccion = this.add.text(960, 100, 'COMO JUGAR', {fontFamily: "arial", fontSize: '32px', fill: '#ffffffff'}).setOrigin(0.5,0).setDepth(3);

  // imagen inicial de tutorial
  this.tutorial = this.add.rectangle(960, 540, 1700, 1000, 0x000000).setAlpha(0.9).setDepth(2);

  this.fondoTransparente = this.add.rectangle(960, 540, 2000, 1200, 0x000000).setAlpha(0.5).setDepth(1);

  // Texto de cuenta atrás
  this.countdownValue = 10;
  this.countdownText = this.add.text(this.sys.game.config.width/2, this.sys.game.config.height/2, String(this.countdownValue), {
    fontFamily: 'Arial',
    fontSize: '96px',
    color: '#ffffff'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(10);

  // Evento que actualiza la cuenta atrás cada segundo
  this.countdownEvent = this.time.addEvent({
    delay: 1000,
    repeat: this.countdownValue - 1,
    callback: () => {
      this.countdownValue -= 1;
      if (this.countdownValue > 0) {
        this.countdownText.setText(String(this.countdownValue));
      }
    }
  });

  // Evitar que se programen gomeras antes de terminar la intro
  this._scheduleGomeraPending = true;
  // Ejecutar función que termina la intro en 10s
  this.time.delayedCall(10000, this.startGameplay, [], this);

  }

  update() {
    if (this.player1) this.player1.update();         // Jugador 1: bici
    if (this.player2) this.player2.update();         // Jugador 2: camión
    this.fondoCiudad.tilePositionY -= 10;
    
    if (this.introRunning) {
      // Durante la intro no ejecutamos la lógica de juego
      return;
    }
  }

  updateSlotUI(selected, slots) {
    const str = slots.map((s, i) =>
      (i === selected ? `[${s ? s.tipo.name.toUpperCase() : '-'}]` : `${s ? s.tipo.name.toUpperCase() : '-'}`)
    ).join(' ');
    if (this.slotText) this.slotText.setText(`Slots: ${str}`);
  }

  spawnObstaculo(Tipo, x, y) {
    let pool;
    if (Tipo === Caja) pool = this.poolCajas;
    else if (Tipo === Tomate) pool = this.poolTomates;
    else if (Tipo === Banana) pool = this.poolBananas;

    const obj = pool.get(x, y);
    if (obj) obj.reset(x, y);
  }

  startGameplay() {
    this.introRunning = false;
    // Mostrar elementos ocultos

    // Quitar texto de cuenta atrás si existe
    if (this.countdownText) {
      this.countdownText.setVisible(false);
      this.countdownText.destroy();
      this.countdownText = null;
    }
    if (this.countdownEvent) {
      this.tutorial.setVisible(false)
      this.fondoCiudad.setAlpha(1);
      this.fondoTransparente.setVisible(false);
    }
    if (this.countdownEvent) {
      this.countdownEvent.remove(false);
      this.countdownEvent = null;
    }
  }
}
