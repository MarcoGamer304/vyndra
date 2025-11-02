import fs from "fs";
import path from "path";
import { capitalize } from "./utilities.js";

export function createModelTemplate(dirPath,module){
const filePath = path.join(dirPath, `${module.toLowerCase()}.model.ts`);

fs.writeFileSync(filePath, 
`import { Entity, Id, Column } from "vyndra-js";

@Entity("${module.toLowerCase()}s")
export class ${capitalize(module)} {
  @Id()
  id!: number;

  @Column({length: 255})
  name!: string

  @Column({length: 255})
  email!: string
}`);
}



