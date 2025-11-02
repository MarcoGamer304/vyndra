import { QueueService } from "../queue.service.js";

export function Publish(queue: string): MethodDecorator {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const res = await original.apply(this, args);
      const queueService = QueueService.getInstance();
      await queueService.publish(queue, res);
      return res;
    };
  };
}