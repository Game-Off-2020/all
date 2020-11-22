import * as Phaser from 'phaser';
import { Subject } from 'rxjs';
import { GunSprite } from './gun-sprite';
import { VectorUtil } from '../util/vector-util';
import { ClientConfig } from '../config/client-config';
import Vector2 = Phaser.Math.Vector2;
import { Keys } from '../util/keys';

interface PlayerOptions {
   readonly scene: Phaser.Scene;
   readonly cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
   readonly callbacks: {
      readonly onGoLeft: () => void;
      readonly onGoRight: () => void;
      readonly onShoot: (position: Phaser.Math.Vector2) => void;
   };
}

export class PlayerSprite extends Phaser.GameObjects.Container {
   private prevPosition = new Vector2();
   private positionChangedSubject = new Subject<Vector2>();
   readonly positionChanged$ = this.positionChangedSubject.asObservable();
   private gun: GunSprite;
   private character: Phaser.GameObjects.Sprite;

   constructor(private readonly options: PlayerOptions) {
      super(options.scene, 0, 0);
      const config = {
         key: Keys.PLAYER_1_WALK,
         frames: options.scene.anims.generateFrameNumbers(Keys.PLAYER_1, { frames: [0, 1, 2, 6, 7, 8] }),
         frameRate: 10,
         repeat: -1,
      };
      options.scene.anims.create(config);

      this.character = options.scene.make.sprite({ key: Keys.PLAYER_1 });
      this.character.play(Keys.PLAYER_1_WALK);
      this.add(this.character);

      this.gun = new GunSprite({
         scene: options.scene,
         character: this.character,
         x: 30,
         y: -30,
      });
      this.add(this.gun);

      options.scene.add.existing(this);

      // this.add(game.make.sprite(-50, -50, 'mummy'));

      this.character.setOrigin(0.5, 1);
   }

   private lastShootTimestamp = 0;

   update(): void {
      const direction = VectorUtil.getRelativeMouseDirection(this.options.scene, this).rotate(-this.rotation);

      if (direction.x < 0) {
         this.character.flipX = true;
         this.gun.flip(true);
         this.gun.setPosition(-30, -30);
      } else {
         this.character.flipX = false;
         this.gun.flip(false);
         this.gun.setPosition(30, -30);
      }

      if (this.prevPosition.x !== this.x || this.prevPosition.y !== this.y) {
         this.prevPosition.set(this.x, this.y);
         this.positionChangedSubject.next(this.prevPosition);
      }

      if (this.options.cursorKeys.left.isDown) {
         this.character.anims.play(Keys.PLAYER_1_WALK, true);
         this.options.callbacks.onGoLeft();
      } else if (this.options.cursorKeys.right.isDown) {
         this.character.anims.play(Keys.PLAYER_1_WALK, true);
         this.options.callbacks.onGoRight();
      } else {
         this.character.anims.pause();
      }

      if (this.scene.input.activePointer.isDown) {
         if (Date.now() > this.lastShootTimestamp + ClientConfig.SHOOT_INTERVAL) {
            this.lastShootTimestamp = Date.now();
            const gunPosition = new Vector2({ x: this.x, y: this.y }).add(
               new Vector2({ x: this.gun.x, y: this.gun.y }).rotate(this.rotation),
            );
            this.options.callbacks.onShoot(gunPosition);
         }
      }

      this.gun.update();
   }
}
