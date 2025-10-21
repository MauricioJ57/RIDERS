// MainMenu.js
import { Scene } from 'phaser';
import InputSystem, { INPUT_ACTIONS } from '../systems/InputSystem.js';

export class MainMenu extends Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    // === Fondo ===
    this.fondoCiudad = this.add
      .tileSprite(0, 0, 2048, 1080, 'ciudad')
      .setOrigin(0)
      .setScrollFactor(0);

    this.add.image(960, 250, 'logo').setOrigin(0.5).setScale(0.7);

    // === Input ===
    this.inputSystem = new InputSystem(this.input);
    this.inputSystem.configureKeyboard({
      [INPUT_ACTIONS.UP]: [Phaser.Input.Keyboard.KeyCodes.UP],
      [INPUT_ACTIONS.DOWN]: [Phaser.Input.Keyboard.KeyCodes.DOWN],
      [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.K],
    }, 'player1');

    // === Botones ===
    const botonStyle = {
      fontFamily: 'Arial Black',
      fontSize: 24,
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 6,
      align: 'center'
    };

    const textoCoop = this.add.text(0, 0, 'COOPERATIVO', botonStyle).setOrigin(0.5);
    const imgCoop = this.add.image(0, 0, 'boton');
    const contCoop = this.add.container(960, 550, [imgCoop, textoCoop]).setSize(300, 100);

    const textoVersus = this.add.text(0, 0, 'VERSUS', botonStyle).setOrigin(0.5);
    const imgVersus = this.add.image(0, 0, 'boton');
    const contVersus = this.add.container(960, 700, [imgVersus, textoVersus]).setSize(300, 100);

    this.botones = [
      { contenedor: contCoop, escena: 'Game', tipo: 'cooperativo' },
      { contenedor: contVersus, escena: 'Versus', tipo: 'versus' }
    ];

    this.indiceSeleccionado = 0;
    this.seleccionarBoton(0, true);

    this.tutorialOpen = false;
    this.tutorialTipo = null;
  }

  seleccionarBoton(nuevoIndice, instantaneo = false) {
    const anterior = this.botones[this.indiceSeleccionado].contenedor;
    this.tweens.add({
      targets: anterior,
      scale: 1,
      duration: instantaneo ? 0 : 150,
      ease: 'Sine.easeOut'
    });

    const nuevo = this.botones[nuevoIndice].contenedor;
    this.tweens.add({
      targets: nuevo,
      scale: 1.2,
      duration: instantaneo ? 0 : 150,
      ease: 'Back.Out'
    });

    this.indiceSeleccionado = nuevoIndice;
  }

  abrirTutorial(tipo = 'cooperativo') {
    if (this.tutorialOpen) return;
    this.tutorialOpen = true;
    this.tutorialTipo = tipo;

    const { width, height } = this.scale;

    // Fondo oscuro
    this.tutorialFondo = this.add.rectangle(0, 0, width, height, 0x000000)
      .setOrigin(0)
      .setAlpha(0.9)
      .setDepth(10);

    // Contenedor
    this.tutorialContainer = this.add.container(0, 0).setDepth(11);

    // --- Título ---
    const titulo = this.add.text(width / 2, 120, 'CÓMO JUGAR', {
      fontFamily: 'Arial Black',
      fontSize: 56,
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.tutorialContainer.add(titulo);

    if (tipo === 'cooperativo') {
      this.crearTutorialCoop(width, height);
    } else {
      this.crearTutorialVersus(width, height);
    }
  }

  crearTutorialCoop(width, height) {
    const textoIntro = this.add.text(width / 2, 200,
      'Recoge la gomera para poder disparar\ny destruye el camión', {
      fontFamily: 'Arial',
      fontSize: 28,
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // --- Jugador 1 ---
    const j1x = width / 2 - 350;
    const j1Titulo = this.add.text(j1x, 320, 'JUGADOR 1', {
      fontFamily: 'Arial Black',
      fontSize: 32,
      color: '#ffffff'
    }).setOrigin(0.5);
    const j1Chico = this.add.image(j1x, 450, 'chicoRojoHud').setScale(1.2);
    const j1Control = this.add.image(j1x, 600, 'controlRojoA').setScale(1.2);
    const j1Texto = this.add.text(j1x, 680, 'MOVERSE Y DISPARAR', {
      fontFamily: 'Arial Black',
      fontSize: 24,
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // --- Jugador 2 ---
    const j2x = width / 2;
    const j2Titulo = this.add.text(j2x, 320, 'JUGADOR 2', {
      fontFamily: 'Arial Black',
      fontSize: 32,
      color: '#ffffff'
    }).setOrigin(0.5);
    const j2Chico = this.add.image(j2x, 450, 'chicoVerdeHud').setScale(1.2);
    const j2Control = this.add.image(j2x, 600, 'controlVerdeA').setScale(1.2);
    const j2Texto = this.add.text(j2x, 680, 'APUNTAR Y SALTAR', {
      fontFamily: 'Arial Black',
      fontSize: 24,
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Obstáculos
    const obsX = width / 2 + 400;
    const obsYBase = 360;
    const espaciado = 80;

    const obstaculos = [
      { key: 'caja_icon', texto: '¡ESQUIVA!' },
      { key: 'bananas_icon', texto: '¡ESQUIVA!' },
      { key: 'tomates_icon', texto: '¡SALTA!' },
      { key: 'gomera_icon', texto: '¡RECOGE!' }
    ];

    obstaculos.forEach((obs, i) => {
      const y = obsYBase + i * espaciado;
      const icono = this.add.image(obsX, y, obs.key).setScale(1);
      const texto = this.add.text(obsX + 70, y, obs.texto, {
        fontFamily: 'Arial Black',
        fontSize: 22,
        color: '#ffffff'
      }).setOrigin(0, 0.5);
      this.tutorialContainer.add([icono, texto]);
    });

    // Botón continuar
    const botonCont = this.add.image(width / 2, height - 100, 'boton').setScale(1.2);
    const textoCont = this.add.text(width / 2, height - 100, 'CONTINUAR', {
      fontFamily: 'Arial Black',
      fontSize: 28,
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.tutorialContainer.add([
      textoIntro,
      j1Titulo, j1Chico, j1Control, j1Texto,
      j2Titulo, j2Chico, j2Control, j2Texto,
      botonCont, textoCont
    ]);
  }

  crearTutorialVersus(width, height) {
    const textoIntro = this.add.text(width / 2, 200,
      'El primero que derrote a su oponente gana', {
      fontFamily: 'Arial',
      fontSize: 28,
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Jugador 1
    const j1x = width / 2 - 350;
    const j1Titulo = this.add.text(j1x, 320, 'JUGADOR 1', {
      fontFamily: 'Arial Black',
      fontSize: 32,
      color: '#ffffff'
    }).setOrigin(0.5);
    const j1Bici = this.add.image(j1x, 450, 'chicosVictoria').setScale(1.2);
    const j1Control = this.add.image(j1x, 600, 'controlRojoAX').setScale(1.2);
    const j1Texto = this.add.text(j1x, 680, 'MOVERSE, SALTAR\nY DISPARAR', {
      fontFamily: 'Arial Black',
      fontSize: 22,
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Jugador 2
    const j2x = width / 2;
    const j2Titulo = this.add.text(j2x, 320, 'JUGADOR 2', {
      fontFamily: 'Arial Black',
      fontSize: 32,
      color: '#ffffff'
    }).setOrigin(0.5);
    const j2Camion = this.add.image(j2x, 450, 'camion').setScale(0.6);
    const j2Control = this.add.image(j2x, 600, 'controlVerdeAX').setScale(1.2);
    const j2Texto = this.add.text(j2x, 680, 'ELEGIR Y LANZAR\nOBSTÁCULOS', {
      fontFamily: 'Arial Black',
      fontSize: 22,
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Obstáculos
    const obsX = width / 2 + 400;
    const obsYBase = 360;
    const espaciado = 80;

    const obstaculos = [
      { key: 'caja_icon', texto: '¡ESQUIVA!' },
      { key: 'bananas_icon', texto: '¡ESQUIVA!' },
      { key: 'tomates_icon', texto: '¡SALTA!' },
      { key: 'gomera_icon', texto: '¡RECOGE!' }
    ];

    obstaculos.forEach((obs, i) => {
      const y = obsYBase + i * espaciado;
      const icono = this.add.image(obsX, y, obs.key).setScale(1);
      const texto = this.add.text(obsX + 70, y, obs.texto, {
        fontFamily: 'Arial Black',
        fontSize: 22,
        color: '#ffffff'
      }).setOrigin(0, 0.5);
      this.tutorialContainer.add([icono, texto]);
    });

    // Botón continuar
    const botonCont = this.add.image(width / 2, height - 100, 'boton').setScale(1.2);
    const textoCont = this.add.text(width / 2, height - 100, 'CONTINUAR', {
      fontFamily: 'Arial Black',
      fontSize: 28,
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.tutorialContainer.add([
      textoIntro,
      j1Titulo, j1Bici, j1Control, j1Texto,
      j2Titulo, j2Camion, j2Control, j2Texto,
      botonCont, textoCont
    ]);
  }

  closeTutorialAndStartGame() {
    if (!this.tutorialOpen) return;
    this.tutorialContainer?.destroy(true);
    this.tutorialFondo?.destroy(true);

    const tipo = this.tutorialTipo;
    this.tutorialOpen = false;
    this.tutorialTipo = null;

    this.scene.start(tipo === 'cooperativo' ? 'Game' : 'Versus');
  }

  update() {
    if (this.fondoCiudad) this.fondoCiudad.tilePositionY -= 10;
    const input = this.inputSystem;
    if (!input) return;

    if (this.tutorialOpen) {
      if (input.isJustPressed(INPUT_ACTIONS.SOUTH, 'player1')) {
        this.closeTutorialAndStartGame();
      }
      return;
    }

    if (input.isJustPressed(INPUT_ACTIONS.UP, 'player1')) {
      this.seleccionarBoton((this.indiceSeleccionado - 1 + this.botones.length) % this.botones.length);
    }

    if (input.isJustPressed(INPUT_ACTIONS.DOWN, 'player1')) {
      this.seleccionarBoton((this.indiceSeleccionado + 1) % this.botones.length);
    }

    if (input.isJustPressed(INPUT_ACTIONS.SOUTH, 'player1')) {
      const seleccionado = this.botones[this.indiceSeleccionado];
      this.abrirTutorial(seleccionado.tipo);
    }
  }
}
