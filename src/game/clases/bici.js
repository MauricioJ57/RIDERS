export default class Bici extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene,x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.currentLane = 2; // empieza en el del medio
        this.player = this;
        this.player.setCollideWorldBounds(true);  
    }

    mover(cursors) {
        if (Phaser.Input.Keyboard.JustDown(cursors.left)) {
          this.movePlayer(-1);
        };
        if (Phaser.Input.Keyboard.JustDown(cursors.right)) {
          this.movePlayer(1);
        };
    }

    movePlayer(direction) {
        const newLane = this.currentLane + direction;
        if (newLane >= 0 && newLane < this.scene.lanes.length) {
          this.currentLane = newLane;
          this.player.x = this.scene.lanes[this.currentLane]
        };
    };

    onPlayerHit(obstaculo, player) {
      if (obstaculo.tipo === 'piedra') {
        // recoger piedra
        this.hasPiedra = true;
        console.log('se ha recogido una piedra.');
      } else {
        // chocar con otro obstáculo
        console.log(`¡Has chocado con una ${obstaculo.tipo}!`);
      }
    }
}