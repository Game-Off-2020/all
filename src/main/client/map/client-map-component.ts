import { Inject, Singleton } from 'typescript-ioc';
import { MapStore } from '../../shared/map/map-store';
import { Subject } from 'rxjs';
import { ImageUtil } from '../util/image-util';
import { SharedMapComponent } from '../../shared/map/shared-map-component';
import { Destruction } from '../../shared/map/map-model';
import { MapSprite } from './map-sprite';
import { ClientConfig } from '../config/client-config';

@Singleton
export class ClientMapComponent extends SharedMapComponent {
   protected ctx: CanvasRenderingContext2D;
   protected canvasSize: number;

   private readonly mapLoadedSubject = new Subject<HTMLCanvasElement>();
   readonly mapLoaded$ = this.mapLoadedSubject.asObservable();

   private readonly updatedSubject = new Subject<void>();
   readonly updated$ = this.updatedSubject.asObservable();
   private mapSprite: MapSprite;

   constructor(@Inject protected readonly store: MapStore) {
      super(store);
   }

   initMap(size: number, buffer: Buffer): void {
      this.canvasSize = size;
      const canvas = document.createElement('canvas') as HTMLCanvasElement;
      canvas.width = size;
      canvas.height = size;
      this.ctx = canvas.getContext('2d');

      ImageUtil.createImageFromBuffer(buffer).then((image) => {
         this.ctx.drawImage(image, 0, 0);
         this.mapLoadedSubject.next(canvas);
      });
   }

   setMapSprite(mapSprite: MapSprite): void {
      this.mapSprite = mapSprite;
   }

   drawDestruction(destruction: Destruction): void {
      super.drawDestruction(destruction);
      this.mapSprite.destructionEffect(destruction);
      this.shake(destruction);
      this.updatedSubject.next();
   }

   private shake(destruction: Destruction): void {
      if (destruction.radius > ClientConfig.SHAKE_LIMIT) {
         this.mapSprite.shake((0.0002 * destruction.radius) / ClientConfig.SHAKE_LIMIT);
      }
   }
}
