import Phaser from "phaser";

export default class Login extends Phaser.Scene {
  constructor() {
    super("login");
  }

  create() {
    const centerX = 1024; 
    const centerY = 768; 

    // agregar un texto "Login" en la parte superior de la pantalla
    this.add
      .text(centerX, 100, "Login", {
        fontSize: 48,
        fontFamily: "Arial",
      })
      .setOrigin(0.5);
    // agregar un texto Ingresar con Email y contraseña que al hacer clic me levante un popup js para ingresar los datos
    /*this.add
      .text(centerX, 220, "Ingresar con Email y contraseña", {
        fontSize: 24,
      })
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerdown", () => {
        const email = prompt("Email");
        const password = prompt("Password");
        this.firebase
          .signInWithEmail(email, password)
          .then(() => {
            this.scene.start("MainMenu");
          })
          .catch(() => {
            const crearUsuario = window.confirm(
              "Email no encontrado. \n ¿Desea crear un usuario?"
            );
            if (crearUsuario) {
              this.firebase
                .createUserWithEmail(email, password)
                .then(() => {
                  this.scene.start("game");
                })
                .catch((createUserError) => {
                  console.log(
                    "🚀 ~ file: Login.js:51 ~ .catch ~ error",
                    createUserError
                  );
                });
            }
          });
      });*/

    // Agregar un texto "Ingresar de forma Anonima" que al hacer clic me levante un popup js para ingresar los datos
    this.add
      .text(centerX, 310, "Ingresar de forma Anonima", {
        fontSize: 24,
        fontFamily: "Arial",
      })
      .setOrigin(0.5)
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
        fontSize: 24,
        fontFamily: "Arial",
      })
      .setOrigin(0.5)
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
        fontSize: 24,
        fontFamily: "Arial",
      })
      .setOrigin(0.5)
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