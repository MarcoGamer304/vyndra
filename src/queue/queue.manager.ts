import { globalRegistry } from "../core/registry.js";
import { registerQueueListeners } from "./decorators/QueueListener.js";
import { QueueService } from "./queue.service.js";

export async function initializeListeners() {
  const queueService = QueueService.getInstance();
  await queueService.connect(); 

  for (const listenerClass of globalRegistry.listeners.values()) {
    const instance = new listenerClass();
    registerQueueListeners(instance);
  }

  console.log(`${globalRegistry.listeners.size} listeners registrados`);
}
