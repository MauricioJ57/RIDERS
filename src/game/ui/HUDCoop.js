// src/game/ui/HUDCoop.js
import Phaser from 'phaser';
import { getPhrase } from "../../servicios/translations.js";
import keys from "../../traducciones/keys.js";

export default class HUDCoop {
  constructor(scene, vidasCamionMax = 6, vidasBiciMax = 3) {
    this.scene = scene;

    // guardar valores para bici
    scene.vidasBici = vidasBiciMax;
    scene.vidasBiciMax = vidasBiciMax;

    this.crearPuntuacion();
    this.crearBarraVidaCamion(vidasCamionMax);
    this.crearCorazonesBici();   // SOLO UNA VEZ
    this.crearHUDJugadores();
  }

  // =====================================================
  // PUNTOS
  // =====================================================
  crearPuntuacion() {
    const scene = this.scene;
    scene.puntuacion = 0;

    const label = getPhrase(keys.sceneGameCoop.score) + ": ";

    this.textoPuntuacion = scene.add.text(16, 16, label + "0", {
      fontFamily: "arial",
      fontSize: '40px',
      fill: '#ffffffff',
      strokeThickness: 2
    });

    this.eventoPuntuacion = scene.time.addEvent({
      delay: 1000,
      callback: () => {
        scene.puntuacion += 10;
        this.textoPuntuacion.setText(label + scene.puntuacion);
      },
      loop: true
    });
  }

  // =====================================================
  // VIDA CAMIÓN
  // =====================================================
  crearBarraVidaCamion(maxVidas) {
    const scene = this.scene;

    scene.vidasCamion = maxVidas;
    scene.vidasCamionMax = maxVidas;

    const barWidth = 300;
    const barHeight = 25;
    const posX = 960;
    const posY = 40;

    this.barraFondo = scene.add.rectangle(posX, posY, barWidth, barHeight, 0x000000)
      .setOrigin(0.5)
      .setDepth(10);

    this.barraVida = scene.add.rectangle(posX - barWidth / 2, posY, barWidth, barHeight, 0xff0000)
      .setOrigin(0, 0.5)
      .setDepth(10);

    this.barraBorde = scene.add.rectangle(posX, posY, barWidth + 4, barHeight + 4)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5)
      .setDepth(10);
  }

  actualizarBarraVidaCamion(vidas, vidasMax) {
    const barWidth = 300;
    const porcentaje = Phaser.Math.Clamp(vidas / vidasMax, 0, 1);
    this.barraVida.width = barWidth * porcentaje;
  }

  // =====================================================
  // VIDA DE LA BICI (4 IMÁGENES SEPARADAS)
  // =====================================================
  crearCorazonesBici() {
    const scene = this.scene;

    const centerX = scene.scale.width / 2;
    const posY = scene.scale.height - 80;

    this.spriteCorazones = scene.add.image(centerX, posY, 'corazones-llenos')
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);
  }

  actualizarVidasBici(vidasActuales) {
    let texture = 'corazones-llenos';

    if (vidasActuales === 2) texture = 'dos corazones';
    else if (vidasActuales === 1) texture = 'un corazon';
    else if (vidasActuales <= 0) texture = 'sin-corazones';

    this.spriteCorazones.setTexture(texture);
  }

  // =====================================================
  // HUD COOPERATIVO ORIGINAL
  // =====================================================
  crearHUDJugadores() {
    const scene = this.scene;

    const margen = 40;
    const baseY = scene.scale.height - 150;

    const t1 = getPhrase(keys.sceneGameCoop.player1) + "\n" +
               getPhrase(keys.sceneGameCoop.actionPlayer1);

    const t2 = getPhrase(keys.sceneGameCoop.player2) + "\n" +
               getPhrase(keys.sceneGameCoop.actionPlayer2);

    const jugador1Img = scene.add.image(margen + 120, baseY, 'chicoRojoHud')
      .setOrigin(0.5)
      .setScale(1.4)
      .setScrollFactor(0)
      .setDepth(50);

    const controlJ1 = scene.add.image(jugador1Img.x + 170, baseY, 'controlRojoA')
      .setOrigin(0.5)
      .setScale(1.2)
      .setScrollFactor(0)
      .setDepth(50);

    scene.add.text(
      jugador1Img.x + 90,
      baseY - 150,
      t1,
      { fontFamily: 'Arial Black', fontSize: '28px', color: '#ffffff',
        align: 'center', stroke: '#000000', strokeThickness: 5 }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(50);

    const jugador2Img = scene.add.image(scene.scale.width - (margen + 120), baseY, 'chicoVerdeHud')
      .setOrigin(0.5)
      .setScale(1.4)
      .setScrollFactor(0)
      .setDepth(50);

    const controlJ2 = scene.add.image(jugador2Img.x - 170, baseY, 'controlVerdeA')
      .setOrigin(0.5)
      .setScale(1.2)
      .setScrollFactor(0)
      .setDepth(50);

    scene.add.text(
      jugador2Img.x - 90,
      baseY - 150,
      t2,
      { fontFamily: 'Arial Black', fontSize: '28px', color: '#ffffff',
        align: 'center', stroke: '#000000', strokeThickness: 5 }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(50);
  }
}
