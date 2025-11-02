import { configQueue, providerType } from "../config/framework.config.js";
import { os } from "../types/OSTypes.js";
import { startQueueContainer } from "./docker.js";

export async function initQueueModule(options: {
  provider?: providerType;
  docker: { os: os };
}) {
  configQueue(options.provider);

  if (options.docker) {
    await startQueueContainer(options?.docker.os);
  }
}
