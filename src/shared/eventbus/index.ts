import { Bus, EventBus, EventMap } from "@/models";

export function eventbus<E extends EventMap>(config?: {
  onError: (...params: any[]) => void,
}): EventBus<E> {
  const bus: Partial<Bus<E>> = {};

  const off: EventBus<E>["off"] = (key, handler) => {
    const index = bus[key]?.indexOf(handler);
    if (index >= 0) {
      bus[key]?.splice(index, 1);
    }
  };
  const on: EventBus<E>["on"] = (key, handler) => {
    if (bus[key] === undefined) {
      bus[key] = [];
    }
    bus[key]?.push(handler);
    return () => {
      off(key, handler);
    }
  };
  const emit: EventBus<E>["emit"] = (key, payload) => {
    bus[key]?.forEach(fn => {
      try {
        fn(payload);
      } catch (e) {
        config?.onError(e);
      }
    })
  };
  const once: EventBus<E>["once"] = (key, handler) => {
    const handleOnce = (payload: Parameters<typeof handler>) => {
      handler(payload);
      off(key, handleOnce as typeof handler);
    };
    on(key, handleOnce as typeof handler);
  };

  return { on, off, once, emit };
}