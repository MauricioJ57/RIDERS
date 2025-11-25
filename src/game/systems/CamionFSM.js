// src/game/systems/CamionFSM.js
import StateMachine from '../clases/StateMachine.js';
import patrones from '../data/PatronesCoop.js';
import { Caja, Tomate, Banana, PickupGomera } from '../clases/obstaculos.js';

export default class CamionFSM {
  constructor(scene) {
    this.scene = scene;

    this.fsm = new StateMachine(
      'idle',
      {
        idle: {
          enter: () => { this.scene.camionTimer = 0; },
          execute: () => {
            this.scene.camionTimer++;
            if (this.scene.camionTimer > 40) {
              const choice = Phaser.Math.Between(0, 2);
              if (choice === 0) this.fsm.transition('move');
              else if (choice === 1) this.fsm.transition('drop');
              else this.fsm.transition('pattern');
            }
          }
        },

        move: {
          enter: () => {
            const dir = Phaser.Math.Between(0, 1) ? 1 : -1;
            this.scene.moveCamion(dir);
            this.fsm.transition('idle');
          }
        },

        drop: {
          enter: () => {
            const now = this.scene.time.now;
            if (now - this.scene.lastSpawnTime >= this.scene.spawnCooldown) {
              this.scene.soltarObstaculo();
              this.scene.lastSpawnTime = now;
            }
            this.fsm.transition('idle');
          }
        },

        pattern: {
          enter: () => {
            this.scene.patron = Phaser.Utils.Array.GetRandom(patrones);

            // corregir tomates en bordes
            for (let paso of this.scene.patron) {
              if (paso.tipo === Tomate) {
                if (paso.lane === 0) paso.lane = 1;
                if (paso.lane === 4) paso.lane = 3;
              }
            }

            this.scene.patronIndex = 0;
            this.scene.patternTimer = 0;
            this.scene.patternDelay = 10;
            this.scene.targetLane = this.scene.patron[0].lane;
          },

          execute: () => {
            const s = this.scene;

            s.patternTimer++;
            if (s.patternTimer < s.patternDelay) return;
            s.patternTimer = 0;

            // mover hasta lane objetivo
            if (s.camionLane !== s.targetLane) {
              if (s.camionLane < s.targetLane) s.moveCamion(1);
              else s.moveCamion(-1);
              return;
            }

            // dropear
            const paso = s.patron[s.patronIndex];
            s.spawnObstaculo(paso.tipo, s.camion.x, s.camion.y + 120);

            const pasoActual = s.patron[s.patronIndex];
            const pasoSig = s.patron[s.patronIndex + 1];

            if (pasoSig) {
              const close =
                pasoSig.lane === pasoActual.lane ||
                (pasoActual.tipo === Tomate && Math.abs(pasoSig.lane - pasoActual.lane) <= 1);

              s.patternDelay = close ? 20 : 10;
            }

            s.patronIndex++;
            if (s.patronIndex < s.patron.length) {
              s.targetLane = s.patron[s.patronIndex].lane;
            } else {
              this.fsm.transition('idle');
            }
          }
        }
      },
      this
    );
  }

  step() {
    this.fsm.step();
  }
}
