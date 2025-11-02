import { pgTable, serial, varchar, text } from "drizzle-orm/pg-core";

export function generateSchemaFromEntity(entityClass: any) {
  const tableName = Reflect.getMetadata("table:name", entityClass);
  const columns = Reflect.getMetadata("columns", entityClass) || [];
  const idField = Reflect.getMetadata("id", entityClass);

  const schema: Record<string, any> = {};

  for (const col of columns) {
    const opts = col.options || {};

    if (col.name === idField) {
      schema[col.name] = serial(col.name).primaryKey();
      continue;
    }

    let column;
    if (opts.length) column = varchar(col.name, { length: opts.length });
    else column = text(col.name);

    if (opts.notNull) column = column.notNull();
    if (opts.unique) column = column.unique();
    if (opts.default !== undefined) column = column.default(opts.default);

    schema[col.name] = column;
  }

  return pgTable(tableName, schema);
}