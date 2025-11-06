import { 
  pgTable, 
  serial, 
  integer,
  smallint,
  bigint,
  varchar, 
  text, 
  boolean,
  timestamp,
  json,
  jsonb,
  numeric,
} from "drizzle-orm/pg-core";

export function generateSchemaFromEntity(entityClass: any) {
  const tableName = Reflect.getMetadata("table:name", entityClass);
  const columns = Reflect.getMetadata("columns", entityClass) || [];
  const idField = Reflect.getMetadata("id", entityClass);

  const schema: Record<string, any> = {};

  for (const col of columns) {
    const opts = col.options || {};
    let column: any;

    if (col.name === idField || col.isId) {
      if (col.type === 'Number') {
        column = serial(col.name).primaryKey();
      } else if (col.type === 'String') {
        column = varchar(col.name, { length: opts.length || 255 })
          .primaryKey();
      } else {
        column = serial(col.name).primaryKey();
      }
      schema[col.name] = column;
      continue;
    }

    switch (col.type) {
      case 'String':
        if (opts.length) {
          column = varchar(col.name, { length: opts.length });
        } else {
          column = text(col.name);
        }
        break;
      
      case 'Number':
        if (opts.precision !== undefined && opts.scale !== undefined) {
          column = numeric(col.name, { precision: opts.precision, scale: opts.scale });
        } else if (opts.type === 'smallint') {
          column = smallint(col.name);
        } else if (opts.type === 'bigint') {
          column = bigint(col.name, { mode: 'number' });
        } else {
          column = integer(col.name);
        }
        break;
      
      case 'Boolean':
        column = boolean(col.name);
        break;
      
      case 'Date':
        const timestampOpts: any = {};
        if (opts.mode) timestampOpts.mode = opts.mode;
        if (opts.withTimezone !== undefined) timestampOpts.withTimezone = opts.withTimezone;
        if (opts.precision !== undefined) timestampOpts.precision = opts.precision;
        
        column = timestamp(col.name, timestampOpts);
        break;
      
      case 'Object':
        if (opts.mode === 'jsonb') {
          column = jsonb(col.name);
        } else {
          column = json(col.name);
        }
        break;
      
      case 'Array':
        const itemType = opts.itemType || 'text';
        switch (itemType) {
          case 'integer':
            column = integer(col.name).array();
            break;
          case 'boolean':
            column = boolean(col.name).array();
            break;
          default:
            column = text(col.name).array();
        }
        break;
      
      default:
        column = text(col.name);
    }

    if (opts.default !== undefined) {
      column = column.default(opts.default);
    }
    
    if (opts.notNull === true) {
      column = column.notNull();
    }
    
    if (opts.unique === true) {
      column = column.unique();
      column.uniqueFlag = true;
    }

    schema[col.name] = column;
  }

  return pgTable(tableName, schema);
}