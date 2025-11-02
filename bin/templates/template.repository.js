import fs from "fs";
import path from "path";
import { capitalize } from "./utilities.js";

export function createRepositoryTemplate(dirPath,module){
const filePath = path.join(dirPath, `${module.toLowerCase()}.repository.ts`);

fs.writeFileSync(filePath, 
`import { CrudRepository, Injectable, Repository } from "vyndra-js";
import { ${capitalize(module)} } from "../models/${module.toLowerCase()}.model.js";

@Repository(${capitalize(module)})
@Injectable()
export class ${capitalize(module)}Repository extends CrudRepository<${capitalize(module)}> {}`);
}
