import Phaser from 'phaser';
import { Caja, Tomate, Banana, Piedra } from './obstaculos.js';

export default class Camion extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene,x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.camionLane = 2;
        this.camion = this;
        this.camion.setScale(4);

        this.camion.setCollideWorldBounds(true);
    }

    create() {
        this.time.addEvent({
          delay: 1000, // cada segundo decide qué hacer
          callback: this.camionAI,
            callbackScope: this,
            loop: true,
        });
    }

    camionAI() {
    const action = Phaser.Math.Between(0, 2); // 0 = mover izq, 1 = mover der, 2 = soltar obstáculo

      if (action === 0) this.moveCamion(-1);
      else if (action === 1) this.moveCamion(1);
      else this.soltarObstaculo();
    };

    moveCamion(direction) {
    const newLane = this.camionLane + direction;
    if (newLane >= 0 && newLane < this.scene.lanes.length) {
        this.camionLane = newLane;
        this.camion.x = this.scene.lanes[this.camionLane];
      }
    }

    soltarObstaculo() {
  let tipo = Phaser.Math.RND.pick([Caja, Tomate, Banana, Piedra]);

  if (tipo === Tomate) {
    // casos borde
    if (this.camionLane === 0) {
      // primer carril → arrancar desde carril 1
      var x = this.lanes[1]; 
    } else if (this.camionLane === this.lanes.length - 1) {
      // último carril → centrar en carril 3
      var x = this.lanes[this.lanes.length - 2]; 
    } else {
      // cualquier otro carril → normal
      var x = this.camion.x;
    }
    var obstaculo = new Tomate(this, x, this.camion.y + 40);
  } else {
    // resto de obstáculos
    var obstaculo = new tipo(this, this.camion.x, this.camion.y + 40);
  }

  this.obstaculos.add(obstaculo);
  }
}