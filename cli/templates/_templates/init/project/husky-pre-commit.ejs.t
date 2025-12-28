---
to: .husky/pre-commit
if_exists: skip
---
npm run check:lint:fix
