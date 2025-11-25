import { Scene } from "phaser";
import InputSystem, { INPUT_ACTIONS } from "../systems/InputSystem.js";
import { crearFondoTriple } from "../utils/crearFondoTriple.js";
import AudioManager from "../systems/AudioManager.js";

import MenuButtons from "../ui/MenuButtons.js";
import { crearTutorialCoop } from "../ui/TutorialCoop.js";
import { crearTutorialVersus } from "../ui/TutorialVersus.js";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    AudioManager.playMusic(this, "musica_menu", 0.5);

    this.fondo = crearFondoTriple(this, {
      xCalle: this.scale.width / 2 - 50,
      anchoCalle: 1028,
      velocidad: 8
    });

    this.add.image(960, 250, "logo").setOrigin(0.5).setScale(0.7);

    // Input
    this.inputSystem = new InputSystem(this.input);
    this.inputSystem.configureKeyboard(
      {
        [INPUT_ACTIONS.UP]: [Phaser.Input.Keyboard.KeyCodes.UP],
        [INPUT_ACTIONS.DOWN]: [Phaser.Input.Keyboard.KeyCodes.DOWN],
        [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.K]
      },
      "player1"
    );

    // Botones
    this.menu = new MenuButtons(this);

    this.menu.crearBoton(960, 550, "COOPERATIVO", "Game", "cooperativo");
    this.menu.crearBoton(960, 700, "VERSUS", "Versus", "versus");

    this.menu.seleccionar(0, true);

    // Tutorial
    this.tutorialOpen = false;
  }

  abrirTutorial(tipo) {
    if (this.tutorialOpen) return;

    const { width, height } = this.scale;

    this.tutorialOpen = true;
    this.tutorialTipo = tipo;

    this.tutorialFondo = this.add
      .rectangle(0, 0, width, height, 0x000000)
      .setOrigin(0)
      .setAlpha(0.9)
      .setDepth(10);

    this.tutorialContainer = this.add.container(0, 0).setDepth(11);

    this.add.text(width / 2, 120, "CÓMO JUGAR", {
      fontFamily: "Arial Black",
      fontSize: 56,
      color: "#ffffff"
    }).setOrigin(0.5)
      .setDepth(11);

    if (tipo === "cooperativo") {
      crearTutorialCoop(this, width, height, this.tutorialContainer);
    } else {
      crearTutorialVersus(this, width, height, this.tutorialContainer);
    }
  }

  cerrarTutorialYComenzar() {
    if (!this.tutorialOpen) return;

    this.tutorialContainer.destroy(true);
    this.tutorialFondo.destroy(true);

    const tipo = this.tutorialTipo;

    this.tutorialOpen = false;
    this.tutorialTipo = null;

    this.scene.start(tipo === "cooperativo" ? "Game" : "Versus");
  }

  update() {
    this.fondo.update();

    const input = this.inputSystem;
    if (!input) return;

    if (this.tutorialOpen) {
      if (input.isJustPressed(INPUT_ACTIONS.SOUTH, "player1")) {
        this.cerrarTutorialYComenzar();
      }
      return;
    }

    if (input.isJustPressed(INPUT_ACTIONS.UP, "player1"))
      this.menu.navegar(-1);

    if (input.isJustPressed(INPUT_ACTIONS.DOWN, "player1"))
      this.menu.navegar(1);

    if (input.isJustPressed(INPUT_ACTIONS.SOUTH, "player1")) {
      const sel = this.menu.getSeleccionado();
      this.abrirTutorial(sel.tipo);
    }
  }
}
