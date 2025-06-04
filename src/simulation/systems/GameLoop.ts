// GameLoop.ts
import { eventBus } from '../../communication/EventBus';
import { FrameUpdateEvent } from '../../communication/events/FrameUpdateEvent';
import { gameSettings } from '../components/gameSettings';

export class GameLoop {
  private lastTime: number = 0;
  private accumulator: number = 0;

  start(): void {
    this.lastTime = performance.now();
    this.update();
  }

  private update(): void {
    const fixedDeltaTime = 1 / 60;
    const currentTime = performance.now();
    this.accumulator += (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    while (this.accumulator >= fixedDeltaTime) {
      // Adjust the fixed delta time by the time scale
      const scaledDeltaTime = fixedDeltaTime * gameSettings.timeScale;
      // Emit the frame update event with fixed delta time
      eventBus.emit(FrameUpdateEvent, scaledDeltaTime);
      this.accumulator -= fixedDeltaTime;
    }

    requestAnimationFrame(this.update.bind(this));
  }
}

export const gameLoop = new GameLoop();
