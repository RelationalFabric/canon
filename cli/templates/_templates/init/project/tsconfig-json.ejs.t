---
to: tsconfig.json
if_exists: skip
---
{
  "extends": "@relational-fabric/canon/tsconfig",
  "compilerOptions": {
    "outDir": "./.build",
    "rootDir": "./src"
  },
  "include": ["src"]
}
