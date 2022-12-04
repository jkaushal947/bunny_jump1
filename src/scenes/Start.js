import Phaser from '../lib/phaser.js'

export default class Start extends Phaser.Scene {
    heightPoint
    carrotCollected
    text
    IsTransparencyText

    constructor() {
        super('start')
    }

    preload() {
        // load the background image
        this.load.image('background', 'assets/sprites/bg_layer1.png')
        
        // load the carrot image
        this.load.image('logo', 'assets/sprites/logo.png')

        // sound effect
        this.load.audio('background-music-start', 'assets/sfx/background_music_start_scene.mp3')
    }

    create() {
        // create background
        this.add.image(240, 320, 'background').setScrollFactor(1, 0)  

        this.IsTransparencyText = true;

        const width = this.scale.width
        const height = this.scale.height

        this.add.image(width * 0.5, height * 0.3, 'logo').setScale(1.2).setOrigin(0.5)
        
        this.add.text(width * 0.5, height * 0.6, 'Bunny Jump', 
            { 
                color: '#000', 
                fontSize: 50, 
                fontFamily: 'Patrick Hand' 
            }).setOrigin(0.5)
        this.text = this.add.text(width * 0.5, height * 0.75, 'Press SPACE to play', 
            { 
                color: '#000', 
                fontSize: 30, 
                fontFamily: 'Patrick Hand' 
            }).setOrigin(0.5)

        // background music
        this.sound.play('background-music-start', {
            loop: true
        })

        // play again by pressing space
        this.input.keyboard.once('keydown-SPACE', () => {
            this.sound.stopAll()
            this.scene.start('game')
        })

        
    }

    update() {
        if (this.IsTransparencyText)
        {
            this.text.alpha -= 0.01
        }
        else
        {
            this.text.alpha += 0.01
        }

        if (this.text.alpha <= 0.5 && this.IsTransparencyText) {
            this.IsTransparencyText = false
        }
        else if (this.text.alpha >= 1 && !this.IsTransparencyText) {
            this.IsTransparencyText = true
        }
        
    }
}