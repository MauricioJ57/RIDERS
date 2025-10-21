export function crearFondoTriple(scene, config = {}) {
  const {
    // posición y tamaño base
    xCalle = scene.scale.width / 2,
    anchoCalle = 1028,
    velocidad = 10,
    profundidad = 0, // valor base común

    // profundidad por capa (opcional)
    profundidadVeredaIzq = -1,
    profundidadCalle = -10,
    profundidadVeredaDer = -1,

    // veredas: ancho, desplazamientos y posiciones opcionales
    anchoVeredaIzq = 538,
    anchoVeredaDer = 541,
    offsetVeredaIzqX = 0,
    offsetVeredaDerX = 0,
    posVeredaIzqX = -250,
    posVeredaDerX = 1360,

    // escalas
    escalaVeredaIzq = 1.5,
    escalaVeredaDer = 1.5,
    escalaCalle = (1, 1.1)
  } = config;

  const alto = scene.scale.height;

  // === Vereda izquierda ===
  const veredaIzq = scene.add.tileSprite(
    posVeredaIzqX !== null
      ? posVeredaIzqX
      : xCalle - anchoCalle / 2 - anchoVeredaIzq + offsetVeredaIzqX,
    0,
    anchoVeredaIzq,
    alto,
    'veredaIzq'
  )
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(profundidadVeredaIzq ?? profundidad) // 👈 profundidad individual o global
    .setScale(escalaVeredaIzq);

  // === Calle ===
  const calle = scene.add.tileSprite(
    xCalle - anchoCalle / 2,
    0,
    anchoCalle,
    alto,
    'calle'
  )
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(profundidadCalle ?? profundidad)
    .setScale(escalaCalle);

  // === Vereda derecha ===
  const veredaDer = scene.add.tileSprite(
    posVeredaDerX !== null
      ? posVeredaDerX
      : xCalle + anchoCalle / 2 + offsetVeredaDerX,
    0,
    anchoVeredaDer,
    alto,
    'veredaDer'
  )
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(profundidadVeredaDer ?? profundidad)
    .setScale(escalaVeredaDer);

  // === Control ===
  return {
    veredaIzq,
    calle,
    veredaDer,
    velocidad,
    update() {
      this.veredaIzq.tilePositionY -= this.velocidad / escalaVeredaIzq;
      this.calle.tilePositionY -= this.velocidad / escalaCalle;
      this.veredaDer.tilePositionY -= this.velocidad / escalaVeredaDer;
    },
    setVelocidad(v) {
      this.velocidad = v;
    },
    moverCalle(x) {
      this.calle.x = x - anchoCalle / 2;
      this.veredaIzq.x =
        (posVeredaIzqX !== null
          ? posVeredaIzqX
          : x - anchoCalle / 2 - anchoVeredaIzq + offsetVeredaIzqX);
      this.veredaDer.x =
        (posVeredaDerX !== null
          ? posVeredaDerX
          : x + anchoCalle / 2 + offsetVeredaDerX);
    }
  };
}
