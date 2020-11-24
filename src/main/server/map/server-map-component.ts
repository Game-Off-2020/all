import { Inject, Singleton } from 'typescript-ioc';
import { Canvas, CanvasRenderingContext2D, createCanvas } from 'canvas';
import { SharedMapComponent } from '../../shared/map/shared-map-component';
import { MapStore } from '../../shared/map/map-store';
import { Destruction } from '../../shared/map/map-model';
import { Utils } from '../../shared/util/utils';
import { Vector } from '../../shared/bullet/vector-model';
import { PerlinNoise } from './perlin-noise';
import { ServerConfig } from '../config/server-config';
import { Subject } from 'rxjs';

@Singleton
export class ServerMapComponent extends SharedMapComponent {
   private canvas: Canvas;
   protected ctx: CanvasRenderingContext2D;
   private data?: DataView;
   private maxMoonPixels: number;
   private moonPixels = 0;

   private readonly moonPercentageChangeSubject = new Subject<number>();
   readonly moonPercentageChange$ = this.moonPercentageChangeSubject.asObservable();

   constructor(@Inject protected readonly store: MapStore) {
      super(store);
   }

   createMap(radius: number): void {
      this.canvasSize = (radius * 2) / ServerConfig.MAP_OUTPUT_SCALE;
      this.canvas = createCanvas(this.canvasSize, this.canvasSize);
      this.ctx = this.canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;

      // Base cirlce
      this.ctx.fillStyle = '#ff0000';
      this.aliasedCircle(this.ctx, this.canvasSize / 2, this.canvasSize / 2, this.canvasSize / 2);
      this.ctx.fill();

      // Perlin Noise
      const perlinNoise = new PerlinNoise();
      const noiseCanvas = perlinNoise.generate(this.canvasSize / 30);
      const noiseWidth = noiseCanvas.width;
      const noiseHeight = noiseCanvas.height;
      const resizedNoiseCanvas = createCanvas(this.canvasSize, this.canvasSize);
      const resizedNoiseCtx = resizedNoiseCanvas.getContext('2d');
      resizedNoiseCtx.drawImage(
         noiseCanvas,
         0,
         0,
         noiseWidth,
         noiseHeight,
         0,
         0,
         resizedNoiseCanvas.width,
         resizedNoiseCanvas.height,
      );

      // Mask noise canvas
      const targetView = new DataView(this.ctx.getImageData(0, 0, this.canvasSize, this.canvasSize).data.buffer);
      const maskView = new DataView(resizedNoiseCtx.getImageData(0, 0, this.canvasSize, this.canvasSize).data.buffer);

      const MASK_THRESHOLD = 128; // 0-255
      for (let y = 0; y < this.canvasSize; y++) {
         for (let x = 0; x < this.canvasSize; x++) {
            const offset = 4 * (x + y * this.canvasSize);
            const brightness = (maskView.getUint32(offset) >> 24) & 0xff; // Red channel
            if (brightness < MASK_THRESHOLD) {
               targetView.setUint32(offset, 0);
            }
         }
      }

      // Draw masked moon
      const imageData = this.ctx.createImageData(this.canvasSize, this.canvasSize);
      imageData.data.set(new Uint8ClampedArray(targetView.buffer));
      this.ctx.putImageData(imageData, 0, 0);

      // Moon inner circle
      this.ctx.closePath();
      this.ctx.beginPath();
      this.ctx.fillStyle = '#ff0000';
      this.aliasedCircle(this.ctx, this.canvasSize / 2, this.canvasSize / 2, Math.floor(this.canvasSize / 2 / 1.1));
      this.ctx.fill();

      // fs.writeFileSync('perlin.png', this.canvas.toBuffer());
      // console.log('ok');

      // Add some cheese for testing purposes
      // for (let i = 0; i < 200; i++) {
      //    const position = this.getRandomPositionAboveSurface(Math.random() * 20 - 10);
      //    this.cheese.add(position.x, position.y);
      // }
      this.updateData();
      this.maxMoonPixels = this.getMoonPixelCount();
   }

   getMap(): Buffer {
      return this.canvas.toBuffer();
   }

   getCanvasSize(): number {
      return this.canvasSize;
   }

   updateData(): void {
      this.data = new DataView(this.ctx.getImageData(0, 0, this.canvasSize, this.canvasSize).data.buffer);
   }

   updateMoonPixelPercentage(): void {
      const moonPixels = this.getMoonPixelCount() / this.maxMoonPixels;
      if (this.moonPixels !== moonPixels) {
         this.moonPixels = moonPixels;
         this.moonPercentageChangeSubject.next(moonPixels);
      }
   }

   //

   getRandomPositionAboveSurface(elevation: number): Vector {
      const angle = ServerConfig.RANDOM_START_POSITION ? Math.random() * Math.PI * 2 : 0;
      const radius = this.canvasSize / 2 + elevation;
      return {
         x: Math.cos(angle) * radius,
         y: Math.sin(angle) * radius,
      };
   }

   destruct(destruction: Destruction): void {
      this.store.commit(Utils.generateId(), {
         position: destruction.position,
         radius: destruction.radius,
      });
   }

   raycast(x1: number, y1: number, x2: number, y2: number): [number, number] | null {
      // Naive line drawing algorithm see
      // https://www.geeksforgeeks.org/dda-line-generation-algorithm-computer-graphics/
      const dx = x2 - x1;
      const dy = y2 - y1;
      const steps = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);
      const Xinc = dx / steps;
      const Yinc = dy / steps;
      let X = x1;
      let Y = y1;
      for (let i = 0; i <= steps; i++) {
         if (this.hits(X, Y)) {
            return [X, Y];
         }
         X += Xinc;
         Y += Yinc;
      }
      return null;
   }

   private hits(x: number, y: number): boolean {
      return this.getPixelAlpha(x, y) > 0;
   }

   private getPixelAlpha(x: number, y: number): number {
      x = this.toLocalCanvas(x);
      y = this.toLocalCanvas(y);
      if (Math.abs(x) >= this.canvasSize || Math.abs(y) >= this.canvasSize || x < 0 || y < 0) {
         return 0;
      }
      const pixelValue = this.data.getUint32(4 * (x + y * this.canvasSize));
      // See other values here
      // https://stackoverflow.com/questions/17945972/converting-rgba-values-into-one-integer-in-javascript
      return ((pixelValue & 0xff000000) >>> 24) / 255;
   }

   private getMoonPixelCount(): number {
      let result = 0;
      for (let i = 0; i < this.canvasSize * this.canvasSize; i++) {
         if ((this.data.getUint32(4 * i) & 0xff000000) >>> 24 > 0) {
            result++;
         }
      }
      return result;
   }
}
