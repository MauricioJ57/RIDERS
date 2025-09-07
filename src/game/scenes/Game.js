import { Scene } from 'phaser';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0x00ff00);
        //-- IMAGENES ESTATICAS --

        this.add.image(512, 384, 'background').setAlpha(0.5);

        //-- BICICLETA --
        this.bici = this.physics.add.sprite(450, 500, 'bici');
        this.bici.setCollideWorldBounds(true);

        //-- CAMION --
        this.camion = this.physics.add.image(450, 100, 'camion');
        this.camion.setCollideWorldBounds(true);
        this.camion.setDepth(10);
        
        //-- CONTROLES
        this.controles = this.input.keyboard.createCursorKeys();

        //-- GENERACION DE OBJETOS --

        this.piedras = this.physics.add.group();
        this.input.keyboard.on('keydown-SPACE', () => {
            const piedra = this.piedras.create(this.bici.x, this.bici.y - 20, 'piedra');
            piedra.setVelocityY(-300);
        });

        //--COLISIONES--

        this.input.once('pointerdown', () => {

            this.scene.start('GameOver');

        }); 
    }

    update () {
        //-- MOVIMIENTO --
        if (this.controles.left.isDown) {
            this.bici.setVelocityX(-300);
        } else if (this.controles.right.isDown) {
            this.bici.setVelocityX(300);
        } else {
            this.bici.setVelocityX(0);
        }
    }
}
