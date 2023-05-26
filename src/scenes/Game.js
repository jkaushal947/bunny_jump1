import Phaser from '../lib/phaser.js'
import Carrot from '../game/Carrot.js'

export default class Game extends Phaser.Scene {
    /** @type {Phaser.Physics.Arcade.Sprite} */
    player
    platforms
    carrots
    cursors
    carrotCollected
    carrotCollectedText
    heightPoint
    lastHeight
    heightPointText

    constructor() {
        super('game')
    }

    init() {
        this.carrotCollected = 0
        this.heightPoint = 0
        this.lastHeight = 320
    }

    preload() {
        // load the background image
        this.load.image('background', 'assets/sprites/bg_layer1.png')

        // load the platform image
        this.load.image('platform', 'assets/sprites/ground_grass_1.png')

        // load the bunny image
        this.load.image('bunny-stand', 'assets/sprites/bunny2_stand.png')
        this.load.image('bunny-jump', 'assets/sprites/bunny2_jump.png')

        // load the carrot image
        this.load.image('carrot', 'assets/sprites/carrot_1.png')

        //load effect
        this.load.atlas('megaset', 'assets/megaset-0.png', 'assets/megaset-0.json')

        // get key down
        this.cursors = this.input.keyboard.createCursorKeys()

        // sound effect
        this.load.audio('jump', 'assets/sfx/jump.ogg')
        this.load.audio('collect-carrot', 'assets/sfx/collect_carrot.ogg')
        this.load.audio('background-music-play', 'assets/sfx/background_music_play_scene.mp3')
    }

    create() {
        // background music
        this.sound.play('background-music-play', {
            loop: true
        })

        // create background
        this.add.image(240, 320, 'background').setScrollFactor(1, 0)

        // creat platforms
        this.platforms = this.physics.add.staticGroup()

        for (let i = 0; i < 5; ++i) {
            const x = Phaser.Math.Between(80, 400)
            const y = 150 * i

            /** @type {Phaser.Physics.Arcade.Sprite} */
            const platform = this.platforms.create(x, y, 'platform')
            platform.scale = 0.5

            /** @type {Phaser.Physics.Arcade.StaticBody} */
            const body = platform.body
            body.updateFromGameObject()
        }

        // create bunny - the player
        this.player = this.physics.add.sprite(240, this.lastHeight, 'bunny-stand').setScale(0.5)

        // create a carrot
        this.carrots = this.physics.add.group({
            classType: Carrot
        })
        this.physics.add.collider(this.platforms, this.carrots)

        // formatted this qay to make it easier to read
        this.physics.add.overlap(
            this.player,
            this.carrots,
            this.handleCollectCarrot, // called on overlap
            undefined,
            this
        )

        this.player.body.checkCollision.up = false
        this.player.body.checkCollision.left = false
        this.player.body.checkCollision.right = false

        // add collision detection
        this.physics.add.collider(
            this.platforms,
            this.player,
            () => {
                if (!this.player.body.touching.down) return

                // velocity
                this.player.setVelocityY(-460)

                // jumping animation
                this.player.setTexture('bunny-jump')

                // jumping sound effect
                this.sound.play('jump')
            },
            undefined,
            this
        )

        // camera follow
        this.cameras.main.startFollow(this.player)

        // set the horizontal dead zone to 1.5x game width
        this.cameras.main.setDeadzone(this.scale.width * 1.5, this.scale.height * 0.5)

        // render the score
        this.add.image(20, 35, 'carrot').setScale(0.5).setScrollFactor(1, 0).setOrigin(0, 0.5)
        const style = {
            color: '#000',
            fontSize: 32,
            fontFamily: 'Patrick Hand'
        }
        this.carrotCollectedText = this.add.text(58, 35, ' × 0', style)
            .setScrollFactor(0)
            .setOrigin(0, 0.5)

        this.heightPointText = this.add.text(460, 35, this.heightPoint + ' m', style)
            .setScrollFactor(0)
            .setOrigin(1, 0.5)
    }

