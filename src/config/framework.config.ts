export type providerType = "rabbitmq";

let providerConfig: providerType = "rabbitmq";

export function configQueue(provider?: providerType) {
  if (provider) {
    providerConfig = provider;
  }
}

export const FrameworkConfig = {
  queue: {
    enabled: true,
    get provider() {
      return providerConfig;
    },
    docker: true,
    get image() {
      return process.env.MESSAGE_BROKER_IMAGE ?? "rabbitmq:3-management";
    },
    ports: {
      get amqp() {
        return process.env.MESSAGE_BROKER_AMQP ?? 5672;
      },
      get management() {
        return process.env.MESSAGE_BROKER_MANAGEMENT ?? 15672;
      },
    },
    connection: {
      get url() {
        return process.env.MESSAGE_BROKER_HOST ?? "amqp://localhost";
      },
    },
  },
};
