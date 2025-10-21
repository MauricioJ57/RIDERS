import { Scene } from 'phaser';
import InputSystem, { INPUT_ACTIONS } from '../systems/InputSystem.js';
import StateMachine from '../clases/StateMachine.js';
import { Caja, Tomate, Banana, PickupGomera } from '../clases/obstaculos.js';
import PlayerBike from '../clases/PlayerBike.js';

// ESCENA PRINCIPAL
export class Game extends Scene {
  constructor() {
    super('Game');
  }

crearBarraVidaCamion(maxVidas) {
  this.vidasCamion = maxVidas;
  this.vidasCamionMax = maxVidas;

  const barWidth = 300;
  const barHeight = 25;
  const posX = 960; // centrada arriba
  const posY = 40;

  // Fondo negro
  this.barraFondo = this.add.rectangle(posX, posY, barWidth, barHeight, 0x000000).setOrigin(0.5);
  this.barraFondo.setDepth(10);

  // Barra roja (vida)
  this.barraVida = this.add.rectangle(posX - barWidth / 2, posY, barWidth, barHeight, 0xff0000)
    .setOrigin(0, 0.5);
  this.barraVida.setDepth(10);

  // Borde blanco
  this.barraBorde = this.add.rectangle(posX, posY, barWidth + 4, barHeight + 4)
    .setStrokeStyle(2, 0xffffff)
    .setOrigin(0.5);
  this.barraBorde.setDepth(10);
}

actualizarBarraVidaCamion(vidas, vidasMax) {
  const barWidth = 300;
  const porcentaje = Phaser.Math.Clamp(vidas / vidasMax, 0, 1);
  this.barraVida.width = barWidth * porcentaje;
}


  create() {

    this.lastSpawnTime = 0;
    this.spawnCooldown = 800; // milisegundos de espera entre spawns (0.5 segundos)

      this.anims.create({
  key: 'pedalear',
  frames: this.anims.generateFrameNumbers('bici', { start: 0, end: 1 }), // depende de cuántos frames tengas
  frameRate: 10,
  repeat: -1
});



    // --- CONDICION DE GAME OVER ---
    this.gameOver = false;

    this.fondoCiudad = this.add.tileSprite(0, 0, 2048, 1536, 'ciudad').setOrigin(0, 0);


    // --- PUNTUACION ---
    this.puntuacion = 0;

    this.textoPuntuacion = this.add.text(16, 16, 'Puntuación: ' + this.puntuacion, {
       fontFamily: "arial", 
       fontSize: '40px', 
       fill: '#ffffffff',
       strokeThickness: 2 
      });

    this.puntuacionPorTiempo = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.puntuacion += 10;
        this.textoPuntuacion.setText('Puntuación: ' + this.puntuacion);
      },
      callbackScope: this,
      loop: true
    });

    // --- VIDAS DEL CAMION ---
    this.crearBarraVidaCamion(6);

    // InputSystem
    this.inputSystem = new InputSystem(this.input);
    this.inputSystem.configureKeyboard({
      //[INPUT_ACTIONS.NORTH]: [Phaser.Input.Keyboard.KeyCodes.W],
      [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.SPACE],
      //[INPUT_ACTIONS.EAST]: [Phaser.Input.Keyboard.KeyCodes.K],
      [INPUT_ACTIONS.WEST]: [Phaser.Input.Keyboard.KeyCodes.K],
      [INPUT_ACTIONS.UP]: [Phaser.Input.Keyboard.KeyCodes.UP],
      [INPUT_ACTIONS.DOWN]: [Phaser.Input.Keyboard.KeyCodes.DOWN],
      [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.LEFT],
      [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.RIGHT],
    },
      "player1"
    );

    this.inputSystem.configureKeyboard({
      //[INPUT_ACTIONS.NORTH]: [Phaser.Input.Keyboard.KeyCodes.W],
      //[INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.S],
      [INPUT_ACTIONS.EAST]: [Phaser.Input.Keyboard.KeyCodes.F],
      [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.SPACE],
      [INPUT_ACTIONS.UP]: [Phaser.Input.Keyboard.KeyCodes.W],
      [INPUT_ACTIONS.DOWN]: [Phaser.Input.Keyboard.KeyCodes.S],
      [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.A],
      [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.D],
    },
      "player2"
    );



