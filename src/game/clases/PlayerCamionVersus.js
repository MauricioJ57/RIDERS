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

  // --- Vibración del motor ---
this.scene.tweens.add({
  targets: this,
  y: this.y + 2,        // lo mueve 2 píxeles hacia abajo
  duration: 80,         // velocidad de la vibración
  yoyo: true,           // vuelve a su posición original
  repeat: -1,           // infinito
  ease: 'Sine.easeInOut' // movimiento suave
});


  // slots de inventario
  this.maxSlots = 4;
  this.slots = [];
  this.currentSlot = 0;

  // para controlar el ritmo del spawn
  this.cooldown = false;

  // === Crear contenedor visual de slots ===
  this.slotIcons = [];
// === Posición base: esquina superior derecha ===
const slotSize = 90;
const margin = 5;
const startX = scene.scale.width - (this.maxSlots * (slotSize + margin)) - 40; // 40px desde el borde derecho
const startY = 60; // 60px desde el borde superior

  for (let i = 0; i < this.maxSlots; i++) {
    // fondo del slot
//const slotSize = 90; // tamaño total del slot
const iconSize = 30; // tamaño del ícono dentro del slot
const spacing = 10;  // espacio entre slots

const slotBg = scene.add.rectangle(startX + i * (slotSize + spacing), startY, slotSize, slotSize, 0x000000)
  .setStrokeStyle(3, 0xffffff)
  .setOrigin(0.5);

// ícono
const icon = scene.add.image(slotBg.x, slotBg.y, 'iconVacio').setDisplaySize(iconSize, iconSize);
    this.slotIcons.push({ bg: slotBg, icon });
  }

  // === Inicializar los slots con obstáculos random (después de crear íconos) ===
  this.rellenarSlots();
}

  update() {
    const input = this.scene.inputSystem;

    // movimiento lateral (player2)
    if (input.isJustPressed(INPUT_ACTIONS.LEFT, "player2")) this.move(-1);
    if (input.isJustPressed(INPUT_ACTIONS.RIGHT, "player2")) this.move(1);

    // cambiar slot
    //if (input.isJustPressed(INPUT_ACTIONS.UP, "player2")) this.cambiarSlot(-1);
    if (input.isJustPressed(INPUT_ACTIONS.NORTH, "player2")) this.cambiarSlot(1);

    // soltar obstáculo
    if (input.isJustPressed(INPUT_ACTIONS.WEST, "player2")) this.throwObstaculo();
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
this.actualizarSlotsVisuales();
  }

throwObstaculo() {
  if (this.cooldown) return;

  const obstaculo = this.slots[this.currentSlot];
  if (!obstaculo) return;

  // --- Spawnear el obstáculo ---
  this.scene.spawnObstaculo(obstaculo.tipo, this.x, this.y + 120);
  this.slots[this.currentSlot] = null;
this.actualizarSlotsVisuales();

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
this.actualizarSlotsVisuales();

  // --- Si todos los slots están vacíos → recargar ---
  if (this.slots.every(slot => slot === null)) {
    this.scene.time.delayedCall(100, () => this.rellenarSlots());
  }
}

  rellenarSlots() {
    const tipos = [Caja, Tomate, Banana];
    this.slots = [];
    for (let i = 0; i < this.maxSlots; i++) {
      const tipo = Phaser.Utils.Array.GetRandom(tipos);
      this.slots.push({ tipo });
    }
this.actualizarSlotsVisuales();
  }

actualizarSlotsVisuales() {
  for (let i = 0; i < this.maxSlots; i++) {
    const slot = this.slots[i];
    const { bg, icon } = this.slotIcons[i];

    // Borde amarillo si está seleccionado
    if (i === this.currentSlot) bg.setStrokeStyle(3, 0xffff00);
    else bg.setStrokeStyle(2, 0xffffff);

    // Mostrar icono según el tipo de obstáculo
    if (slot && slot.tipo) {
      let textureKey;
      if (slot.tipo === Caja) textureKey = 'caja_icon';
      else if (slot.tipo === Tomate) textureKey = 'tomates_icon';
      else if (slot.tipo === Banana) textureKey = 'bananas_icon';

      icon.setTexture(textureKey);
      icon.setVisible(true);
    } else {
      icon.setVisible(false);
    }
  }
}
}
