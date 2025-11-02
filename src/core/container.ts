import { globalRegistry } from "./registry.js";

export class Container {
  private instances = new Map<any, any>();

  resolve<T>(target: new (...args: any[]) => T): T {
    if (this.instances.has(target)) return this.instances.get(target);

    const isRepository = Reflect.getMetadata("repository", target);
    const entityClass = Reflect.getMetadata("entity:class", target);

    const paramTypes: any[] =
      Reflect.getMetadata("design:paramtypes", target) || [];
    const constructorParams = paramTypes.map((type) => {
      const serviceConstructor = globalRegistry.services.get(type.name);
      if (!serviceConstructor) {
        throw new Error(`${type.name} no está registrado como @Injectable`);
      }
      return this.resolve(serviceConstructor);
    });

    let instance: any;

    if (isRepository) {
      if (!entityClass) {
        throw new Error(
          `El repositorio "${target.name}" fue decorado con @Repository pero no tiene entidad asociada.\n` +
            `Usa @Repository(MiEntidad).`
        );
      }

      instance = new target(entityClass, ...constructorParams);
    } else {
      instance = new target(...constructorParams);
    }

    const autowiredProps: string[] = target.prototype.__autowired || [];
    for (const key of autowiredProps) {
      const type = Reflect.getMetadata("design:type", target.prototype, key);
      const serviceConstructor = globalRegistry.services.get(type.name);
      if (!serviceConstructor) {
        throw new Error(`${type.name} no está registrado como @Injectable`);
      }
      (instance as any)[key] = this.resolve(serviceConstructor);
    }

    this.instances.set(target, instance);
    return instance;
  }

  initializeAll() {
    for (const [, ServiceClass] of globalRegistry.services) {
      this.resolve(ServiceClass);
    }

    for (const [, ControllerClass] of globalRegistry.controllers) {
      this.resolve(ControllerClass);
    }
  }
}

export const container = new Container();
