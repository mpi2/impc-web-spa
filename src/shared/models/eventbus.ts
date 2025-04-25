export type EventKey = string | symbol;
export type EventHandler<T = any> = (payload: T) => void;
export type EventMap = Record<EventKey, EventHandler>;
export interface EventBus<T extends EventMap> {
  on<Key extends keyof T>(key: Key, handler: T[Key]): () => void;
  off<Key extends keyof T>(key: Key, handler: T[Key]): void;
  emit<Key extends keyof T>(key: Key, ...payload: Parameters<T[Key]>): void;
  once<Key extends keyof T>(key: Key, handler: T[Key]): void;
}
export type Bus<E> = Record<keyof E, E[keyof E][]>;