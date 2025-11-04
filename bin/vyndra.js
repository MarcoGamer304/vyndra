#!/usr/bin/env node
import { Command } from "commander";
import fs from "fs";
import path from "path";
import { createControllerTemplate } from "./templates/template.controller.js";
import { createServiceTemplate } from "./templates/template.service.js";
import { createModelTemplate } from "./templates/template.model.js";
import { createRepositoryTemplate } from "./templates/template.repository.js";
import { createListenerTemplate } from "./templates/template.listener.js";
import { createIndexTemplate } from "./templates/template.index.ts.js";
import { createPackageJsonTemplate } from "./templates/template.package.json.js";
import { createTsConfigTemplate } from "./templates/template.tsconfig.json.js";

const osAllowed = ["windows", "linux", "mac"];

const program = new Command();
program
  .name("vyndra")
  .description("CLI oficial para proyectos VyndraJS")
  .version("1.0.0");

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Carpeta creada: ${dirPath}`);
  }
};

const templateMap = {
  controller: { folder: "controllers", method: createControllerTemplate },
  service: { folder: "services", method: createServiceTemplate },
  repository: { folder: "repositories", method: createRepositoryTemplate },
  model: { folder: "models", method: createModelTemplate },
  listener: { folder: "listeners", method: createListenerTemplate },
};

program
  .command("make:module <module>")
  .description("Crea un módulo completo con todas sus subcarpetas")
  .action((module) => {
    const srcPath = path.join(process.cwd(), "src");
    const modulesPath = path.join(srcPath, "modules");

    ensureDir(srcPath);
    ensureDir(modulesPath);

    const modulePath = path.join(modulesPath, module);
    ensureDir(modulePath);

    Object.values(templateMap).forEach((sub) => {
      const subPath = path.join(modulePath, sub.folder);
      ensureDir(subPath);
      sub.method(subPath, module);
    });

    console.log(`Módulo "${module}" creado con todas las subcarpetas`);
  });

Object.entries(templateMap).forEach(([key, value]) => {
  program
    .command(`make:${key} <module>`)
    .description(`Crea un ${key} en un módulo (lo crea si no existe)`)
    .action((module) => {
      const srcPath = path.join(process.cwd(), "src");
      const modulesPath = path.join(srcPath, "modules");

      ensureDir(srcPath);
      ensureDir(modulesPath);

      const modulePath = path.join(modulesPath, module);
      ensureDir(modulePath);

      const folderPath = path.join(modulePath, value.folder);
      ensureDir(folderPath);
      value.method(folderPath, module);

      console.log(`${key} creado en el módulo "${module}"`);
    });
});

program
  .command("create:app <project>")
  .description("Crea una nueva aplicación VyndraJS")
  .action((project) => {
    const projectPath = path.join(process.cwd(), project);

    if (fs.existsSync(projectPath)) {
      console.error(`La carpeta "${project}" ya existe.`);
      process.exit(1);
    }

    ensureDir(projectPath);

    const srcPath = path.join(projectPath, "src");
    const modulesPath = path.join(srcPath, "modules");
    ensureDir(srcPath);
    ensureDir(modulesPath);

    createIndexTemplate(srcPath, project);
    createPackageJsonTemplate(projectPath, project, "1.0.11");
    createTsConfigTemplate(projectPath, project);

    fs.writeFileSync(
      path.join(projectPath, ".gitignore"),
      "node_modules/\ndist/\n.env\n"
    );

    fs.writeFileSync(
      path.join(projectPath, "README.md"),
      `# ${project}\n\nProyecto creado con **VyndraJS** \n\nEstructura base generada automáticamente.`
    );

    fs.writeFileSync(
      path.join(projectPath, ".env"),
      [
        "DATABASE_URL=postgresql://postgres:root@localhost:5432/prueba",
        "MESSAGE_BROKER_PORT=5672",
        "MESSAGE_BROKER_HOST=amqp://localhost",
        "MESSAGE_BROKER_TIMEOUT=15000",
        "MESSAGE_BROKER_AMQP=5672",
        "MESSAGE_BROKER_MANAGEMENT=15672",
        "MESSAGE_BROKER_IMAGE=rabbitmq:3-management",
        "MESSAGE_BROKER_PROVIDER=rabbitmq",
      ].join("\n")
    );

    const modulePath = path.join(modulesPath, "user");
    ensureDir(modulePath);

    Object.values(templateMap).forEach((sub) => {
      const subPath = path.join(modulePath, sub.folder);
      ensureDir(subPath);
      sub.method(subPath, "user");
    });

    console.log(
      `Proyecto "${project}" creado correctamente con módulo "user".`
    );
    console.log(`\n Ejecuta:\n  cd ${project}\n  npm install\n  npm run dev\n`);
  });

  program
    .command("create:broker <os>")
    .description("Crea e inicia el contenedor broker, <os> 'windows' | 'linux' | 'mac'")
    .action((osType) => {
      if (osAllowed.includes(osType)) {
        startQueueContainer(osType);
      } else {
        console.error(
          `Sistema operativo no válido. Use: ${osAllowed.join(", ")}`
        );
      }
    });

program.parse(process.argv);
