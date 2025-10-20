import { Scene } from 'phaser';
import InputSystem, { INPUT_ACTIONS } from '../systems/InputSystem.js';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.fondoCiudad = this.add.tileSprite(0, 0, 2048, 1080, 'ciudad').setOrigin(0).setScrollFactor(0);

        this.add.image(960, 300, 'logo').setOrigin(0.5);

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

        // --- BOTON DE COOPERATIVO ---
        this.add.text(960, 550, 'MODO COOPERATIVO', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#000000',
            stroke: '#ffffff', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(1);

        const modoCoop = this.add.image(0, 0, 'boton');

        const containerCoop = this.add.container(960, 550, [modoCoop]);
        containerCoop.setSize(300, 100);
        containerCoop.setInteractive();

        // esto es solo un indicador y puede borrarse luego y no afectara al boton
        /*containerCoop.on('pointerover', () => {
            modoCoop.setTint('#c8c2c9ff')
        });
        containerCoop.on('pointerout', () => {
            modoCoop.clearTint();
        })

        containerCoop.on('pointerup', () => {
            this.scene.start('Game')
            console.log('Cooperativo')
        })*/

        // --- BOTON DE VERSUS ---
        this.add.text(960, 700, 'MODO VERSUS', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#000000',
            stroke: '#ffffff', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(1)

        const modoVersus = this.add.image(0, 0, 'boton');

        const containerVersus = this.add.container(960, 700, [modoVersus]);
        containerVersus.setSize(300, 100);
        containerVersus.setInteractive();

        this.lineasDeSeleccion = [containerCoop, containerVersus];
        this.lineasActual = 0;

        // Selección inicial
        this.lineasDeSeleccion[this.lineasActual].setScale(1.2);

        this.input.keyboard.on('keydown-UP', () => {
            this.lineasDeSeleccion[this.lineasActual].setScale(1);
            this.lineasActual = (this.lineasActual - 1 + this.lineasDeSeleccion.length) % this.lineasDeSeleccion.length;
            this.lineasDeSeleccion[this.lineasActual].setScale(1.2);
        });

        this.input.keyboard.on('keydown-DOWN', () => {
            this.lineasDeSeleccion[this.lineasActual].setScale(1);
            this.lineasActual = (this.lineasActual + 1) % this.lineasDeSeleccion.length;
            this.lineasDeSeleccion[this.lineasActual].setScale(1.2);
        });

        this.input.keyboard.on('keydown-K', () => {
            if (this.lineasActual === 0) {
                this.scene.start('Game');
            } else if (this.lineasActual === 1) {
                this.scene.start('Versus');
            }
        });

        // esto es solo un indicador y puede borrarse luego y no afectara al boton
        /*containerVersus.on('pointerover', () => {
            modoVersus.setTint('#c8c2c9ff')
        });
        containerVersus.on('pointerout', () => {
            modoVersus.clearTint();
        })

        containerVersus.on('pointerup', () => {
            this.scene.start('Versus')
            console.log('Versus')
        });*/

        /*this.add.text(512, 460, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('Game');

        });*/
    }
    update () {
        if (this.fondoCiudad) {
      this.fondoCiudad.tilePositionY -= 10; // ESTO AJUSTA LA VELOCIDAD DEL FONDO
      }
    }

}
