import * as Phaser from 'phaser';

import { ClientConfig } from '../config/client-config';
import { Keys } from '../config/client-constants';
import { PlayerScore } from '../player/scoreboard/scoreboard-model';

interface PlayerScoreRow {
   name: Phaser.GameObjects.Text;
   score: Phaser.GameObjects.Text;
}

const ROW_OFFSET_Y = 55;
const ROW_OFFSET_X = 230;
const GAME_RESTART_TIME_SECS = Math.floor(ClientConfig.GAME_RESTART_TIME_MS / 1000);

export class GameSetScoreboard extends Phaser.GameObjects.Container {
   private readonly playerScoreRows: PlayerScoreRow[];
   private readonly nextGameInText: Phaser.GameObjects.Text;
   private nextGameCounter = GAME_RESTART_TIME_SECS;

   constructor(scene: Phaser.Scene) {
      super(scene, scene.game.scale.width / 2, scene.game.scale.height / 2);

      const scoreBoard = new Phaser.GameObjects.Image(scene, 0, 0, Keys.SCORE_BOARD);
      scoreBoard.setScale(4);
      this.add(scoreBoard);

      const gameSetText = new Phaser.GameObjects.Text(scene, 0, -150, 'Game Set!', {
         color: '#FFF',
         fontSize: '100px',
         fontFamily: 'CactusStory',
         stroke: '#000000',
         strokeThickness: 8,
      });
      gameSetText.setOrigin(0.5, 1);
      this.add(gameSetText);

      this.nextGameInText = new Phaser.GameObjects.Text(scene, 0, 200, 'Next Game in 0 secs', {
         color: '#FFF',
         fontSize: '70px',
         fontFamily: 'CactusStory',
         stroke: '#000000',
         strokeThickness: 8,
      });
      this.nextGameInText.setOrigin(0.5, 0);
      this.add(this.nextGameInText);

      this.playerScoreRows = [...Array(3).keys()].map((index) => {
         return {
            name: new Phaser.GameObjects.Text(scene, -ROW_OFFSET_X, index * 70 - ROW_OFFSET_Y, '', {
               color: '#FFF',
               fontSize: '50px',
               fontFamily: 'CactusStory',
               stroke: '#000000',
               strokeThickness: 7,
            }).setOrigin(0, 0.5),
            score: new Phaser.GameObjects.Text(scene, ROW_OFFSET_X, index * 70 - ROW_OFFSET_Y, '', {
               color: '#FFF',
               fontSize: '55px',
               fontFamily: 'CactusStory',
               stroke: '#000000',
               strokeThickness: 7,
            }).setOrigin(1, 0.5),
         };
      });

      for (const row of this.playerScoreRows) {
         this.add(row.name);
         this.add(row.score);
      }

      scene.add.existing(this);

      scene.scale.on(
         'resize',
         (gameSize: Phaser.Structs.Size) => {
            this.setPosition(gameSize.width / 2, gameSize.height / 2);
         },
         this,
      );

      setInterval(() => {
         if (this.nextGameCounter <= 0) {
            return;
         }
         this.nextGameCounter--;
         this.nextGameInText.setText(`Next Game in ${this.nextGameCounter} secs`);
      }, 1000);
   }

   setScores(playerScores: PlayerScore[]): void {
      const top3Players = playerScores.slice(0, 3);

      for (let i = 0; i < top3Players.length; i++) {
         this.playerScoreRows[i].name.setText(top3Players[i].name);
         this.playerScoreRows[i].score.setText(top3Players[i].count.toString());
      }
   }

   restartTimer(): void {
      this.nextGameCounter = GAME_RESTART_TIME_SECS;
      this.nextGameInText.setText(`Next Game in ${this.nextGameCounter} secs`);
   }
}