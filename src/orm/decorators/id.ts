import "reflect-metadata";
import { IdOptions } from "../types/idTypes.js";

export function Id(options?: IdOptions) {
  return function (target: any, propertyKey: string) {
    const columnName = options?.name || propertyKey;

    Reflect.defineMetadata("id", columnName, target.constructor);

    const columns = Reflect.getMetadata("columns", target.constructor) || [];

    columns.push({
      name: columnName,
      propertyKey,
      options: { type: "serial" },
    });

    Reflect.defineMetadata("columns", columns, target.constructor);
  };
}