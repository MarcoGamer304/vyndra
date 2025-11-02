export function Entity(tableName: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    Reflect.defineMetadata("table:name", tableName, constructor);
    Reflect.defineMetadata("entity:class", constructor, constructor);

    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        const init = args[0];
        if (init && typeof init === "object") {
          Object.assign(this, init);
        }
      }
    };
  };
}