this.cameras.main.setBackgroundColor(0x00ff00);

  // tamaño lógico del gameplay (lo mantenemos igual)
  const gameWidth = 1024;
  const gameHeight = 768;

  // tamaño real del canvas
  const screenWidth = this.sys.game.config.width;
  const screenHeight = this.sys.game.config.height;

  // offset para centrar
  const offsetX = (screenWidth - gameWidth) / 2;
  const offsetY = (screenHeight - gameHeight) / 2;

  const marginX = 200;
  const laneCount = 5;
  const laneWidth = (gameWidth - marginX * 2) / laneCount;

  this.lanes = [];
  for (let i = 0; i < laneCount; i++) {
    this.lanes.push(offsetX + marginX + laneWidth / 2 + i * laneWidth);
  }

  // líneas divisorias
  for (let i = 1; i < laneCount; i++) {
    const lineX = offsetX + marginX + i * laneWidth;
    this.add.rectangle(lineX, offsetY + gameHeight / 2, 2, gameHeight, 0x000000).setOrigin(0.5);
  }

  // fondo de la calle
  this.add.rectangle(
    offsetX + gameWidth / 2,
    offsetY + gameHeight / 2,
    gameWidth - marginX * 2,
    gameHeight,
    0x444444,
    0.3
  ).setDepth(-1);

  // PLAYER
  this.player = new PlayerBike(this, this.lanes[2], offsetY + 700, this.lanes);

  // CAMIÓN
  this.camionLane = 2;
  this.camion = this.physics.add.sprite(this.lanes[this.camionLane], offsetY - 10, 'camion');
  this.camion.setScale(0.9);

  // --- Efecto de vibración del camión ---
this.tweens.add({
  targets: this.camion,
  y: this.camion.y + 2,
  duration: 100,
  yoyo: true,
  repeat: -1,
  ease: 'Sine.easeInOut'
});

// ======================
// HUD DE COOPERATIVO
// ======================

// --- Jugador 1 (izquierda) ---
const margen = 40;
const baseY = this.scale.height - 150; // altura general

// Imagen del jugador 1
const jugador1Img = this.add.image(margen + 120, baseY, 'chicoRojoHud')
  .setOrigin(0.5, 0.5)
  .setScale(1.4)
  .setScrollFactor(0)
  .setDepth(50);

// Controles jugador 1 (por ejemplo WASD o flechas)
const controles1Img = this.add.image(jugador1Img.x + 180, baseY, 'controlRojoA')
  .setOrigin(0.5)
  .setScale(1.2)
  .setScrollFactor(0)
  .setDepth(50);

// Texto sobre las acciones del jugador 1
const texto1 = this.add.text(jugador1Img.x + 90, baseY - 150,
  'Jugador 1\nMoverse y Disparar',
  {
    fontFamily: 'Arial Black',
    fontSize: '28px',
    color: '#ffffff',
    align: 'center',
    stroke: '#000000',
    strokeThickness: 5
  })
  .setOrigin(0.5)
  .setScrollFactor(0)
  .setDepth(50);


// --- Jugador 2 (derecha) ---

const jugador2Img = this.add.image(this.scale.width - (margen + 120), baseY, 'chicoVerdeHud')
  .setOrigin(0.5, 0.5)
  .setScale(1.4)
  .setScrollFactor(0)
  .setDepth(50);

// Controles jugador 2 (por ejemplo joystick 2 o flechas)
const controles2Img = this.add.image(jugador2Img.x - 180, baseY, 'controlVerdeA')
  .setOrigin(0.5)
  .setScale(1.2)
  .setScrollFactor(0)
  .setDepth(50);

