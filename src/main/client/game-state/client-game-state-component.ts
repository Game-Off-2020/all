import { Inject, Singleton } from 'typescript-ioc';
import { Observable, Subject } from 'rxjs';
import { JoinRequest } from '../../shared/network/shared-network-model';
import { GameStateStore } from '../../shared/game-state/game-state-store';
import { GamePhase, GameState } from '../../shared/game-state/game-state-model';
import { filter, map } from 'rxjs/operators';

@Singleton
export class ClientGameStateComponent {
   private gameStartedSubject = new Subject<JoinRequest>();
   readonly joinGame$ = this.gameStartedSubject.asObservable();
   private readonly updated$: Observable<GameState>;
   readonly startPlaying$: Observable<void>;
   readonly finished$: Observable<void>;
   readonly moonPercentageChanged$: Observable<number>;

   constructor(@Inject private readonly store: GameStateStore) {
      this.updated$ = store.onUpdatedId(GameStateStore.ENTITY_ID);
      this.startPlaying$ = this.updated$.pipe(
         filter((state) => state.phase === GamePhase.PLAYING),
         map(() => null),
      );
      this.finished$ = this.updated$.pipe(
         filter((state) => state.phase === GamePhase.FINISHED),
         map(() => null),
      );
      this.moonPercentageChanged$ = this.updated$.pipe(
         filter((state) => state.moonPercentage !== undefined),
         map((state) => state.moonPercentage),
      );
   }

   joinGame(userName: string, host: string): void {
      this.gameStartedSubject.next({ userName, host });
   }

   leaveGame(): void {
      document.location.reload();
   }
}
