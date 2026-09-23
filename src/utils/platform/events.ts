/** Minimal browser EventEmitter (Node's `events` module replacement). */

type Handler = (...args: any[]) => void;

export class EventEmitter {
  private listeners = new Map<string, Set<Handler>>();

  on(event: string, handler: Handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
    return this;
  }

  addListener = this.on;

  once(event: string, handler: Handler) {
    const wrapper = (...args: any[]) => {
      this.off(event, wrapper);
      handler(...args);
    };
    return this.on(event, wrapper);
  }

  off(event: string, handler: Handler) {
    this.listeners.get(event)?.delete(handler);
    return this;
  }

  removeListener = this.off;

  removeAllListeners(event?: string) {
    if (event) this.listeners.delete(event);
    else this.listeners.clear();
    return this;
  }

  emit(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach((handler) => {
      try {
        handler(...args);
      } catch (error) {
        console.error('EventEmitter handler failed:', error);
      }
    });
    return true;
  }

  listenerCount(event: string) {
    return this.listeners.get(event)?.size ?? 0;
  }
}

export default EventEmitter;
