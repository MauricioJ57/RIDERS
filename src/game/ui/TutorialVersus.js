// ui/TutorialVersus.js
export function crearTutorialVersus(scene, width, height, container) {
  const add = (...objs) => container.add(objs.flat());

  const textoIntro = scene.add.text(width / 2, 200,
    "El primero que derrote a su oponente gana",
    { fontFamily: "Arial", fontSize: 28, color: "#ffffff", align: "center" }
  ).setOrigin(0.5);

  // Jugador 1
  const j1x = width / 2 - 350;
  add(
    scene.add.text(j1x, 320, "JUGADOR 1", {
      fontFamily: "Arial Black", fontSize: 32, color: "#ffffff"
    }).setOrigin(0.5),
    scene.add.image(j1x, 450, "chicosVictoria").setScale(1.2),
    scene.add.image(j1x, 600, "controlRojoAX").setScale(1.2),
    scene.add.text(j1x, 680, "MOVERSE, SALTAR\nY DISPARAR", {
      fontFamily: "Arial Black", fontSize: 22, color: "#ffffff", align: "center"
    }).setOrigin(0.5)
  );

  // Jugador 2
  const j2x = width / 2;
  add(
    scene.add.text(j2x, 320, "JUGADOR 2", {
      fontFamily: "Arial Black", fontSize: 32, color: "#ffffff"
    }).setOrigin(0.5),
    scene.add.image(j2x, 450, "camion").setScale(0.6),
    scene.add.image(j2x, 600, "controlVerdeAX").setScale(1.2),
    scene.add.text(j2x, 680, "ELEGIR Y LANZAR\nOBSTÁCULOS", {
      fontFamily: "Arial Black", fontSize: 22, color: "#ffffff", align: "center"
    }).setOrigin(0.5)
  );

  // Obstáculos
  const obsX = width / 2 + 400;
  const tipos = [
    { key: "caja_icon", t: "¡ESQUIVA!" },
    { key: "bananas_icon", t: "¡ESQUIVA!" },
    { key: "tomates_icon", t: "¡SALTA!" },
    { key: "gomera_icon", t: "¡RECOGE!" }
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

  // Botón continuar
  add(
    scene.add.image(width / 2, height - 100, "boton").setScale(1.2),
    scene.add.text(width / 2, height - 100, "CONTINUAR", {
      fontFamily: "Arial Black", fontSize: 28, color: "#000000",
      stroke: "#ffffff", strokeThickness: 6
    }).setOrigin(0.5)
  );

  add(textoIntro);
}
