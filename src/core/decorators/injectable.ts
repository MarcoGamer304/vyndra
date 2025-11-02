import { globalRegistry } from '../registry.js';

export function Injectable(): ClassDecorator {
  return (target: any) => {
    if (!globalRegistry.services) globalRegistry.services = new Map();
    globalRegistry.services.set(target.name, target);
  };
}

export function AutoWired(target: any, key: string) {
  if (!target.__autowired) target.__autowired = [];
  target.__autowired.push(key);
}