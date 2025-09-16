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
    
        this.add.rectangle(180, 384, 30, 800, 0x0000ff).setOrigin(0.5, 0.5);
        
        this.add.rectangle(820, 384, 30, 800, 0x0000ff).setOrigin(0.5, 0.5);

        this.add.rectangle(350, 384, 10, 800, 0x0000ff).setOrigin(0.5, 0.5);

        this.add.rectangle(500, 384, 10, 800, 0x0000ff).setOrigin(0.5, 0.5);

        this.add.rectangle(650, 384, 10, 800, 0x0000ff).setOrigin(0.5, 0.5);

        this.add.image(512, 384, 'background').setAlpha(0.5);

        //-- BICICLETA --
        this.bici = this.physics.add.sprite(450, 500, 'bici');
        this.bici.setCollideWorldBounds(true);

        //-- CAMION --
        this.camion = this.physics.add.image(450, 100, 'camion');
        this.camion.setCollideWorldBounds(true);
        this.camion.setDepth(10);
        this.camion.setScale(4);
        this.camion.setBounce(1);
        this.camion.setVelocityX(100);
        
        //-- CONTROLES
        this.controles = this.input.keyboard.createCursorKeys();

        //-- GENERACION DE OBJETOS --

        this.piedras = this.physics.add.group();
        this.input.keyboard.on('keydown-SPACE', () => {
            const piedra = this.piedras.create(this.bici.x, this.bici.y - 20, 'piedra');
            piedra.setVelocityY(-300);
        });

        this.camionobjetos = this.physics.add.group();

        this.lanzarpiedra = this.time.addEvent({
            delay: 1500,
            callback: () => {
                const camionobjeto = this.camionobjetos.create(this.camion.x, this.camion.y + 20, 'piedra');
                camionobjeto.setVelocityY(200);
            },
            loop: true
        })

        //--COLISIONES--

        this.physics.add.overlap(this.camionobjetos, this.bici, (camionobjeto, bici) => {
            bici.disableBody(true, true);
        }, null, this);

        this.physics.add.overlap(this.camion, this.piedras, (camion, piedras) => {
            piedras.disableBody(true, true);
        }, null, this);

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

            if (this.camion.x >= 750) {
                this.camion.setVelocityX(-100);
                this.camion.setFlipX(true); 
            }
            if (this.camion.x <= 250) {
                this.camion.setVelocityX(100);
                this.camion.setFlipX(false);
            }
    }
}
