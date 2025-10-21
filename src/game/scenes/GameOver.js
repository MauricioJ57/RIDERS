// GameOver.js
import { Scene } from 'phaser';
import InputSystem, { INPUT_ACTIONS } from '../systems/InputSystem.js';

export class GameOver extends Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.modo = data.modo || 'Cooperativo';
    this.resultado = data.resultado || 'derrota';
    this.ganador = data.ganador || 'ninguno';
    this.puntaje = data.puntaje || 0; // ✅ corregido
  }

  create() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Fondo negro con fade
    const fondo = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000)
      .setOrigin(0)
      .setAlpha(0);
    this.tweens.add({
      targets: fondo,
      alpha: 1,
      duration: 600,
      ease: 'Quad.easeOut'
    });

    // --- Determinar texto e imagen ---
    let texto = '';
    let imagenKey = '';

    if (this.modo.toLowerCase() === 'cooperativo') {
      texto = (this.resultado === 'victoria') ? '¡Victoria!' : 'Derrota...';
      imagenKey = (this.resultado === 'victoria') ? 'chicosVictoria' : 'chicosDerrota';
    } else {
      if (this.ganador === 'bici') {
        texto = '¡Jugador 1 (Bici) Gana!';
        imagenKey = 'chicosVictoria';
      } else {
        texto = '¡Jugador 2 (Camión) Gana!';
        imagenKey = 'chicosDerrota';
      }
    }

    // --- Imagen ---
    if (imagenKey && this.textures.exists(imagenKey)) {
      const imagen = this.add.image(centerX, centerY - 50, imagenKey)
        .setOrigin(0.5)
        .setScale(0)
        .setAlpha(0);

      this.tweens.add({
        targets: imagen,
        scale: 2,
        alpha: 1,
        duration: 800,
        ease: 'Back.Out'
      });
    }

    // --- Texto principal ---
    const textoPrincipal = this.add.text(centerX, centerY + 180, texto, {
      fontFamily: 'Arial Black',
      fontSize: '64px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: textoPrincipal,
      alpha: 1,
      duration: 700,
      delay: 400,
      ease: 'Cubic.Out'
    });

    // --- Puntaje (solo en cooperativo) ---
    if (this.modo.toLowerCase() === 'cooperativo') {
      const textoPuntaje = this.add.text(centerX, centerY - 250, `Puntaje: ${this.puntaje}`, {
        fontFamily: 'Arial Black',
        fontSize: '48px',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5).setAlpha(0).setScale(0.5);

      this.tweens.add({
        targets: textoPuntaje,
        alpha: 1,
        scale: 1,
        duration: 700,
        delay: 500,
        ease: 'Back.Out'
      });
    }

    // --- Sistema de input ---
    this.inputSystem = new InputSystem(this.input);
    this.inputSystem.configureKeyboard({
      [INPUT_ACTIONS.UP]: [Phaser.Input.Keyboard.KeyCodes.UP],
      [INPUT_ACTIONS.DOWN]: [Phaser.Input.Keyboard.KeyCodes.DOWN],
      [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.K]
    }, "player1");

    // --- Botones ---
    this.botones = [];
    this.botonIndex = 0;
    this.botonesActivos = false;

    const textoVolverJugar = this.add.text(centerX, centerY + 320, 'Volver a Jugar', {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5).setAlpha(0);

    const textoMenu = this.add.text(centerX, centerY + 390, 'Volver al Menú', {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5).setAlpha(0);

    this.botones = [textoVolverJugar, textoMenu];

    // Aparecen después de 1 segundo
    this.time.delayedCall(1000, () => {
      this.tweens.add({
        targets: this.botones,
        alpha: 1,
        duration: 600,
        ease: 'Quad.easeOut'
      });
      this.botonesActivos = true;
      this.actualizarSeleccionVisual();
    });

    // --- Actualizar visual ---
    this.actualizarSeleccionVisual = () => {
      this.botones.forEach((b, i) => {
        b.setStyle({ color: i === this.botonIndex ? '#ffff00' : '#ffffff' });
        b.setScale(i === this.botonIndex ? 1.2 : 1.0);
      });
    };

    // --- Input loop ---
    this.inputUpdate = this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (!this.botonesActivos) return;
        const input = this.inputSystem;
        if (input.isJustPressed(INPUT_ACTIONS.UP, "player1")) {
          this.botonIndex = (this.botonIndex - 1 + this.botones.length) % this.botones.length;
          this.actualizarSeleccionVisual();
        }
        if (input.isJustPressed(INPUT_ACTIONS.DOWN, "player1")) {
          this.botonIndex = (this.botonIndex + 1) % this.botones.length;
          this.actualizarSeleccionVisual();
        }
        if (input.isJustPressed(INPUT_ACTIONS.SOUTH, "player1")) {
          this.confirmarSeleccion();
        }
      }
    });
  }

  confirmarSeleccion() {
    const seleccionado = this.botonIndex;
    this.tweens.add({
      targets: this.botones[seleccionado],
      scale: 1.4,
      duration: 150,
      yoyo: true,
      ease: 'Quad.easeInOut'
    });

    this.time.delayedCall(200, () => {
      if (seleccionado === 0) {
        const escenaDestino = (this.modo.toLowerCase() === 'cooperativo') ? 'Game' : 'Versus';
        this.scene.start(escenaDestino);
      } else {
        this.scene.start('MainMenu');
      }
    });
  }
}
