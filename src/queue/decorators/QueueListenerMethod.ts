import { globalRegistry } from "../../core/registry.js";

export function QueueListener(): ClassDecorator {
  return (target: any) => {
    if (globalRegistry.listeners.has(target.name)) return;
    globalRegistry.listeners.set(target.name, target);
  };
}
