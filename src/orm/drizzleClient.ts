import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export class PGPool {
  private connectionString!: string;
  private pool?: Pool;
  private drizzleInstance?: NodePgDatabase<Record<string, unknown>> & {
    $client: Pool;
  };
  public static instance: PGPool;

  public static getInstance(): PGPool {
    if (!PGPool.instance) {
      PGPool.instance = new PGPool();
    }
    return PGPool.instance;
  }

  connectionPool(): NodePgDatabase<Record<string, unknown>> & {
    $client: Pool;
  } {
    this.configureDatabase();
    if (!this.pool) {
      if (!this.connectionString)
        throw new Error("Database URL no configurada");

      this.pool = new Pool({
        connectionString: this.connectionString,
      });
      /*
      this.pool.on("connect", () => console.log("Cliente fisico conectado al pool"));
      this.pool.on("remove", () => console.log("Cliente devuelto al pool"));*/
      this.pool.on("error", (err) => console.error("Error en pool:", err));
    }

    if (!this.drizzleInstance) {
      this.drizzleInstance = drizzle(this.pool) as NodePgDatabase<
        Record<string, unknown>
      > & { $client: Pool };
    }

    return this.drizzleInstance;
  }

  configureDatabase() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("dotenv no está disponible; no se pudo cargar .env");
    }
    this.connectionString = connectionString;
  }

  async closePool() {
    if (this.pool) {
      await this.pool.end();
      console.log("Pool de conexiones cerrado");
      this.pool = undefined;
      this.drizzleInstance = undefined;
    }
  }
}
