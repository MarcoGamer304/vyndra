export function Repository(entityClass: any): ClassDecorator {
  return function (target: any) {
    Reflect.defineMetadata("repository", true, target);

    if (!entityClass) {
      console.warn(
        `Advertencia: El repositorio "${target.name}" fue decorado con @Repository pero no se pasó una entidad.`
      );
    } else {
      Reflect.defineMetadata("entity:class", entityClass, target);
    }
  };
}