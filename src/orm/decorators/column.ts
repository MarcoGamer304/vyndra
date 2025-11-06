import { 
  StringColumnOptions, 
  NumberColumnOptions, 
  BooleanColumnOptions,
  DateColumnOptions,
  JsonColumnOptions,
  ArrayColumnOptions,
  EnumColumnOptions
} from "../types/colTypes.js";

export function Column(options?: StringColumnOptions): PropertyDecorator;
export function Column(options?: NumberColumnOptions): PropertyDecorator;
export function Column(options?: BooleanColumnOptions): PropertyDecorator;
export function Column(options?: DateColumnOptions): PropertyDecorator;
export function Column(options?: JsonColumnOptions): PropertyDecorator;
export function Column<T>(options?: ArrayColumnOptions<T>): PropertyDecorator;
export function Column<T extends string>(options?: EnumColumnOptions<T>): PropertyDecorator;

export function Column(options: any = {}): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const columns = Reflect.getMetadata("columns", target.constructor) || [];
    const type = Reflect.getMetadata("design:type", target, propertyKey);
    
    if (options.default !== undefined && type) {
      const typeName = type.name;
      const defaultValue = options.default;
      
      if (typeName === 'String' && typeof defaultValue !== 'string') {
        throw new Error(
          `Column '${String(propertyKey)}' is of type String but default value is ${typeof defaultValue}`
        );
      }
      if (typeName === 'Number' && typeof defaultValue !== 'number') {
        throw new Error(
          `Column '${String(propertyKey)}' is of type Number but default value is ${typeof defaultValue}`
        );
      }
      if (typeName === 'Boolean' && typeof defaultValue !== 'boolean') {
        throw new Error(
          `Column '${String(propertyKey)}' is of type Boolean but default value is ${typeof defaultValue}`
        );
      }
      if (typeName === 'Date' && !(defaultValue instanceof Date) && typeof defaultValue !== 'string') {
        throw new Error(
          `Column '${String(propertyKey)}' is of type Date but default value is not a Date instance or string`
        );
      }
    }
    
    columns.push({ 
      name: propertyKey as string, 
      options,
      type: type?.name || 'unknown'
    });
    
    Reflect.defineMetadata("columns", columns, target.constructor);
  };
}
