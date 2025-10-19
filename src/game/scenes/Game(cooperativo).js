import { Scene } from 'phaser';
import InputSystem, { INPUT_ACTIONS } from '../systems/InputSystem.js';
import StateMachine from '../clases/StateMachine.js';
import { Caja, Tomate, Banana, PickupGomera } from '../clases/obstaculos.js';
import PlayerBike from '../clases/PlayerBike.js';



// -----------------------------

// -----------------------------

// -----------------------------
/* CLASE PLAYER BIKE
class PlayerBike extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, lanes) {
    super(scene, x, y, 'bici');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;
    this.lanes = lanes;
    this.currentLane = 2;

    this.setScale(1);
    this.setCollideWorldBounds(true);
    this.play('pedalear');

    this.setSize(40, 60);      // ancho, alto (ajustá según tu sprite)
    //this.setOffset(10, 20);    // desplazamiento del hitbox respecto al sprite

    // === NUEVO ===
    this.lives = 3; // el jugador arranca con 3 vidas
    this.invulnerable = false;
    
    // --- COLOCACION DE IMAGENES(PUEDE OPTIMIZARSE MAS ADELANTE) ---
    this.vidasVisiblesLlenas = this.scene.add.image(1600, 16, 'corazones-llenos').setOrigin(0, 0).setScrollFactor(0);
    this.vidasVisiblesLlenas.setVisible(true);

    this.vidasVisibles2 = this.scene.add.image(1600, 16, 'dos corazones').setOrigin(0, 0).setScrollFactor(0);
    this.vidasVisibles2.setVisible(false);

    this.vidasVisibles1 = this.scene.add.image(1600, 16, 'un corazon').setOrigin(0, 0).setScrollFactor(0);
    this.vidasVisibles1.setVisible(false);

    // GOMERA
    this.hasGomera = false;

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

    // movimiento por lanes con InputSystem
    if (this.scene.inputSystem.isJustPressed(INPUT_ACTIONS.LEFT, "player1")) this.move(-1);
    if (this.scene.inputSystem.isJustPressed(INPUT_ACTIONS.RIGHT, "player1")) this.move(1);

    // salto
    if (this.scene.inputSystem.isJustPressed(INPUT_ACTIONS.WEST, "player2") && this.FSM.state === 'normal') {
      this.FSM.transition('jumping', { duration: 1000 });
      this.setScale(1.5); // efecto visual de salto
      this.scene.time.delayedCall(1000, () => { this.setScale(1); }, [], this);
      this.setDepth(1); // PONE QUE EL JUGADOR SE SOBREPONGA SOBRE LOS TOMATES
      console.log("¡Saltó!");
    }

    /* disparo normal (placeholder)
    if (this.scene.inputSystem.isJustPressed(INPUT_ACTIONS.EAST) && !this.hasGomera) {
      this.shoot();
    }

    // --------------------------
    // CONTROL DE LA GOMERA + MIRA
    // --------------------------
    if (this.hasGomera) {
      this.handleMiraMovement();

      if (this.scene.inputSystem.isJustPressed(INPUT_ACTIONS.EAST, "player1")) {
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
    console.log("Disparó la bici (placeholder proyectil)!");
  }

  // --- Movimiento de la mira con WASD ---
  handleMiraMovement() {
    const speed = 5;
    if (this.scene.inputSystem.isPressed(INPUT_ACTIONS.LEFT, "player2")) this.mira.x -= speed;
    if (this.scene.inputSystem.isPressed(INPUT_ACTIONS.RIGHT, "player2")) this.mira.x += speed;
    if (this.scene.inputSystem.isPressed(INPUT_ACTIONS.UP, "player2")) this.mira.y -= speed;
    if (this.scene.inputSystem.isPressed(INPUT_ACTIONS.DOWN, "player2")) this.mira.y += speed;

    const { width, height } = this.scene.sys.game.config;
    this.mira.x = Phaser.Math.Clamp(this.mira.x, 0, width);
    this.mira.y = Phaser.Math.Clamp(this.mira.y, 0, height);
  }

  // --- Disparo de la gomera ---
  fireGomera() {
    const camion = this.scene.camion;
    const bounds = camion.getBounds();
    if (Phaser.Geom.Rectangle.Contains(bounds, this.mira.x, this.mira.y)) {
      console.log("¡Le pegó al camión!");
      this.scene.camion.setTint(0xff0000);
      this.colorCamion = this.scene.time.addEvent({
        delay: 500,
        callback: () => { this.scene.camion.clearTint(); },
        callbackScope: this,
        loop: false
      });
      this.scene.vidasCamion -= 1;
      this.scene.textoVidasCamion.setText('Vidas Camión: ' + this.scene.vidasCamion);
      if (this.scene.vidasCamion <= 0) {
        console.log("¡Camión destruido!");
        this.scene.scene.start('GameOver');
      }
    } else {
      console.log("Falló el disparo...");
    }
    this.hasGomera = false;
    this.mira.setVisible(false);
  }

  // --- Cuando agarra el power-up de gomera ---
giveGomera() {
  if (!this.hasGomera) {
    // Solo posiciona la mira si todavía no tenía gomera
    this.hasGomera = true;
    this.mira.setVisible(true);
    this.mira.x = this.x;
    this.mira.y = this.y - 200;
  } else {
    // Si ya tenía, solo reactiva la visibilidad (por si estaba oculta)
    this.mira.setVisible(true);
  }
}

 handleCollision(obstaculo) {
    if (this.FSM.state === 'jumping' && obstaculo.tipo === 'tomates') {
      console.log("Saltó los tomates!");
      return;
    }

    // === BANANA: sigue igual que antes ===
    if (obstaculo.tipo === 'banana') {
      console.log("Pisó una banana, se desliza!");
      obstaculo.deactivate();

      let direction;
      if (this.currentLane === 0) {
        direction = 1;
      } else if (this.currentLane === this.lanes.length - 1) {
        direction = -1;
      } else {
        direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
      }

      const newLane = this.currentLane + direction;
      this.currentLane = newLane;
      this.x = this.lanes[this.currentLane];
      console.log(`Se deslizó al carril ${this.currentLane}`);
      return;
    }

    // === CAJA o TOMATE: daño ===
    if (!this.invulnerable && (obstaculo.tipo === 'caja' || obstaculo.tipo === 'tomates')) {
      this.perderVida();
    }
  }

   perderVida() {
    this.lives--;
    console.log(`Perdió una vida. Vidas restantes: ${this.lives}`);
    
    // --- ELIMINACION Y COLOCACION DE IMAGENES(PUEDE OPTIMIZARSE MAS ADELANTE)
    if (this.lives === 2) {
      this.vidasVisiblesLlenas.setVisible(false);
      this.vidasVisibles2.setVisible(true);
    }

    if (this.lives === 1) {
      this.vidasVisibles2.setVisible(false);
      this.vidasVisibles1.setVisible(true);
    }

    if (this.lives <= 0) {
      console.log("Sin vidas — Game Over");
      this.scene.gameOver = true;
      this.scene.scene.start('GameOver');
      return;
    }

    // Activar invulnerabilidad
    this.invulnerable = true;

    // (Opcional) efecto visual de parpadeo
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      yoyo: true,
      repeat: 6,
      duration: 200
    });

    // Desactivar invulnerabilidad después de 2 segundos
    this.scene.time.delayedCall(2000, () => {
      this.invulnerable = false;
      this.setAlpha(1);
      console.log("Invulnerabilidad terminada");
    });
}
}
*/

