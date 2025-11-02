import path from "path";
import fs from "fs";

export function createIndexTemplate(dirPath){
const filePath = path.join(dirPath, `index.ts`);

fs.writeFileSync(filePath, 
`import { App } from "vyndra-js";

const app = new App();
app.listen(3000);`);
}
