import amqplib, { ConsumeMessage } from "amqplib";

export class RabbitAdapter {
  private connection: any;
  private channel: any;

  async connect(url: string, retries = 60, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        this.connection = await amqplib.connect(url);
        this.channel = await this.connection.createChannel();
        console.log("RabbitMQ conectado");
        return;
      } catch (err) {
        if (i + 1 === retries) throw err;
        console.log(`Iniciando Contenedor timeout ${i + 1}s...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw new Error(
      "No se pudo conectar a RabbitMQ después de varios intentos"
    );
  }

  async publish(queue: string, data: any) {
    await this.channel.assertQueue(queue);
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
  }

  async consume(queue: string, handler: (data: any) => void) {
    const channel = await this.connection.createChannel();
    await channel.assertQueue(queue);
    channel.consume(queue, (msg: ConsumeMessage | null) => {
      if (!msg) return;
      const data = JSON.parse(msg.content.toString());
      handler(data);
      channel.ack(msg);
    });
  }
}
