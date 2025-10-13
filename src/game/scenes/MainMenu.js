import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.add.image(512, 384, 'background');

        this.add.image(512, 300, 'logo');

        // --- BOTON DE COOPERATIVO ---

        const modoCoop = this.add.image(0, 0, 'boton');

        const containerCoop = this.add.container(512, 700, [modoCoop]);
        containerCoop.setSize(300, 100);
        containerCoop.setInteractive();

        // esto es solo un indicador y puede borrarse luego y no afectara al boton
        containerCoop.on('pointerover', () => {
            modoCoop.setTint('#c8c2c9ff')
        });
        containerCoop.on('pointerout', () => {
            modoCoop.clearTint();
        })

        containerCoop.on('pointerup', () => {
            this.scene.start('Game')
            console.log('Cooperativo')
        })

        // --- BOTON DE VERSUS ---

        const modoVersus = this.add.image(0, 0, 'boton');

        const containerVersus = this.add.container(900, 700, [modoVersus]);
        containerVersus.setSize(300, 100);
        containerVersus.setInteractive();

        // esto es solo un indicador y puede borrarse luego y no afectara al boton
        containerVersus.on('pointerover', () => {
            modoVersus.setTint('#c8c2c9ff')
        });
        containerVersus.on('pointerout', () => {
            modoVersus.clearTint();
        })

        containerVersus.on('pointerup', () => {
            this.scene.start('GameVersus')
            console.log('Versus')
        });

        /*this.add.text(512, 460, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('Game');

        });*/
    }
}
