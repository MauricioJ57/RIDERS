import Phaser from "phaser";

export default class Login extends Phaser.Scene {
  constructor() {
    super("login");
  }

  create() {
    const centerX = 1024; 
    const centerY = 768; 

    this.add.image(centerX, centerY, "background").setScale(2);

    // agregar un texto "Login" en la parte superior de la pantalla
    this.add
      .text(centerX, 200, "INGRESE SESION PARA JUGAR", {
        fontSize: 64,
        fontFamily: "Arial",
        stroke: "#000000ff",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Agregar un texto "Ingresar de forma Anonima" que al hacer clic me levante un popup js para ingresar los datos
    this.add
      .text(centerX, 310, "Ingresar de forma Anonima", {
        fontSize: 32,
        fontFamily: "Arial",
        stroke: "#000000ff",
        strokeThickness: 6,
      })
      .setOrigin(0.6)
      .setInteractive()
      .on("pointerdown", () => {
        this.firebase
          .signInAnonymously()
          .then(() => {
            this.scene.start("MainMenu");
          })
          .catch((error) => {
            console.log("🚀 ~ file: Login.js:74 ~ .catch ~ error", error);
          });
      });

    // agregar un texto centrado "Ingresar con Google" que al hacer clic me levante un popup js para ingresar los datos
    this.add
      .text(centerX, 400, "Ingresar con Google", {
        fontSize: 32,
        fontFamily: "Arial",
        stroke: "#000000ff",
        strokeThickness: 6,
      })
      .setOrigin(0.6)
      .setInteractive()
      .on("pointerdown", () => {
        this.firebase
          .signInWithGoogle()
          .then(() => {
            this.scene.start("MainMenu");
          })
          .catch((error) => {
            console.log("🚀 ~ file: Login.js:74 ~ .catch ~ error", error);
          });
      });

    // agregar un texto "Ingresar con GitHub" que al hacer clic me levante un popup js para ingresar los datos
    this.add
      .text(centerX, 490, "Ingresar con GitHub", {
        fontSize: 32,
        fontFamily: "Arial",
        stroke: "#000000ff",
        strokeThickness: 6,
      })
      .setOrigin(0.6)
      .setInteractive()
      .on("pointerdown", () => {
        this.firebase
          .signInWithGithub()
          .then(() => {
            this.scene.start("MainMenu");
          })
          .catch((error) => {
            console.log("🚀 ~ file: Login.js:74 ~ .catch ~ error", error);
          });
      });
  }
}