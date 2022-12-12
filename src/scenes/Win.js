import Phaser from '../lib/phaser.js'

export default class Win extends Phaser.Scene {
    heightPoint
    carrotCollected
    text
    IsTransparencyText

    constructor() {
        super('win')
    }

    init (data) {
        this.heightPoint = (data.heightPoint == null) ? 0 : data.heightPoint
        this.carrotCollected = (data.carrotCollected == null) ? 0 : data.carrotCollected
    }

    preload() {
        // load the background image
        this.load.image('background', 'assets/sprites/bg_layer1.png')

        // load the carrot image
        this.load.image('carrot', 'assets/sprites/carrot_1.png')

        // sound effect
        this.load.audio('win', 'assets/sfx/win.wav')        
        this.load.audio('background-music-win-scene', 'assets/sfx/win.mp3')    
    }

    create() {
        // sound 
        this.sound.play('win')
        this.sound.play('background-music-win-scene', {
            loop: true
        })

        // create background
        this.add.image(240, 320, 'background').setScrollFactor(1, 0)  

        this.IsTransparencyText = true;

        const width = this.scale.width
        const height = this.scale.height

        this.add.text(width * 0.5, height * 0.2, 'Height: ' + this.heightPoint + ' m', 
        { 
            color: '#000', 
            fontSize: 56, 
            fontFamily: 'Patrick Hand' 
        }).setOrigin(0.5)

        
        this.add.image(width * 0.3, height * 0.4, 'carrot')
                .setScale(0.8)
                .setOrigin(0, 0.5) 

        this.add.text(width * 0.3 + 60, height * 0.4, ' × ' + this.carrotCollected, 
        { 
            color: '#000', 
            fontSize: 44, 
            fontFamily: 'Patrick Hand' 
        }).setOrigin(0, 0.5)
        
        this.add.text(width * 0.5, height * 0.6, 'You win!', 
            { 
                color: '#000', 
                fontSize: 50, 
                fontFamily: 'Patrick Hand' 
            }).setOrigin(0.5)
        this.text = this.add.text(width * 0.5, height * 0.75, 'Press SPACE to play again', 
            { 
                color: '#000', 
                fontSize: 30, 
                fontFamily: 'Patrick Hand' 
            }).setOrigin(0.5)

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