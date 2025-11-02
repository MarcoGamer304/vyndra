import fs from "fs";
import path from "path";
import { capitalize } from "./utilities.js";

export function createControllerTemplate(dirPath,module){
const filePath = path.join(dirPath, `${module}.controller.ts`);

fs.writeFileSync(filePath, 
`import { Controller, Get, Post, Response, Request, AutoWired } from "vyndra-js";
import { ${capitalize(module)}Service } from "../services/${module.toLowerCase()}.service.js";

@Controller("/${module.toLowerCase()}")
export class ${capitalize(module)}Controller {
  @AutoWired
  private ${module.toLowerCase()}Service!: ${capitalize(module)}Service;

  @Get("/")
  async get(req: Request, res: Response) {
    try {
      const result = await this.${module.toLowerCase()}Service.get(Number(req.query?.id));
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  @Get("/all")
  async getAll(req: Request, res: Response) {
    try {
      res.status(200).json(await this.${module.toLowerCase()}Service.getAll());
    } catch (error) {
      res.status(500).json(error);
    }
  }

  @Post("/")
  async post(req: Request, res: Response) {
    try {
      res.status(200).json(await this.${module.toLowerCase()}Service.post(req.body));
    } catch (error) {
      res.status(500).json(error);
    }
  }

  @Post("/all")
  async update(req: Request, res: Response) {
    try {
      res.status(200).json(await this.${module.toLowerCase()}Service.update(String(req.query?.message)));
    } catch (error) {
      res.status(500).json(error);
    }
  }
}`);
}



