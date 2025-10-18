import Phaser from 'phaser';
import { INPUT_ACTIONS } from '../systems/InputSystem.js';
import { Caja, Tomate, Banana } from "./obstaculos.js";


export default class PlayerCamionVersus extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, lanes) {
    super(scene, x, y, 'camion');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;
    this.lanes = lanes;
    this.currentLane = 2;
    this.setScale(0.9);

    // slots de inventario
    this.maxSlots = 4;
    this.slots = [];
    this.currentSlot = 0;

    // inicializamos los slots con obstáculos random
    this.rellenarSlots();

    // para controlar el ritmo del spawn
    this.cooldown = false;

  }

  update() {
    const input = this.scene.inputSystem;

    // movimiento lateral (player2)
    if (input.isJustPressed(INPUT_ACTIONS.LEFT, "player2")) this.move(-1);
    if (input.isJustPressed(INPUT_ACTIONS.RIGHT, "player2")) this.move(1);

    // cambiar slot
    if (input.isJustPressed(INPUT_ACTIONS.UP, "player2")) this.cambiarSlot(-1);
    if (input.isJustPressed(INPUT_ACTIONS.DOWN, "player2")) this.cambiarSlot(1);

    // soltar obstáculo
    if (input.isJustPressed(INPUT_ACTIONS.EAST, "player2")) this.throwObstaculo();
  }

  move(direction) {
    const newLane = this.currentLane + direction;
    if (newLane >= 0 && newLane < this.lanes.length) {
      this.currentLane = newLane;
      this.x = this.lanes[this.currentLane];
    }
  }

  cambiarSlot(delta) {
    this.currentSlot += delta;
    if (this.currentSlot < 0) this.currentSlot = this.maxSlots - 1;
    if (this.currentSlot >= this.maxSlots) this.currentSlot = 0;
    this.actualizarTextoSlots();
  }

throwObstaculo() {
  if (this.cooldown) return;

  const obstaculo = this.slots[this.currentSlot];
  if (!obstaculo) return;

  // --- Spawnear el obstáculo ---
  this.scene.spawnObstaculo(obstaculo.tipo, this.x, this.y + 120);
  this.slots[this.currentSlot] = null;
  this.actualizarTextoSlots();

  // --- Cooldown distinto según tipo ---
  let cooldownDuracion = 300; // default (para cajas o bananas)
  if (obstaculo.tipo === Tomate) {
    cooldownDuracion = 900; // más delay si es tomate
  }

  this.cooldown = true;
  this.scene.time.delayedCall(cooldownDuracion, () => this.cooldown = false);

  // --- Cambiar automáticamente a un slot no vacío ---
  let siguienteSlot = this.slots.findIndex(s => s !== null);
  if (siguienteSlot !== -1) {
    this.currentSlot = siguienteSlot;
  }
  this.actualizarTextoSlots();

  // --- Si todos los slots están vacíos → recargar ---
  if (this.slots.every(slot => slot === null)) {
    this.scene.time.delayedCall(2000, () => this.rellenarSlots());
  }
}

  rellenarSlots() {
    const tipos = [Caja, Tomate, Banana];
    this.slots = [];
    for (let i = 0; i < this.maxSlots; i++) {
      const tipo = Phaser.Utils.Array.GetRandom(tipos);
      this.slots.push({ tipo });
    }
    this.actualizarTextoSlots();
  }

actualizarTextoSlots() {
  if (!this.scene.updateSlotUI) return;

  const slotsTexto = this.slots.map((slot, i) => {
    const nombre = slot ? slot.tipo.name : '---';
    return i === this.currentSlot ? `[${nombre}]` : nombre;
  });

  this.scene.updateSlotUI(this.currentSlot, this.slots);
}
}
