import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game(cooperativo)';
import { Versus } from './scenes/GameVersus';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { AUTO, Game } from 'phaser';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: AUTO,
    width: 1920,
    height: 1080,
    parent: 'game-container',
    backgroundColor: '#028af8',
    input: {
        gamepad: true
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        Versus,
        GameOver
    ],
    physics: {
      default: "arcade",
      arcade: {
      gravity: { y: 0 },
      debug: false,
    },
    },
    render: { 
        pixelArt: true, 
        antialias: false
    }
};

const StartGame = (parent) => {

    return new Game({ ...config, parent });

}

export default StartGame;
