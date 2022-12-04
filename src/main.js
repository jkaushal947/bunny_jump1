import Phaser from './lib/phaser.js'

import Start from './scenes/Start.js'
import Game from './scenes/Game.js'
import GameOver from './scenes/GameOver.js'

export default new Phaser.Game({
    type: Phaser.AUTO,
    width: 480, 
    height: 580,
    scene: [Start, Game, GameOver],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 400
            },
            debug: false
        }
    }
})
