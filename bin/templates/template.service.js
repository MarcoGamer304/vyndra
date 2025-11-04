import fs from "fs";
import path from "path";
import { capitalize } from "./utilities.js";

export function createServiceTemplate(dirPath,module){
const filePath = path.join(dirPath, `${module.toLowerCase()}.service.ts`);

fs.writeFileSync(filePath, 
`import { AutoWired, Injectable, Publish } from "vyndra-js";
import { ${capitalize(module)}Repository } from "../repositories/${module.toLowerCase()}.repository.js";
import { ${capitalize(module)} } from "../models/${module.toLowerCase()}.model.js";

@Injectable()
export class ${capitalize(module)}Service {
  @AutoWired
  private ${module.toLowerCase()}Repository!: ${capitalize(module)}Repository;

  async getAll() {
    const data = await this.${module.toLowerCase()}Repository.findAll();
    return data;
  }

  async getById(id: number) {
    const data = await this.${module.toLowerCase()}Repository.findById(id);
    return data;
  }

  async getByField(field: keyof ${capitalize(module)}, value: any) {
    const data = await this.${module.toLowerCase()}Repository.findByField(field, value);
    return data;
  }

  async post(body: ${capitalize(module)}) {
    const data = await this.${module.toLowerCase()}Repository.save(body);
    return data;
  }

  async update(id: number, body: ${capitalize(module)}) {
    const data = await this.${module.toLowerCase()}Repository.update(id, body);
    return data;
  }

  async delete(id: number) {
    const data = await this.${module.toLowerCase()}Repository.delete(id);
    return data;
  }

  @Publish("event")
  async event(message: string) {
    return { date: Date.now(), message };
  }
}`);
}