    update(time, deltaTime) {
        this.platforms.children.iterate(child => {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const platform = child

            const scrollY = this.cameras.main.scrollY

            if (platform.y >= scrollY + 700) {
                platform.y = scrollY - 60 //Phaser.Math.Between(50, 70)
                platform.body.updateFromGameObject()

                // randomly create or not a carrot above the platform being reused
                var rate = Phaser.Math.Between(0, 10)
                if (rate >= 2) {
                    this.addCarrotAbove(platform)
                }
            }
        })

        // stand animation
        const vy = this.player.body.velocity.y
        if (vy > 0 && this.player.texture.key !== 'bunny-stand')
            this.player.setTexture('bunny-stand')

        // left and right input logic
        if (this.cursors.left.isDown && !this.player.body.touching.down) {
            this.player.setVelocityX(-200)
        } else if (this.cursors.right.isDown && !this.player.body.touching.down) {
            this.player.setVelocityX(200)
        } else {
            this.player.setVelocityX(0)
        }

        this.horizontalWrap(this.player)


        // update height 
        if (this.player.y < this.lastHeight) {
            this.heightPoint += Math.round((this.lastHeight - this.player.y) / 4)
            this.lastHeight = this.player.y
            this.heightPointText.text = this.heightPoint + ' m'
        }

        // Show an alert modal when score reaches 20
        if (this.carrotCollected === 20) {
            this.sound.stopAll()
            this.scene.start('win', {
                heightPoint: this.heightPoint,
                carrotCollected: this.carrotCollected
            })
        }

        // check Game Over
        const bottomPlatform = this.findBottomMostPlatform()
        if (this.player.y > bottomPlatform.y + 300) {
            this.sound.stopAll()
            this.scene.start('game-over', {
                heightPoint: this.heightPoint,
                carrotCollected: this.carrotCollected
            })
        }
    }

    // wrap the player in the world
    // if he goes out of the left side, put him on the right side
    // and so on with right side
    horizontalWrap(sprite) {
        const halfWidth = sprite.displayWidth * 0.5
        const gameWidth = this.scale.width
        if (sprite.x < -halfWidth) {
            sprite.x = gameWidth + halfWidth
        } else if (sprite.x > gameWidth + halfWidth) {
            sprite.x = -halfWidth
        }
    }

    /**
     * @param {Phaser.GameObjects.Sprite} sprite
     */
    addCarrotAbove(sprite) {
        const y = sprite.y - sprite.displayHeight

        /** @type {Phaser.Physics.Arcade.Sprite} */
        const carrot = this.carrots.get(sprite.x, y, 'carrot')

        carrot.setActive(true)
        carrot.setVisible(true)

        this.add.existing(carrot)

        // update the physics body size
        carrot.body.setSize(carrot.width, carrot.height)

        // enable the body in the physics world
        this.physics.world.enable(carrot)

        return carrot
    }

    /**
     * @param {Phaser.Physics.Arcade.Sprite} player
     * @param {Carrot} carrot
     */

    handleCollectCarrot(player, carrot) {

        const emitter = this.add.particles('megaset', [
            {
                frame: 'red_ball',
                x: carrot.body.position.x,
                y: carrot.body.position.y,
                angle: {
                    min: 180,
                    max: 360
                },
                speed: 200,
                autoRound: 2,
                gravityY: -350,
                lifespan: 3000,
                frequency: -1,
                quantity: 4,
                scale: {
                    min: 0.1,
                    max: 1
                }
        }
    ])

        emitter.emitParticle(20, carrot.body.position.x, carrot.body.position.y);

        // hide from display
        this.carrots.killAndHide(carrot)

        // disable from physics world
        this.physics.world.disableBody(carrot.body)

        // increment by 1
        this.carrotCollected++

        // update the score
        //124, 20, ' × 0', style
        const value = ` × ${this.carrotCollected}`
        this.carrotCollectedText.text = value

        // sound effect
        this.sound.play('collect-carrot')

    }

    // find the bottom most platform 
    findBottomMostPlatform() {
        const platforms = this.platforms.getChildren()
        let bottomPlatform = platforms[0]

        for (let i = 1; i < platforms.length; ++i) {
            const platform = platforms[i]

            if (platform.y > bottomPlatform.y) {
                bottomPlatform = platform
            }
        }

        return bottomPlatform
    }
}
