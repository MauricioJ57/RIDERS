import { Scene } from 'phaser';
import {
    getLanguageConfig,
    getTranslations,
} from "../../servicios/translations";

export class Preloader extends Scene
{   #language;
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        const centerX = 1024;
        const centerY = 768;
        // escalado del background
        this.add.image(centerX, centerY, 'background').setScale(2);

        // barra de carga (linea exterior)
        this.add.rectangle(centerX, centerY, 468, 32).setStrokeStyle(1, 0xffffff);

        // barra de carga (linea interior)
        const bar = this.add.rectangle(centerX-230, centerY, 4, 28, 0xffffff);

        this.load.on('progress', (progress) => {

            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        this.#language = getLanguageConfig()

        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');
        this.load.image('logo', 'logo.png');
        this.load.spritesheet('bici', 'bici.png', {
  frameWidth: 64, // ancho de cada frame
  frameHeight: 128 // alto de cada frame
});

            this.load.spritesheet('gomera', 'gomera.png', {
  frameWidth: 64, // ancho de cada frame
  frameHeight: 64 // alto de cada frame
});

        this.load.image('camion', 'camion.png');
        this.load.image('caja', 'caja.png');
        this.load.image('banana', 'banana.png');
        this.load.image('tomates', 'tomates.png');
        this.load.image('mira', 'mirilla.png');
        this.load.image('ciudad', 'basev3.png');
        this.load.image('boton', 'placeholder de boton.png');
        this.load.image('corazones-llenos', 'corazones completos.png');
        this.load.image('dos corazones', 'dos corazones.png');
        this.load.image('un corazon', 'un corazon.png');
        this.load.image('sin-corazones', 'corazones(fila vacia).png');
        this.load.image('caja_icon', 'caja_icon.png');
        this.load.image('bananas_icon', 'bananas_icon.png');
        this.load.image('tomates_icon', 'tomates_icon.png');
        this.load.image('gomera_icon', 'gomera_icon.png');
        this.load.image('chico_rojo_tutorial', 'chico rojo contorno.png');
        this.load.image('chico_verde_tutorial', 'chico verde contorno.png');
        this.load.image('control rojo', 'control boton abajo R.png');
        this.load.image('control verde', 'control boton abajo V.png');
        this.load.image('dos chicos', 'dos chicos.png');
        this.load.image('chicosVictoria', 'chicos victoria.png');
        this.load.image('chicosDerrota', 'chicos derrota.png');
        this.load.image('chicoRojoHud', 'chico rojo hud.png');
        this.load.image('chicoVerdeHud', 'chico verde hud.png');
        this.load.image('chicos_hud', 'chicos hud.png');

        this.load.image('controlVerdeA', 'control verde a.png');
        this.load.image('controlRojoA', 'control rojo a.png');
        this.load.image('controlVerdeAX', 'control verde a x.png');
        this.load.image('controlRojoAX', 'control rojo a x.png');
        this.load.image('controlRojoB', 'control rojo b.png');

        this.load.image('veredaIzq', 'vereda_izq.png');
        this.load.image('calle', 'calle.png');
        this.load.image('veredaDer', 'vereda_der.png');
        

        this.load.spritesheet('bicigomera', 'bicigomera.png', { frameWidth: 64, frameHeight: 128 });

        //audio
        this.load.audio('musica_menu', 'audio/Menu.mp3');
        this.load.audio('musica_juego', 'audio/Gameplay.mp3');
        this.load.audio('sfx_salto', 'audio/Jump7.wav');
        this.load.audio('sfx_banana', 'audio/Jump4.wav');
        this.load.audio('sfx_disparo', 'audio/daño1.wav');
        this.load.audio('sfx_daño', 'audio/daño2.wav');
        this.load.audio('sfx_fallo', 'audio/Hit6.wav');
        this.load.audio('sfx_recogerItem', 'audio/item3.wav');
        this.load.audio('sfx_camionMotor', 'audio/camion_motor.wav');
        this.load.audio('sfx_biciSonido', 'audio/bici_sonido.wav');
        this.load.audio('sfx_gomeraSonido', 'audio/gomera_sonido.wav');
        this.load.audio('sfx_neneDaño1', 'audio/nene_daño1.wav');
        this.load.audio('sfx_neneDaño2', 'audio/nene_daño2.wav');
        this.load.audio('sfx_neneRisa1', 'audio/nene_risa1.wav');
        this.load.audio('sfx_neneRisa2', 'audio/nene_risa2.wav');
        this.load.audio('sfx_neneRisa3', 'audio/nene_risa3.wav');
        this.load.audio('sfx_neneRisa4', 'audio/nene_risa4.wav');
        this.load.audio('sfx_neneSalto1', 'audio/nene_salto.wav');
        this.load.audio('sfx_neneSalto2', 'audio/nene_salto2.wav');
        this.load.audio('sfx_obstaculo1', 'audio/objeto1.wav');
        this.load.audio('sfx_obstaculo2', 'audio/objeto2.wav');


    }

    create ()
    {
        getTranslations(this.#language, () =>
      this.scene.start("login", { language: this.#language })
      );
    }
}
