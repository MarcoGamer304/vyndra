import { eq, sql } from "drizzle-orm";
import { generateSchemaFromEntity } from "./entityMapper.js";
import { Pool } from "pg";
import { App } from "../core/app.js";

export class CrudRepository<T extends { id: any }> {
  public table: any;
  protected db = App.db;

  constructor(private readonly entityClass: new (init?: Partial<T>) => T) {
    this.table = generateSchemaFromEntity(this.entityClass);
    this.ensureTableExists();
  }

  private async ensureTableExists() {
    const tableName = this.table[Symbol.for("drizzle:Name")];

    const columns = Object.values(this.table[Symbol.for("drizzle:Columns")])
      .map((col: any) => {
        let sqlType = "TEXT";
        if (col.columnType === "PgSerial") sqlType = "SERIAL";
        else if (col.columnType === "PgVarchar")
          sqlType = `VARCHAR(${col.length})`;

        const unique = col.unique ? "UNIQUE" : "";
        const primary = col.primary ? "PRIMARY KEY" : "";
        const notNull = col.notNull || col.primary ? "NOT NULL" : "";
        const defaultValue =
          col.default !== undefined ? `DEFAULT '${col.default}'` : "";

        return `"${col.name}" ${sqlType} ${notNull} ${unique} ${defaultValue} ${primary}`.trim();
      })
      .join(", ");

    const createTableSQL = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columns});`;
    await this.db.execute(createTableSQL);
  }

  private unwrapRows(result: any): any[] {
    if (result && typeof result === "object" && "rows" in result) {
      return result.rows;
    }
    if (Array.isArray(result)) {
      return result;
    }
    return [];
  }

  async findAll(): Promise<T[]> {
    const result = await this.db.select().from(this.table);
    const rows = this.unwrapRows(result);
    return rows.map((row) => new this.entityClass(row));
  }

  async findById(id: number): Promise<T | null> {
    const idField = Reflect.getMetadata("id", this.entityClass);
    const idColumn = (this.table as any)[idField];

    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(idColumn, id));

    const rows = this.unwrapRows(result);
    if (rows.length === 0) return null;
    return new this.entityClass(rows[0]);
  }

  async findByField(field: keyof T, value: any): Promise<T[]> {
    const column = (this.table as any)[field];
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(column, value));
    const rows = this.unwrapRows(result);
    return rows.map((r) => new this.entityClass(r));
  }

  async save(entity: T): Promise<T> {
    const data = { ...entity };
    delete (data as any).id;

    const result = await this.db.insert(this.table).values(data).returning();
    const rows = this.unwrapRows(result);
    return new this.entityClass(rows[0]);
  }

  async update(id: number, partial: Partial<T>): Promise<T | null> {
    const idField = Reflect.getMetadata("id", this.entityClass);
    const idColumn = (this.table as any)[idField];

    const result = await this.db
      .update(this.table)
      .set(partial)
      .where(eq(idColumn, id))
      .returning();

    const rows = this.unwrapRows(result);
    if (rows.length === 0) return null;
    return new this.entityClass(rows[0]);
  }

  async delete(id: number): Promise<boolean> {
    const idField = Reflect.getMetadata("id", this.entityClass);
    const idColumn = (this.table as any)[idField];

    const result = await this.db
      .delete(this.table)
      .where(eq(idColumn, id))
      .returning();

    const rows = this.unwrapRows(result);
    return rows.length > 0;
  }

  async query(queryText: string, params?: any[] | Record<string, any>): Promise<any[]> {
  let finalQuery = queryText;

  if (Array.isArray(params)) {
    params.forEach((p, i) => {
      const safeValue =
        typeof p === "string"
          ? `'${p.replace(/'/g, "''")}'`
          : p?.toString() ?? "NULL";
      finalQuery = finalQuery.replace(`$${i + 1}`, safeValue);
    });
  } else if (typeof params === "object" && params !== null) {
    for (const [key, rawValue] of Object.entries(params)) {
      const safeValue =
        typeof rawValue === "string"
          ? `'${rawValue.replace(/'/g, "''")}'`
          : rawValue?.toString() ?? "NULL";
      const regex = new RegExp(`:${key}\\b`, "g");
      finalQuery = finalQuery.replace(regex, safeValue);
    }
  }

  const result = await this.db.execute(sql.raw(finalQuery));
  return this.unwrapRows(result);
}
}
