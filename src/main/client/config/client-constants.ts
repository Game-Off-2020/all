export enum Keys {
   // Scenes
   BOOT_SCENE = 'boot-scene',
   MAIN_MENU_SCENE = 'main-menu-scene',
   GAME_SCENE = 'game-scene',
   ERROR_SCENE = 'error-scene',
   GUI_SCENE = 'gui-scene',
   SCORE_BOARD_SCENE = 'score-board-scene',
   // Game Objects
   BULLET = 'bullet',
   MOON = 'moon',
   BASIC_GUN = 'basic-gun',
   DOUBLE_BARREL = 'double-barrel',
   DOUBLE_BARREL_COLLECT = 'double-barrel-collect',
   PLAYER_1 = 'player1',
   PLAYER_1_WALK = 'player1-walk',
   PLAYER_2 = 'player2',
   PLAYER_2_WALK = 'player2-walk',
   PLAYER_3 = 'player3',
   PLAYER_3_WALK = 'player3-walk',
   GUN_SOUND_1 = 'gun-sound-1',
   GUN_SOUND_2 = 'gun-sound-2',
   GUN_SOUND_3 = 'gun-sound-3',
   GUN_SOUND_4 = 'gun-sound-4',
   MOON_DUST_PARTICLE = 'moon-dust-particle',
   MOON_AMBIENCE = 'moon-ambience',
   MOON_IMPACT = 'moon-impact',
   MOON_FULL_HUD = 'moon-full-hud',
   MOON_EMPTY_HUD = 'moon-empty-hud',
   SMOKE_FIRE = 'smoke-fire',
   TERRAIN = 'terrain',
   LAVA = 'lava',
   STAR_FIELD = 'star-field',
   CHEESE = 'cheese',
   CHEESE_GREEN = 'cheese-green',
   CHEESE_GREEN_EAT = 'cheese-green-eat',
   CHEESE_BOMB = 'cheese-bomb',
   CHEESE_BOMB_EXPLOSION = 'cheese-bomb-explosion',
   CHEESE_GLOW = 'cheese-glow',
   CHEESE_GREEN_GLOW = 'cheese-green-glow',
   CHEESE_EAT_SOUND = 'cheese-eat-sound',
   CHEESE_DOUBLE_EAT_SOUND = 'cheese-double-eat-sound',
   FLARES = 'flares',
   LAVA_SPIT = 'lava-spit',
   // UI
   LOGO = 'logo',
   SCORE_BOARD = 'score-board',
}

export interface PlayerSpriteSheetConfig {
   readonly spriteSheet: string;
   readonly walkAnimation: string;
}
