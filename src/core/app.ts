import fs from "fs";
import path from "path";
import http from "http";
import "reflect-metadata";
import { globalRegistry } from "./registry.js";
import { container } from "./container.js";
import { getRoutes } from "../routing/router.js";
import { ControllerInstance } from "./types/controllerTypes.js";
import { enhanceResponse } from "../routing/response-utils.js";
import { enhanceRequest } from "../routing/request-utils.js";
import { pathToFileURL } from "url";
import { html404 } from "../static/404.js";
import { PGPool } from "../orm/drizzleClient.js";
import "dotenv/config";
import { Middleware } from "./types/middlewareType.js";
import { Request, Response } from "../routing/types/httpTypes.js";
import { initQueueModule } from "../queue/queue.module.js";
import { os } from "../types/OSTypes.js";
import { providerType } from "../config/framework.config.js";
import { initializeListeners } from "../queue/queue.manager.js";

export class App {
  public static db = PGPool.getInstance().connectionPool();
  private middlewares: Middleware[] = [];

  constructor(options?: {
    url?: string;
    provider?: providerType;
    docker: { os: os };
  }) {
    this.init(options);
  }

  private async runMiddlewares(enhancedReq: Request, enhancedRes: Response) {
    let index = 0;
    const next = async () => {
      const middleware = this.middlewares[index++];
      if (middleware) await middleware(enhancedReq, enhancedRes, next);
    };
    await next();
  }

  private async autoImport() {
    const files = App.getAllFiles("dist");
    for (const file of files) {
      if (
        file.endsWith(".controller.ts") ||
        file.endsWith(".controller.js") ||
        file.endsWith(".service.ts") ||
        file.endsWith(".service.js")
      ) {
        await import(pathToFileURL(file).href);
      }
    }
  }

  public static getAllFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory())
        this.getAllFiles(filePath, fileList);
      else fileList.push(filePath);
    }
    return fileList;
  }

  private async importListener() {
    const files = App.getAllFiles("dist");
    for (const file of files) {
      if (file.endsWith(".listener.ts") || file.endsWith(".listener.js")) {
        await import(pathToFileURL(file).href);
      }
    }
  }

  private async init(options?: {
    provider?: providerType;
    docker: { os: os };
  }) {
    if (options?.docker) {
      await initQueueModule(options);
    }
    await this.importListener();
    await initializeListeners();
  }

  async listen(port: number) {
    await this.autoImport();
    container.initializeAll();

    const controllers: ControllerInstance[] = [
      ...globalRegistry.controllers.values(),
    ].map((ctrl) => container.resolve(ctrl));

    const server = http.createServer(async (req, res) => {
      const enhancedReq = await enhanceRequest(req);
      const enhancedRes = enhanceResponse(res);
      const url = new URL(enhancedReq.url || "", `http://${req.headers.host}`);

      try {
        await this.runMiddlewares(enhancedReq, enhancedRes);
        console.log(
          `${enhancedReq.method} ${url.pathname} - ${this.middlewares.length} middlewares ejecutados`
        );
        if (enhancedRes.writableEnded) return;

        let routeMatched = false;
        for (const ctrl of controllers) {
          const prefix = Reflect.getMetadata("prefix", ctrl.constructor) || "";
          const routes = getRoutes(ctrl);

          for (const route of routes) {
            const fullPath = prefix + route.path;

            if (
              enhancedReq.method === route.method &&
              url.pathname === fullPath
            ) {
              await ctrl[route.handler](enhancedReq, enhancedRes);
              routeMatched = true;
              break;
            }
          }
          if (routeMatched) break;
        }

        if (!routeMatched && !enhancedRes.writableEnded) {
          enhancedRes.sendHtml(html404);
        }
      } catch (err) {
        console.error("Error interno:", err);
        if (!enhancedRes.writableEnded) {
          enhancedRes.status(500).json({ error: "Internal Server Error" });
        }
      }
    });

    server.listen(port, () =>
      console.log(`Server running on http://localhost:${port}`)
    );
  }

  async use(fn: any) {
    if (typeof fn === "function" && fn.length >= 2) {
      this.middlewares.push(fn);
    } else {
      throw new Error("Tipo de módulo o middleware no soportado en app.use()");
    }
  }
}
