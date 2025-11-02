import fs from "fs";
import path from "path";
import { capitalize } from "./utilities.js";

export function createListenerTemplate(dirPath,module){
const filePath = path.join(dirPath, `${module.toLowerCase()}.listener.ts`);

fs.writeFileSync(filePath, 
`import { QueueListener, QueueListenerMethod } from "vyndra-js";

@QueueListener()
export class ${capitalize(module)}Listener {
  @QueueListenerMethod("event")
  handleEvent(message: any) {
    console.log(message);
  }
}
`);
}





