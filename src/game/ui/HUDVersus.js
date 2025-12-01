// src/game/ui/HUDVersus.js
import Phaser from "phaser";
import { getPhrase } from "../../servicios/translations.js";
import keys from "../../traducciones/keys.js";

export default class HUDVersus {
  constructor(scene, vidasCamionMax = 6, vidasBiciMax = 3) {
    this.scene = scene;

    // Guardamos estas variables en la escena, igual que en cooperativo
    scene.vidasCamion = vidasCamionMax;
    scene.vidasCamionMax = vidasCamionMax;

    scene.vidasBici = vidasBiciMax;
    scene.vidasBiciMax = vidasBiciMax;

    this.crearBarraVidaCamion(vidasCamionMax);
    this.crearCorazonesBici();
    this.crearHUDPlayers();
  }

  // =====================================================
  // BARRA VIDA CAMIÓN
  // =====================================================
  crearBarraVidaCamion(maxVidas) {
    const scene = this.scene;

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
  // CORAZONES BICI (4 imágenes separadas)
  // =====================================================
  crearCorazonesBici() {
    const scene = this.scene;

    const centerX = scene.scale.width / 2;
    const posY = scene.scale.height - 80;

    this.spriteCorazones = scene.add.image(centerX, posY, "corazones-llenos")
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);
  }

  actualizarVidasBici(vidasActuales) {
    let texture = "corazones-llenos";

    if (vidasActuales === 2) texture = "dos corazones";
    else if (vidasActuales === 1) texture = "un corazon";
    else if (vidasActuales <= 0) texture = "sin-corazones";

    this.spriteCorazones.setTexture(texture);
  }

  // =====================================================
  // HUD DE LOS DOS JUGADORES
  // =====================================================
  crearHUDPlayers() {
    const scene = this.scene;

    const margen = 40;
    const baseY = scene.scale.height - 150;

    // --- TRADUCCIONES ---
    const p1Label =
      getPhrase(keys.sceneGameVersus.player1) + "\n" +
      getPhrase(keys.sceneGameVersus.actionPlayer1);

    const p2Label =
      getPhrase(keys.sceneGameVersus.player2) + "\n" +
      getPhrase(keys.sceneGameVersus.actionPlayer2);

    // ----------------------
    // JUGADOR 1 (BICI)
    // ----------------------
    const neneHUD = scene.add.image(margen + 150, baseY, "chicos_hud")
      .setOrigin(0.5)
      .setScale(1.3)
      .setScrollFactor(0)
      .setDepth(50);

    const controlesP1 = scene.add.image(neneHUD.x + 250, baseY, "controlRojoAX")
      .setOrigin(0.5)
      .setScale(1.2)
      .setScrollFactor(0)
      .setDepth(50);

    const textoP1 = scene.add.text(
      neneHUD.x + 90,
      baseY - 150,
      p1Label,
      {
        fontFamily: "Arial Black",
        fontSize: "28px",
        color: "#ffffff",
        align: "center",
        stroke: "#000000",
        strokeThickness: 5
      }
    )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(50);

    // ----------------------
    // JUGADOR 2 (CAMIÓN)
    // ----------------------
    const baseX2 = scene.scale.width - 200;
    const baseY2 = 160;

    const controlesP2 = scene.add.image(baseX2, baseY2, "controlVerdeAX")
      .setOrigin(1, 0)
      .setScale(1.2)
      .setScrollFactor(0)
      .setDepth(50);

    const textoP2 = scene.add.text(
      baseX2 - 80,
      baseY2 + 140,
      p2Label,
      {
        fontFamily: "Arial Black",
        fontSize: "26px",
        color: "#ffffff",
        align: "center",
        stroke: "#000000",
        strokeThickness: 5
      }
    )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(50);

    this.hudElements = {
      neneHUD,
      controlesP1,
      textoP1,
      controlesP2,
      textoP2
    };
  }
}
