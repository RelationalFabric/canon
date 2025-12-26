---
to: src/index.ts
if_exists: skip
---
export function createCanonGreeting(subject: string = '<%= name %>'): string {
  return `Canon ready for ${subject}`
}
