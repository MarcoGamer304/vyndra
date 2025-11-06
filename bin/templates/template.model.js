import fs from "fs";
import path from "path";
import { capitalize } from "./utilities.js";

export function createModelTemplate(dirPath,module){
const filePath = path.join(dirPath, `${module.toLowerCase()}.model.ts`);

fs.writeFileSync(filePath, 
`import { Entity, Id, Column } from "vyndra-js";

@Entity("${module.toLowerCase()}")
export class ${capitalize(module)} {
  @Id()
  id!: number;

  @Column({ length: 255, notNull: true })
  name!: string;

  @Column({ default: true })
  isValid!: boolean;

  @Column({withTimezone: true})
  createdAt!: Date;

  @Column({ mode: 'jsonb' })
  settings!: any;
}`);
}



