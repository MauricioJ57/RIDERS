import { Scene } from 'phaser';
import InputSystem, { INPUT_ACTIONS } from '../systems/InputSystem.js';
import PlayerBike from '../clases/PlayerBike.js';
import PlayerCamionVersus from '../clases/PlayerCamionVersus.js';
import { Caja, Tomate, Banana, PickupGomera } from '../clases/obstaculos.js';

// ==========================
// ESCENA VERSUS
// ==========================
export class Versus extends Scene {
  constructor() {
    super('Versus');
  }


  crearBarraVidaCamion(maxVidas) {
  this.vidasCamion = maxVidas;
  this.vidasCamionMax = maxVidas;

  const barWidth = 300;
  const barHeight = 25;
  const posX = 960;
  const posY = 40;

  // Fondo
  this.barraFondo = this.add.rectangle(posX, posY, barWidth, barHeight, 0x000000).setOrigin(0.5);

  // Barra de vida
  this.barraVida = this.add.rectangle(posX - barWidth / 2, posY, barWidth, barHeight, 0xff0000)
    .setOrigin(0, 0.5);

  // Borde
  this.barraBorde = this.add.rectangle(posX, posY, barWidth + 4, barHeight + 4)
    .setStrokeStyle(2, 0xffffff)
    .setOrigin(0.5);
}

actualizarBarraVidaCamion(vidas, vidasMax) {
  const barWidth = 300;
  const porcentaje = Phaser.Math.Clamp(vidas / vidasMax, 0, 1);
  this.barraVida.width = barWidth * porcentaje;
}


  create() {
    // Fondo
    this.fondoCiudad = this.add.tileSprite(0, 0, 2048, 1536, 'ciudad').setOrigin(0, 0);

          this.anims.create({
  key: 'pedalear',
  frames: this.anims.generateFrameNumbers('bici', { start: 0, end: 1 }), // depende de cuántos frames tengas
  frameRate: 10,
  repeat: -1
});

    this.anims.create({
      key: 'GomeraParpadeo',
      frames: this.anims.generateFrameNumbers('gomera', { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1
    });    



    // Sistema de input
    this.inputSystem = new InputSystem(this.input);

    // Controles jugador 1 (bici)
    this.inputSystem.configureKeyboard({
      [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.LEFT],
      [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.RIGHT],
      [INPUT_ACTIONS.WEST]: [Phaser.Input.Keyboard.KeyCodes.K],
      //[INPUT_ACTIONS.EAST]: [Phaser.Input.Keyboard.KeyCodes.K],
      //[INPUT_ACTIONS.NORTH]: [Phaser.Input.Keyboard.KeyCodes.UP],
      [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.SPACE]
    }, "player1");

    // Controles jugador 2 (camión)
    this.inputSystem.configureKeyboard({
      [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.A],
      [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.D],
      [INPUT_ACTIONS.UP]: [Phaser.Input.Keyboard.KeyCodes.W],
      [INPUT_ACTIONS.DOWN]: [Phaser.Input.Keyboard.KeyCodes.S],
      [INPUT_ACTIONS.WEST]: [Phaser.Input.Keyboard.KeyCodes.F],
      //[INPUT_ACTIONS.EAST]: [Phaser.Input.Keyboard.KeyCodes.E]
      [INPUT_ACTIONS.NORTH]: [Phaser.Input.Keyboard.KeyCodes.G]
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

    // Jugador 2 (camión)
    this.player2 = new PlayerCamionVersus(this, this.lanes[2], offsetY -10 , this.lanes);

    this.camion = this.player2;
    this.camionLane = this.player2.currentLane;


    // Grupos de obstáculos
    this.poolCajas = this.physics.add.group({ classType: Caja, maxSize: 20, runChildUpdate: true });
    this.poolTomates = this.physics.add.group({ classType: Tomate, maxSize: 10, runChildUpdate: true });
    this.poolBananas = this.physics.add.group({ classType: Banana, maxSize: 20, runChildUpdate: true });

    // Colisiones básicas
    this.physics.add.overlap(this.player1, this.poolCajas, (p, o) => p.handleCollision(o));
    this.physics.add.overlap(this.player1, this.poolTomates, (p, o) => p.handleCollision(o));
    this.physics.add.overlap(this.player1, this.poolBananas, (p, o) => p.handleCollision(o));

        // --- GOMERAS ---
    this.poolGomeras = this.physics.add.group({ classType: PickupGomera, maxSize: 5, runChildUpdate: true });

    // Colisión: cuando el jugador 1 (bici) agarra la gomera
    this.physics.add.overlap(this.player1, this.poolGomeras, (player, gomera) => {
      gomera.deactivate();
      player.giveGomera();
      console.log("¡Jugador 1 agarró la gomera!");

});

   // --- Spawner de gomeras por tiempo ---
    this.scheduleNextGomera();

   // Barra de vida del camión
  this.crearBarraVidaCamion(8);


  }

  update() {
    if (this.player1) this.player1.update();         // Jugador 1: bici
    if (this.player2) this.player2.update();         // Jugador 2: camión
    this.fondoCiudad.tilePositionY -= 10;

    this.camionLane = this.player2.currentLane;

  }


spawnObstaculo(Tipo, x, y) {
  let pool;

  if (Tipo === Caja) pool = this.poolCajas;
  else if (Tipo === Tomate) pool = this.poolTomates;
  else if (Tipo === Banana) pool = this.poolBananas;
  else if (Tipo === PickupGomera) pool = this.poolGomeras; 

  if (!pool) {
    console.warn("No se encontró un pool para el tipo:", Tipo.name);
    return;
  }

  // --- Corrección para tomates en bordes ---
  let spawnX = x;
  const laneIndex = this.lanes.indexOf(x);

  if (Tipo === Tomate) {
    // si está en el primer lane, empuja un poco a la derecha
    if (laneIndex === 0) spawnX = this.lanes[1];
    // si está en el último lane, empuja un poco a la izquierda
    else if (laneIndex === this.lanes.length - 1) spawnX = this.lanes[this.lanes.length - 2];
  }

  const obj = pool.get(spawnX, y);
  if (obj) obj.reset(spawnX, y);
}

  scheduleNextGomera() {
  const delay = Phaser.Math.Between(8000, 12000); // cada 8–12 segundos
  this.time.delayedCall(delay, () => {
    const lane = Phaser.Math.Between(0, this.lanes.length - 1);
    this.spawnObstaculo(PickupGomera, this.lanes[lane], 0);
    this.scheduleNextGomera();
  });
}

}
