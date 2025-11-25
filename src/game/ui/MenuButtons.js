// ui/MenuButtons.js
export default class MenuButtons {
  constructor(scene) {
    this.scene = scene;
    this.botones = [];
    this.indiceSeleccionado = 0;
  }

  crearBoton(x, y, texto, escena, tipo) {
    const estilo = {
      fontFamily: "Arial Black",
      fontSize: 24,
      color: "#000000",
      stroke: "#ffffff",
      strokeThickness: 6,
      align: "center"
    };

    const label = this.scene.add.text(0, 0, texto, estilo).setOrigin(0.5);
    const fondo = this.scene.add.image(0, 0, "boton");

    const cont = this.scene.add.container(x, y, [fondo, label]).setSize(300, 100);

    this.botones.push({ contenedor: cont, escena, tipo });
    return cont;
  }

  seleccionar(indice, instant = false) {
    if (this.botones.length === 0) return;

    const anterior = this.botones[this.indiceSeleccionado].contenedor;
    this.scene.tweens.add({
      targets: anterior,
      scale: 1,
      duration: instant ? 0 : 120
    });

    const nuevo = this.botones[indice].contenedor;
    this.scene.tweens.add({
      targets: nuevo,
      scale: 1.2,
      duration: instant ? 0 : 150,
      ease: "Back.Out"
    });

    this.indiceSeleccionado = indice;
  }

  navegar(direccion) {
    const nuevo =
      (this.indiceSeleccionado + direccion + this.botones.length) %
      this.botones.length;

    this.seleccionar(nuevo);
  }

  getSeleccionado() {
    return this.botones[this.indiceSeleccionado];
  }
}
