import { MenuButton } from '../ui/menu-button';
import { ClientConfig } from '../config/client-config';
import { Inject } from 'typescript-ioc';
import { ClientGameStateComponent } from '../game-state/client-game-state-component';
import { Keys } from '../config/client-constants';
import { StarFieldSprite } from './star-field-sprite';
import { InputBox } from '../ui/input-box';
import { TextLink } from '../ui/text-link';
import { ServerButton } from '../ui/server-button';
import { ServerHost } from '../config/common-client-config';
import { HowToPlay } from '../ui/how-to-play';

export class MainMenuScene extends Phaser.Scene {
   @Inject
   private gameState: ClientGameStateComponent;

   private selectedServer: ServerHost = ClientConfig.SERVER_HOSTS[0];
   private serverButtons: ServerButton[];
   private joinGameButton: MenuButton;
   private nameInput: InputBox;
   private enterKey: Phaser.Input.Keyboard.Key;

   constructor() {
      super({
         active: false,
         visible: false,
         key: Keys.MAIN_MENU_SCENE,
      });
   }

   create(): void {
      if (ClientConfig.AUTO_START) {
         return this.startGame();
      }

      this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

      new StarFieldSprite({ scene: this, scale: 1 });

      const logo = this.add.image(this.game.scale.width / 2, this.game.scale.height / 2 - 200, Keys.LOGO).setScale(0.4);

      const gameOffText = new TextLink({
         scene: this,
         x: this.game.scale.width - 30,
         y: this.game.scale.height - 30,
         text: 'A Game Off 2020 Entry',
         link: 'https://itch.io/jam/game-off-2020',
         origin: { x: 1, y: 1 },
         style: {
            color: '#FFF',
            fontSize: '24px',
            fontFamily: 'CactusStory',
         },
      });

      const creditsText = new TextLink({
         scene: this,
         x: 30,
         y: this.game.scale.height - 30,
         text: 'Made by Barnabas and Dolan. Source on GitHub',
         link: 'https://github.com/Game-Off-2020/the-big-cheese',
         origin: { x: 0, y: 1 },
         style: {
            color: '#FFF',
            fontSize: '24px',
            fontFamily: 'CactusStory',
         },
      });

      this.nameInput = new InputBox({
         scene: this,
         x: this.game.scale.width / 2,
         y: this.game.scale.height / 2,
         placeholder: 'Enter your name here',
         maxLength: ClientConfig.MAX_PLAYER_NAME_LENGTH,
      });

      const buttonWidth = 200;

      this.serverButtons = ClientConfig.SERVER_HOSTS.map(
         (host, i) =>
            new ServerButton({
               scene: this,
               x:
                  this.game.scale.width / 2 +
                  buttonWidth * i -
                  ((ClientConfig.SERVER_HOSTS.length - 1) * buttonWidth) / 2,
               y: this.game.scale.height / 2 + 100,
               text: host.name,
               subText: '', // '0/40',
               serverConfig: ClientConfig.SERVER_HOSTS[i],
               onClick: () => {
                  this.selectedServer = ClientConfig.SERVER_HOSTS[i];
               },
               colors: {
                  label: {
                     over: '#FFFFFF',
                     out: '#FFFFFF',
                     down: '#BBBBBB',
                  },
                  rectangle: {
                     over: 0xffffff,
                     out: 0x4287f5,
                     down: 0x444444,
                  },
               },
            }),
      );

      this.joinGameButton = new MenuButton({
         scene: this,
         x: this.game.scale.width / 2,
         y: this.game.scale.height / 2 + 200,
         text: 'Join Game',
         onClick: () => {
            if (!this.selectedServer || this.nameInput.getValue().length === 0) {
               return;
            }
            this.startGame();
         },
         colors: {
            label: {
               over: '#FFFFFF',
               out: '#FFFFFF',
               down: '#BBBBBB',
               disabled: '#FFFFFF',
            },
            rectangle: {
               over: 0xffffff,
               out: 0x4287f5,
               down: 0x444444,
               disabled: 0x888888,
            },
         },
      });

      const howToPlay = new HowToPlay(this);
      howToPlay.setVisible(false);

      const howToPlayButton = new MenuButton({
         scene: this,
         x: this.game.scale.width / 2,
         y: this.game.scale.height / 2 + 280,
         text: 'How To Play',
         onClick: () => {
            howToPlay.setVisible(true);
         },
         colors: {
            label: {
               over: '#FFFFFF',
               out: '#FFFFFF',
               down: '#BBBBBB',
               disabled: '#FFFFFF',
            },
            rectangle: {
               over: 0xffffff,
               out: 0x4287f5,
               down: 0x444444,
               disabled: 0x888888,
            },
         },
      });

      this.scale.on(
         'resize',
         (gameSize: Phaser.Structs.Size) => {
            const width = gameSize.width;
            const height = gameSize.height;

            this.cameras.resize(width, height);
            logo.setPosition(gameSize.width / 2, gameSize.height / 2 - 200);
            this.joinGameButton.setPosition(gameSize.width / 2, gameSize.height / 2 + 200);
            this.nameInput.setPosition(gameSize.width / 2, gameSize.height / 2);

            for (let i = 0; i < this.serverButtons.length; i++) {
               this.serverButtons[i].setPosition(
                  gameSize.width / 2 + buttonWidth * i - ((this.serverButtons.length - 1) * buttonWidth) / 2,
                  gameSize.height / 2 + 100,
               );
            }

            gameOffText.setPosition(gameSize.width - 30, gameSize.height - 30);
            creditsText.setPosition(30, gameSize.height - 30);
            howToPlayButton.setPosition(gameSize.width / 2, gameSize.height / 2 + 280);
         },
         this,
      );
   }

   update(): void {
      for (const button of this.serverButtons) {
         button.update(this.selectedServer);
         this.joinGameButton.update(!this.selectedServer || this.nameInput.getValue().length === 0);
      }
      this.joinGameButton.update(this.getNameInputValue().length === 0 || !this.selectedServer);

      if (this.enterKey.isDown) {
         if (!this.selectedServer || this.nameInput.getValue().length === 0) {
            return;
         }

         this.startGame();
      }
   }

   private getNameInputValue(): string {
      return this.nameInput.getValue().trim();
   }

   private startGame(): void {
      this.game.scene.stop(Keys.MAIN_MENU_SCENE);
      this.game.scene.start(Keys.LOADING_SCENE, { status });
      this.gameState.joinGame(this.nameInput.getValue(), this.selectedServer.url);
   }
}
