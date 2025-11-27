// ui/TutorialVersus.js
import { getPhrase } from "../../servicios/translations.js";
import keys from "../../traducciones/keys.js";

// ui/TutorialVersus.js
export function crearTutorialVersus(scene, width, height, container) {
  const add = (...objs) => container.add(objs.flat());

  // ---------- INTRO ----------
  const textoIntro = scene.add.text(
    width / 2,
    200,
    getPhrase(keys.sceneGameTutorialVersus.descriptionTextVersus),
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
    scene.add.text(
      j1x,
      320,
      getPhrase(keys.sceneGameTutorialVersus.player1),
      {
        fontFamily: "Arial Black",
        fontSize: 32,
        color: "#ffffff"
      }
    ).setOrigin(0.5),

    scene.add.image(j1x, 450, "chicosVictoria").setScale(1.2),
    scene.add.image(j1x, 600, "controlRojoAX").setScale(1.2),

    scene.add.text(
      j1x,
      680,
      getPhrase(keys.sceneGameTutorialVersus.actionPlayer1),
      {
        fontFamily: "Arial Black",
        fontSize: 22,
        color: "#ffffff",
        align: "center"
      }
    ).setOrigin(0.5)
  );

  // ---------- JUGADOR 2 ----------
  const j2x = width / 2;

  add(
    scene.add.text(
      j2x,
      320,
      getPhrase(keys.sceneGameTutorialVersus.player2),
      {
        fontFamily: "Arial Black",
        fontSize: 32,
        color: "#ffffff"
      }
    ).setOrigin(0.5),

    scene.add.image(j2x, 450, "camion").setScale(0.6),
    scene.add.image(j2x, 600, "controlVerdeAX").setScale(1.2),

    scene.add.text(
      j2x,
      680,
      getPhrase(keys.sceneGameTutorialVersus.actionPlayer2),
      {
        fontFamily: "Arial Black",
        fontSize: 22,
        color: "#ffffff",
        align: "center"
      }
    ).setOrigin(0.5)
  );

  // ---------- OBSTÁCULOS ----------
  const obsX = width / 2 + 400;
  const tipos = [
    { key: "caja_icon",    t: getPhrase(keys.sceneGameTutorialVersus.dodgeText) },
    { key: "bananas_icon", t: getPhrase(keys.sceneGameTutorialVersus.dodgeText) },
    { key: "tomates_icon", t: getPhrase(keys.sceneGameTutorialVersus.jumpText)  },
    { key: "gomera_icon",  t: getPhrase(keys.sceneGameTutorialVersus.collectText) }
  ];

  tipos.forEach((o, i) => {
    const y = 360 + i * 80;
    add(
      scene.add.image(obsX, y, o.key),
      scene.add.text(
        obsX + 70, y, o.t,
        {
          fontFamily: "Arial Black",
          fontSize: 22,
          color: "#ffffff"
        }
      ).setOrigin(0, 0.5)
    );
  });

  // ---------- BOTÓN CONTINUAR ----------
  add(
    scene.add.image(width / 2, height - 100, "boton").setScale(1.2),

    scene.add.text(
      width / 2,
      height - 100,
      getPhrase(keys.sceneGameTutorialVersus.continueButton),
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
