import { ColumnOptions } from "../types/colTypes.js";

export function Column(options: ColumnOptions = {}) {
  return function (target: any, propertyKey: string) {
    const columns = Reflect.getMetadata("columns", target.constructor) || [];
    columns.push({ name: propertyKey, options });
    Reflect.defineMetadata("columns", columns, target.constructor);
  };
}