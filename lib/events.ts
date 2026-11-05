import { EventEmitter } from 'events';

declare global {
  var messageEmitter: EventEmitter | undefined;
}

export const emitter = globalThis.messageEmitter || new EventEmitter();
if (process.env.NODE_ENV !== 'production') globalThis.messageEmitter = emitter;