
import fs from "fs";
import path from "path";

export function createPackageJsonTemplate(dirPath, fileName, vyndraVersion){
const filePath = path.join(dirPath,"package.json");

fs.writeFileSync(filePath, 
`{
  "name": "${fileName.toLowerCase()}",
  "version": "1.0.0",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "dev": "tsc && node dist/index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "vyndra-js": "^${vyndraVersion}"
  },
  "devDependencies": {
    "typescript": "^5.9.3"
  }
}
`);
}