import { eq } from "drizzle-orm";
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

  async findAll(): Promise<T[]> {
    const rows = await this.db.select().from(this.table);
    return rows.map((row) => new this.entityClass(row));
  }

  async findById(id: number): Promise<T | null> {
    const idField = Reflect.getMetadata("id", this.entityClass);
    const idColumn = (this.table as any)[idField];

    const rows = await this.db
      .select()
      .from(this.table)
      .where(eq(idColumn, id));

    if (rows.length === 0) return null;
    return new this.entityClass(rows[0]);
  }
  async save(entity: T): Promise<T> {
    const data = { ...entity };
    delete (data as any).id;

    const [result] = (await this.db
      .insert(this.table)
      .values(data)
      .returning()) as T[];
    return new this.entityClass(result);
  }
}
