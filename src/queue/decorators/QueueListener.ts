import { QueueService } from "../queue.service.js";

const listenerMethods = new Map<
  any,
  Array<{ methodName: string; queue: string }>
>();

export function QueueListenerMethod(queue: string): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (!listenerMethods.has(target.constructor)) {
      listenerMethods.set(target.constructor, []);
    }
    listenerMethods
      .get(target.constructor)!
      .push({ methodName: propertyKey.toString(), queue });
  };
}

export function registerQueueListeners(instance: any) {
  const meta = listenerMethods.get(instance.constructor);
  if (!meta) return;

  const queueService = QueueService.getInstance();
  meta.forEach(({ methodName, queue }) => {
    const handler = instance[methodName].bind(instance);
    queueService.consume(queue, handler);
  });
}