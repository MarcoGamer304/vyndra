import { Docker } from "node-docker-api";
import { FrameworkConfig } from "../config/framework.config.js";
import { os } from "../types/OSTypes.js";

export async function startQueueContainer(os: os = "windows") {
  if (!FrameworkConfig.queue.docker) return;

  const docker = new Docker(
    os === "windows"
      ? { host: "http://localhost", port: 2375 }
      : { socketPath: "/var/run/docker.sock" }
  );
  const { image, ports } = FrameworkConfig.queue;

  const containers = (await docker.container.list({ all: true })) as any[];
  const existingContainer = containers.find((c) =>
    c.data.Names?.includes("/vyndra-js_rabbit")
  );

  if (existingContainer) {
    console.log("Contenedor RabbitMQ ya existe");

    const container = docker.container.get(existingContainer.id);

    if (existingContainer.data.State !== "running") {
      console.log("Iniciando contenedor detenido...");
      await container.start();
    } else {
      console.log("Contenedor ya está corriendo");
    }
    return;
  }

  const exists = containers.some((c) => c.data.Image.includes(image));
  if (exists) return console.log("RabbitMQ ya está corriendo");

  const images = (await docker.image.list()) as any[];
  const imageExists = images.some((i) => i.data.RepoTags?.includes(image));

  if (!imageExists) {
    console.log(
      `Descargando imagen ${image}... espere hasta que este completamente descargada`
    );
    const stream = (await docker.image.create({}, { fromImage: image })) as any;

    await new Promise<void>((resolve, reject) => {
      stream.on("data", (chunk: any) => process.stdout.write(chunk.toString()));
      stream.on("end", resolve);
      stream.on("error", reject);
    });

    console.log(`Imagen ${image} descargada`);
  }

  const container = (await docker.container.create({
    Image: image,
    name: "vyndra-js_rabbit",
    HostConfig: {
      PortBindings: {
        "5672/tcp": [{ HostPort: ports.amqp.toString() }],
        "15672/tcp": [{ HostPort: ports.management.toString() }],
      },
    },
  })) as any;

  await container.start();
  console.log(`RabbitMQ iniciado en http://localhost:${ports.management}`);
}

export async function isExist(os: os = "windows") {
  if (!FrameworkConfig.queue.docker) return false;

  const docker = new Docker(
    os === "windows"
      ? { host: "http://localhost", port: 2375 }
      : { socketPath: "/var/run/docker.sock" }
  );

  const containers = (await docker.container.list({ all: true })) as any[];
  const existingContainer = containers.find((c) =>
    c.data.Names?.includes("/vyndra-js_rabbit")
  );

  if (!existingContainer) {
    return false;
  }

  return true
}
