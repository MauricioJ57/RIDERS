import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        // la escena Boot se encarga de cargar los assets necesarios para la escena Preloader y disminuir el tiempo de carga percibido

        this.load.image('background', 'assets/bg.png');
    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
