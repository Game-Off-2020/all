export class CommonSharedConfig {
   static readonly NETWORK_TICK_RATE: number = 15; // Max data sync per sec
   static readonly SERVER_SOCKET_PORT: number = parseInt(process.env.PORT ?? '3000');
   static readonly MAP_OUTPUT_SCALE: number = 4; // The real canvas will be this time smaller than what we see
   static readonly BULLET_BASE_SPEED: number = (70 * 1000) / 60 / CommonSharedConfig.MAP_OUTPUT_SCALE;
   static readonly BULLET_MAX_AGE_MS: number = 3000;
   static readonly MAX_NR_OF_PLAYERS: number = 20;
   static readonly PLAYER_WIDTH: number = 10;
   static readonly PLAYER_HEIGHT: number = 20;
   static readonly RANDOM_START_POSITION: boolean = true;
   static readonly SHAKE_LIMIT: number = 46 / CommonSharedConfig.MAP_OUTPUT_SCALE;
   static readonly MOON_PERCENTAGE_TO_FINISH: number = 0.5;
   static readonly GAME_RESTART_TIME_MS: number = 10000;
   static readonly LAVA_RADIUS: number = 200;
}
