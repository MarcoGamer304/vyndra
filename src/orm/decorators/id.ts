import "reflect-metadata";

export function Id() {
  return function (target: any, propertyKey: string | symbol) {
    Reflect.defineMetadata("id", propertyKey, target.constructor);
    
    const columns = Reflect.getMetadata("columns", target.constructor) || [];
    const type = Reflect.getMetadata("design:type", target, propertyKey);
    
    columns.push({ 
      name: propertyKey as string, 
      options: {},
      type: type?.name || 'unknown',
      isId: true
    });
    
    Reflect.defineMetadata("columns", columns, target.constructor);
  };
}