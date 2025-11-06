import { eq, sql } from "drizzle-orm";
import { generateSchemaFromEntity } from "./entityMapper.js";
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

    const existsResult = await this.db.execute(
      sql.raw(`SELECT to_regclass('public."${tableName}"') AS exists;`)
    );

    const tableExists =
      Array.isArray(existsResult.rows) &&
      existsResult.rows.length > 0 &&
      existsResult.rows[0].exists !== null;

    if (tableExists) {
      return;
    }

    const columns = Object.values(this.table[Symbol.for("drizzle:Columns")])
      .map((col: any) => {
        const name = `"${col.name}"`;

        let sqlType = "TEXT";
        switch (col.columnType) {
          case "PgSerial":
            sqlType = "SERIAL";
            break;
          case "PgVarchar":
            sqlType = `VARCHAR(${col.length || 255})`;
            break;
          case "PgInteger":
            sqlType = "INTEGER";
            break;
          case "PgSmallInt":
            sqlType = "SMALLINT";
            break;
          case "PgBigInt":
            sqlType = "BIGINT";
            break;
          case "PgBoolean":
            sqlType = "BOOLEAN";
            break;
          case "PgTimestamp":
            sqlType = "TIMESTAMP";
            break;
          case "PgNumeric":
            if (col.precision && col.scale) {
              sqlType = `NUMERIC(${col.precision}, ${col.scale})`;
            } else {
              sqlType = "NUMERIC";
            }
            break;
          case "PgJson":
            sqlType = "JSON";
            break;
          case "PgJsonb":
            sqlType = "JSONB";
            break;
          case "PgText":
            sqlType = "TEXT";
            break;
        }

        const notNull = col.notNull || col.primary ? "NOT NULL" : "";
        const unique = col.unique || col.uniqueFlag ? "UNIQUE" : "";
        const primary = col.primary ? "PRIMARY KEY" : "";

        let defaultValue = "";
        if (col.default !== undefined && col.default !== null) {
          const def = col.default;
          if (def instanceof Date) {
            defaultValue = `DEFAULT '${def.toISOString()}'`;
          } else if (typeof def === "string") {
            defaultValue = `DEFAULT '${def.replace(/'/g, "''")}'`;
          } else {
            defaultValue = `DEFAULT ${def}`;
          }
        }

        return [name, sqlType, notNull, unique, defaultValue, primary]
          .filter(Boolean)
          .join(" ");
      })
      .join(",\n  ");

    const createTableSQL = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${columns}\n);`;
    console.log("Creating table if not exists:", createTableSQL);
    await this.db.execute(sql.raw(createTableSQL));
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
    return rows.length > 0 ? new this.entityClass(rows[0]) : null;
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

    for (const [key, value] of Object.entries(data)) {
      const type = Reflect.getMetadata(
        "design:type",
        this.entityClass.prototype,
        key
      );
      if (type && type.name === "Date" && typeof value === "string") {
        (data as any)[key] = new Date(value);
      }
    }

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
    return rows.length > 0 ? new this.entityClass(rows[0]) : null;
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

  async query(
    queryText: string,
    params?: any[] | Record<string, any>
  ): Promise<any[]> {
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
