import fs from "fs";
import path from "path";

export function createTsConfigTemplate(dirPath){
const filePath = path.join(dirPath, `tsconfig.json`);

fs.writeFileSync(filePath, 
`{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",

    "moduleResolution": "NodeNext",
    "esModuleInterop": true,

    "strict": true,
    "noImplicitAny": true,
    "skipLibCheck": true,              
    "noUnusedLocals": false,
    "noUnusedParameters": false,

    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
  }
}`);
}
