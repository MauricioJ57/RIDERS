import Phaser from 'phaser';
 
let obstaculosGroup = 0;

class Obstaculo extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setVelocityY(200); // velocidad base de caída
  }
}

class Caja extends Obstaculo {
  constructor(scene, x, y) {
    super(scene, x, y, 'caja');
    this.tipo = 'caja';
    this.setScale(2);
  }
}

class Tomate extends Obstaculo {
  constructor(scene, x, y) {
    super(scene, x, y, 'tomates');
    this.tipo = 'tomates';
    this.setDisplaySize(128, 32); // ocupa más ancho
    this.setScale(2.5);
  }
}

class Banana extends Obstaculo {
  constructor(scene, x, y) {
    super(scene, x, y, 'banana');
    this.tipo = 'banana';
    this.setScale(2);
  }
}

class Piedra extends Obstaculo {
  constructor(scene, x, y) {
    super(scene, x, y, 'piedra');
    this.tipo = 'piedra';
  }
}

export { Caja, Tomate, Banana, Piedra, obstaculosGroup };