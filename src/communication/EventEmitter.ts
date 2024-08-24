export class EventEmitter<T> {
    private listeners: Map<EventCallback<T>, any> = new Map();

    emit(event: T): void {
        this.listeners.forEach((target, callback) => callback.call(target, event));
    }

    subscribe(callback: EventCallback<T>, target?: any): void {
        this.listeners.set(callback, target);
    }

    unsubscribe(callback: EventCallback<T>): void {
        this.listeners.delete(callback);
    }

    hasSubscribers(): boolean {
        return this.listeners.size > 0;
    }

    removeAllListeners(target: any): void {
        this.listeners.forEach((listenerTarget, callback) => {
            if (listenerTarget === target) {
                this.listeners.delete(callback);
            }
        });
    }
}