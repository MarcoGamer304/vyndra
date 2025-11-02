import fs from "fs";
import path from "path";
import { capitalize } from "./utilities.js";

export function createServiceTemplate(dirPath,module){
const filePath = path.join(dirPath, `${module.toLowerCase()}.service.ts`);

fs.writeFileSync(filePath, 
`import { AutoWired, Injectable, Publish } from "vyndra-js";
import { ${capitalize(module)}Repository } from "../repositories/${module.toLowerCase()}.repository.js";

@Injectable()
export class ${capitalize(module)}Service {
  @AutoWired
  private ${module.toLowerCase()}Repository!: ${capitalize(module)}Repository;

  async getAll() {
    const data = await this.${module.toLowerCase()}Repository.findAll();
    return data;
  }

  async get(id: number) {
    const data = await this.${module.toLowerCase()}Repository.findById(id);
    return data;
  }

  async post(body: any) {
    const data = await this.${module.toLowerCase()}Repository.save(body);
    return data;
  }

  @Publish("event")
  async update(message: string) {
    return { date: Date.now(), message };
  }
}`);
}