// -----------------------------
// ESCENA PRINCIPAL
export class Game extends Scene {
  constructor() {
    super('Game');
  }

  create() {

    this.lastSpawnTime = 0;
    this.spawnCooldown = 800; // milisegundos de espera entre spawns (0.5 segundos)


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
    this.vidasCamion = 6;
    this.textoVidasCamion = this.add.text(960, 16, 'Vidas Camión: ' + this.vidasCamion, { fontFamily: "arial", fontSize: '32px', fill: '#000000ff' }).setOrigin(0.5, 0);

    // InputSystem
    this.inputSystem = new InputSystem(this.input);
    this.inputSystem.configureKeyboard({
      //[INPUT_ACTIONS.NORTH]: [Phaser.Input.Keyboard.KeyCodes.W],
      //[INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.S],
      [INPUT_ACTIONS.EAST]: [Phaser.Input.Keyboard.KeyCodes.K],
      [INPUT_ACTIONS.WEST]: [Phaser.Input.Keyboard.KeyCodes.L],
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
      [INPUT_ACTIONS.WEST]: [Phaser.Input.Keyboard.KeyCodes.SPACE],
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

  this.anims.create({
  key: 'pedalear',
  frames: this.anims.generateFrameNumbers('bici', { start: 0, end: 1 }), // depende de cuántos frames tengas
  frameRate: 10,
  repeat: -1
});

  // CAMIÓN
  this.camionLane = 2;
  this.camion = this.physics.add.sprite(this.lanes[this.camionLane], offsetY - 10, 'camion');
  this.camion.setScale(0.9);

  
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

      // --- 🧠 Nueva lógica de separación inteligente ---
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

    // --- MOVIMIENTO DE LA CIUDAD ---
    if (this.fondoCiudad) {
      this.fondoCiudad.tilePositionY -= 10; // ESTO AJUSTA LA VELOCIDAD DEL FONDO
    }
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
