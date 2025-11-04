import { globalRegistry } from "../core/registry.js";
import { registerQueueListeners } from "./decorators/QueueListener.js";

export async function initializeListeners() {
  for (const listenerClass of globalRegistry.listeners.values()) {
    const instance = new listenerClass();
    registerQueueListeners(instance);
  }

  console.log(`${globalRegistry.listeners.size} listeners registrados`);
}
