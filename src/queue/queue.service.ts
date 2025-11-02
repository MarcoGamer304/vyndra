import { FrameworkConfig } from "../config/framework.config.js";
import { RabbitAdapter } from "./adapters/rabbit.adapter.js";
import { isExist } from "./docker.js";

export class QueueService {
  private static instance: QueueService;
  private adapter: any;
  private connected = false;
  private isRemote = false;

  private constructor() {
    const provider = FrameworkConfig.queue.provider;
    this.adapter =
      provider === "rabbitmq" ? new RabbitAdapter() : new RabbitAdapter();

    const url = FrameworkConfig.queue.connection?.url || "";
    this.isRemote = this.detectRemote(url);
  }

  static getInstance() {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  private detectRemote(url: string): boolean {
    try {
      const host = new URL(url).hostname;
      return !["localhost", "127.0.0.1", "host.docker.internal"].includes(host);
    } catch {
      return false;
    }
  }

  async connect() {
    if (this.connected) {
      console.log("RabbitMQ ya conectado, usando conexión existente");
      return;
    }
    const url = FrameworkConfig.queue.connection?.url;
    if (!url) {
      throw new Error(
        "No se ha definido FrameworkConfig.queue.connection.url"
      );
    }

    if (this.isRemote) {
      console.log(`Conectando a RabbitMQ remoto en ${url}`);
      await this.adapter.connect(url);
      this.connected = true;
      console.log("RabbitMQ remoto conectado correctamente");
    } else {
      if (!(await isExist())) {
        throw new Error(
          "El contenedor RabbitMQ no existe. Proporcione 'provider' y 'os' en el constructor de App() para crear uno automáticamente."
        );
      }
      console.log("Conectando a RabbitMQ local (contenedor o host)...");
      await this.adapter.connect(url);
      this.connected = true;
      console.log("RabbitMQ local conectado correctamente");
    }
  }

  async publish(queue: string, data: any) {
    if (!this.connected) await this.connect();
    return this.adapter.publish(queue, data);
  }

  async consume(queue: string, handler: (data: any) => void) {
    if (!this.connected) await this.connect();
    return this.adapter.consume(queue, handler);
  }
}
