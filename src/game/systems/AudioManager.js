// AudioManager.js
export default class AudioManager {
  static currentMusic = null; // Guarda la música que esté sonando actualmente

  static playMusic(scene, key, volume = 0.6, loop = true) {
    // Si ya hay música sonando, la frenamos con un fade out
    if (AudioManager.currentMusic) {
      scene.tweens.add({
        targets: AudioManager.currentMusic,
        volume: 0,
        duration: 500,
        onComplete: () => {
          AudioManager.currentMusic.stop();
          AudioManager.currentMusic.destroy();
          AudioManager._startNewMusic(scene, key, volume, loop);
        }
      });
    } else {
      AudioManager._startNewMusic(scene, key, volume, loop);
    }
  }

  static _startNewMusic(scene, key, volume, loop) {
    const music = scene.sound.add(key, { volume, loop });
    AudioManager.currentMusic = music;

    // En navegadores donde el audio se bloquea hasta que el usuario interactúe
    if (!scene.sound.locked) {
      music.play();
    } else {
      scene.sound.once(Phaser.Sound.Events.UNLOCKED, () => music.play());
    }
  }

  static stopMusic(scene) {
    if (AudioManager.currentMusic) {
      scene.tweens.add({
        targets: AudioManager.currentMusic,
        volume: 0,
        duration: 500,
        onComplete: () => {
          AudioManager.currentMusic.stop();
          AudioManager.currentMusic.destroy();
          AudioManager.currentMusic = null;
        }
      });
    }
  }

  static playSFX(scene, key, volume = 1) {
    scene.sound.play(key, { volume });
  }
}