// Texto sobre las acciones del jugador 2
const texto2 = this.add.text(jugador2Img.x - 90, baseY - 150,
  'Jugador 2\nApunta y Salta',
  {
    fontFamily: 'Arial Black',
    fontSize: '28px',
    color: '#ffffff',
    align: 'center',
    stroke: '#000000',
    strokeThickness: 5
  })
  .setOrigin(0.5)
  .setScrollFactor(0)
  .setDepth(50);



  
    // pools de obstáculos...
    this.poolCajas = this.physics.add.group({ classType: Caja, maxSize: 20, runChildUpdate: true });
    this.poolTomates = this.physics.add.group({ classType: Tomate, maxSize: 10, runChildUpdate: true });
    this.poolBananas = this.physics.add.group({ classType: Banana, maxSize: 20, runChildUpdate: true });

    // --- GOMERAS ---
    this.poolGomeras = this.physics.add.group({ classType: PickupGomera, maxSize: 5, runChildUpdate: true });
    this.physics.add.overlap(this.player, this.poolGomeras, (player, gomera) => {
      gomera.deactivate();
      this.player.giveGomera();
      console.log("¡Agarró la gomera!");
      this.gomerasRecogidas++;
    });
    this.scheduleNextGomera();
    this.anims.create({
      key: 'GomeraParpadeo',
      frames: this.anims.generateFrameNumbers('gomera', { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1
    });    

    // colisiones
    this.physics.add.overlap(this.player, this.poolCajas, (p, o) => this.player.handleCollision(o));
    this.physics.add.overlap(this.player, this.poolTomates, (p, o) => this.player.handleCollision(o));
    this.physics.add.overlap(this.player, this.poolBananas, (p, o) => this.player.handleCollision(o));

    // FSM del camión...
    this.camionFSM = new StateMachine('idle', {
      idle: {
        enter: () => { this.camionTimer = 0; },
        execute: () => {
          this.camionTimer++;
          if (this.camionTimer > 40) {
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
          const now = this.time.now;
          if (now - this.lastSpawnTime >= this.spawnCooldown) {
            this.soltarObstaculo();
            this.lastSpawnTime = now;
          }
          this.camionFSM.transition('idle');
        }
      },
      pattern: {
        enter: () => {
      const patrones = [
        // Patrón original de ejemplo
        [
          { lane: 0, tipo: Caja },
          { lane: 1, tipo: Caja },
          { lane: 3, tipo: Tomate }
        ],

        // Patrón 1: Combo de reflejos
        [
          { lane: 0, tipo: Caja },
          { lane: 2, tipo: Caja },
          { lane: 3, tipo: Tomate }
        ],

        // Patrón 2: Banana trampa
        [
          { lane: 1, tipo: Banana },
          { lane: 2, tipo: Caja },
          { lane: 3, tipo: Banana }
        ],

        // Patrón 3: Muralla
        [
          { lane: 2, tipo: Tomate },
          { lane: 4, tipo: Caja },
          { lane: 0, tipo: Caja }
        ],

        // Patrón 4: Zigzag de cajas
        [
          { lane: 1, tipo: Caja },
          { lane: 2, tipo: Caja },
          { lane: 3, tipo: Caja }
        ],

        // Patrón 5: Deslizamiento fatal
        [
          { lane: 2, tipo: Banana },
          { lane: 3, tipo: Caja },
          { lane: 1, tipo: Tomate }
        ],

        // Patrón 6: Triple amenaza
        [
          { lane: 0, tipo: Caja },
          { lane: 2, tipo: Tomate },
          { lane: 4, tipo: Banana }
        ],

        // Patrón 7: Finta del camión
        [
          { lane: 1, tipo: Tomate },
          { lane: 4, tipo: Banana },
          { lane: 3, tipo: Caja }
        ],

        // Patrón 8: Carril falso
        [
          { lane: 0, tipo: Caja },
          { lane: 0, tipo: Banana },
          { lane: 2, tipo: Tomate }
        ],

        // 9. Zig-zag agresivo
        [
          { lane: 0, tipo: Caja },
          { lane: 1, tipo: Banana },
          { lane: 2, tipo: Caja },
          { lane: 3, tipo: Banana },
          { lane: 2, tipo: Caja },
          { lane: 1, tipo: Banana },
          { lane: 0, tipo: Caja }
        ],

        // 10. Muro de cajas + salto central
        [
          { lane: 0, tipo: Caja },
          { lane: 1, tipo: Caja },
          { lane: 2, tipo: Tomate },
          { lane: 3, tipo: Caja },
          { lane: 4, tipo: Caja }
        ],

        // 11. Combo banana y tomates (caos)
        [
          { lane: 0, tipo: Banana },
          { lane: 1, tipo: Tomate },
          { lane: 3, tipo: Banana },
          { lane: 4, tipo: Tomate }
        ],

        // 12. Línea de cajas con distracción
        [
          { lane: 1, tipo: Caja },
          { lane: 2, tipo: Caja },
          { lane: 3, tipo: Caja },
          { lane: 0, tipo: Banana },
          { lane: 4, tipo: Banana }
        ],

        // 13. Tomate en el medio y bordes molestos
        [
          { lane: 0, tipo: Banana },
          { lane: 2, tipo: Tomate },
          { lane: 4, tipo: Caja }
        ],

        // 14. Ataque diagonal
        [
          { lane: 0, tipo: Caja },
          { lane: 1, tipo: Banana },
          { lane: 2, tipo: Caja },
          { lane: 3, tipo: Tomate }
        ],

        // 15. Pared + distracción
        [
          { lane: 0, tipo: Caja },
          { lane: 1, tipo: Caja },
          { lane: 2, tipo: Caja },
          { lane: 3, tipo: Tomate }
        ],

        // 16. Caos total
        [
          { lane: 0, tipo: Banana },
          { lane: 1, tipo: Caja },
          { lane: 2, tipo: Banana },
          { lane: 3, tipo: Caja },
          { lane: 4, tipo: Tomate }
        ],

        // 17. Doble banana deslizante
        [
          { lane: 1, tipo: Banana },
          { lane: 2, tipo: Caja },
          { lane: 3, tipo: Banana },
          { lane: 4, tipo: Caja }
        ],

        // 18. Doble tomate + distracción
        [
          { lane: 0, tipo: Tomate },
          { lane: 3, tipo: Tomate },
          { lane: 2, tipo: Banana }
        ],

        // 19. Muro mixto final
        [
          { lane: 0, tipo: Caja },
          { lane: 1, tipo: Banana },
          { lane: 2, tipo: Tomate },
          { lane: 3, tipo: Banana },
          { lane: 4, tipo: Caja }
        ]
      ];

      // Elegir patrón al azar
      this.patron = Phaser.Utils.Array.GetRandom(patrones);

      // Corrige tomates en bordes
for (let paso of this.patron) {
  if (paso.tipo === Tomate) {
    if (paso.lane === 0) paso.lane = 1;
    if (paso.lane === 4) paso.lane = 3;
  }
}


      this.patronIndex = 0;
      this.patternTimer = 0;
      this.patternDelay = 10;
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
      this.spawnObstaculo(paso.tipo, this.camion.x, this.camion.y + 120);

      // --- Nueva lógica de separación inteligente ---
      const pasoActual = this.patron[this.patronIndex];
      const pasoSiguiente = this.patron[this.patronIndex + 1];

      if (pasoSiguiente) {
        // Detectar si los lanes se "superponen" por tamaño del tomate
        const ocupaMismoLane =
          pasoSiguiente.lane === pasoActual.lane ||
          (pasoActual.tipo === Tomate &&
            Math.abs(pasoSiguiente.lane - pasoActual.lane) <= 1) ||
          (pasoSiguiente.tipo === Tomate &&
            Math.abs(pasoSiguiente.lane - pasoActual.lane) <= 1);

        if (ocupaMismoLane) {
          this.patternDelay = 20; // más tiempo si se superponen
        } else {
          this.patternDelay = 10; // ritmo normal
        }
      }
      // ----------------------------------------------

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
    //this.inputSystem.update(); // refresca InputSystem
    this.player.update();
    this.camionFSM.step();

    this.fondoCiudad.tilePositionY -= 10;

  }

  moveCamion(direction) {
    const newLane = this.camionLane + direction;
    if (newLane >= 0 && newLane < this.lanes.length) {
      this.camionLane = newLane;
      this.camion.x = this.lanes[this.camionLane];
    }
  }

spawnObstaculo(Tipo, x, y) {
  // Chequeo: evitar spawnear encima de una gomera activa ===
  const hayGomeraCerca = this.poolGomeras.getChildren().some(g => 
    g.active && Math.abs(g.x - x) < 80 && Math.abs(g.y - y) < 150
  );

  if (hayGomeraCerca) {
    // Podés simplemente no spawnear (descartar este obstáculo)
    console.log("Evita spawnear obstáculo sobre una gomera");
    return;
  }

  // === Obtener el pool correcto según tipo ===
  let pool;
  if (Tipo === Caja) pool = this.poolCajas;
  else if (Tipo === Tomate) pool = this.poolTomates;
  else if (Tipo === Banana) pool = this.poolBananas;
  else if (Tipo === PickupGomera) pool = this.poolGomeras;

  // === Spawnear el obstáculo normalmente ===
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
    this.spawnObstaculo(tipo, x, this.camion.y + 120);
  }

  // --- Spawner de gomeras por tiempo ---
  scheduleNextGomera() {
    const delay = Phaser.Math.Between(5000, 10000); // 5–10s
    this.time.delayedCall(delay, () => {
      const lane = Phaser.Math.Between(0, this.lanes.length - 1);
      this.spawnObstaculo(PickupGomera, this.lanes[lane], 0);
      this.scheduleNextGomera();
    });
  }
}
