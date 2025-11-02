import { globalRegistry } from '../registry.js';

export function Controller(prefix = '') {
  return (target: (any)) => {
     if (!globalRegistry.controllers) globalRegistry.controllers = new Map();
    Reflect.defineMetadata('prefix', prefix, target);
    globalRegistry.controllers.set(target.name, target);
  };
}