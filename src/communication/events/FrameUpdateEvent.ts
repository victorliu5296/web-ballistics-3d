// FrameUpdateEvent.ts
export class FrameUpdateEvent {
    constructor(public deltaTime: number) {}
}

export const frameUpdateEvent = new FrameUpdateEvent(0);