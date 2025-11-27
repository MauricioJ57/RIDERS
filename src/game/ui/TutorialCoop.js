import { getPhrase } from "../../servicios/translations.js";
import keys from "../../traducciones/keys.js";

// ui/TutorialCoop.js
export function crearTutorialCoop(scene, width, height, container) {
  const add = (...objs) => container.add(objs.flat());

  // ---------- INTRO ----------
  const textoIntro = scene.add.text(
    width / 2,
    200,
    getPhrase(keys.sceneGameTutorialCoop.descriptionTextCoop),
    {
      fontFamily: "Arial",
      fontSize: 28,
      color: "#ffffff",
      align: "center"
    }
  ).setOrigin(0.5);

  // ---------- JUGADOR 1 ----------
  const j1x = width / 2 - 350;

  add(
    scene.add.text(j1x, 320,
      getPhrase(keys.sceneGameTutorialCoop.player1),
      { fontFamily: "Arial Black", fontSize: 32, color: "#ffffff" }
    ).setOrigin(0.5),

    scene.add.image(j1x, 450, "chicoRojoHud").setScale(1.2),
    scene.add.image(j1x, 600, "controlRojoA").setScale(1.2),

    scene.add.text(
      j1x,
      680,
      getPhrase(keys.sceneGameTutorialCoop.actionPlayer1),
      {
        fontFamily: "Arial Black",
        fontSize: 24,
        color: "#ffffff"
      }
    ).setOrigin(0.5)
  );

  // ---------- JUGADOR 2 ----------
  const j2x = width / 2;

  add(
    scene.add.text(j2x, 320,
      getPhrase(keys.sceneGameTutorialCoop.player2),
      { fontFamily: "Arial Black", fontSize: 32, color: "#ffffff" }
    ).setOrigin(0.5),

    scene.add.image(j2x, 450, "chicoVerdeHud").setScale(1.2),
    scene.add.image(j2x, 600, "controlVerdeA").setScale(1.2),

    scene.add.text(
      j2x,
      680,
      getPhrase(keys.sceneGameTutorialCoop.actionPlayer2),
      {
        fontFamily: "Arial Black",
        fontSize: 24,
        color: "#ffffff"
      }
    ).setOrigin(0.5)
  );

  // ---------- OBSTÁCULOS ----------
  const obsX = width / 2 + 400;

  const tipos = [
    { key: "caja_icon",      t: getPhrase(keys.sceneGameTutorialCoop.dodgeText) },
    { key: "bananas_icon",   t: getPhrase(keys.sceneGameTutorialCoop.dodgeText) },
    { key: "tomates_icon",   t: getPhrase(keys.sceneGameTutorialCoop.jumpText) },
    { key: "gomera_icon",    t: getPhrase(keys.sceneGameTutorialCoop.collectText) },
  ];

  tipos.forEach((o, i) => {
    const y = 360 + i * 80;
    add(
      scene.add.image(obsX, y, o.key),
      scene.add.text(obsX + 70, y, o.t, {
        fontFamily: "Arial Black",
        fontSize: 22,
        color: "#ffffff"
      }).setOrigin(0, 0.5)
    );
  });

  // ---------- BOTÓN CONTINUAR ----------
  add(
    scene.add.image(width / 2, height - 100, "boton").setScale(1.2),

    scene.add.text(
      width / 2,
      height - 100,
      getPhrase(keys.sceneGameTutorialCoop.continueButton),
      {
        fontFamily: "Arial Black",
        fontSize: 28,
        color: "#000000",
        stroke: "#ffffff",
        strokeThickness: 6
      }
    ).setOrigin(0.5)
  );

  add(textoIntro);
}
