# Canon
The foundational library for a useful type ecosystem. It is a canonical source of truth that solves common design problems and enables seamless composition for any project.

## What is Canon

Canon is a universal type library designed to solve the fundamental **empty room problem**: how to establish a consistent set of initial design decisions across any project without unnecessary friction. Our philosophy is that a strong, canonical type system is the most useful tool for building robust, data-centric applications.

### The Philosophy

Canon provides a framework for treating types as a shared, foundational resource. By formalizing a common core, it ensures that your project starts with a consistent set of high-quality, battle-tested type primitives, letting you focus on your unique business logic.

- **Composition as a Core Principle**: Canon is a universal adapter. We deliberately compose and re-export a curated set of high-quality type primitives from the broader TypeScript ecosystem, in their entirety. You get a single, authoritative source for common types without having to manage a "laundry list" of dependencies. This is what makes Canon truly useful; it provides a coherent toolkit assembled from the best available parts. The libraries we plan to compose include:
    - **Utility Types**: As well as our ow, we'll include`type-fest`, `ts-essentials`
    - **Identity**: `uuid`, `nano id`
    - **Hashing**: `object-hash`
    - **Immutability**: `immutable.js`
- **Axiomatic Primitives**: A `Canon` is a type that defines its data model using a predefined set of universal axioms. Each axiom has a rich configuration that includes:
    - `basis`: The underlying TypeScript type.
    - `key`: The canonical name for the most important field.
    - `meta`: An extensible type that defines the metadata for the axiom.
- **Lazy Types**: A `Canon` is a type blueprint that can be defined once and be universally understood, regardless of where or when it is consumed. This enables a form of "lazy typing," where the full details of a type can be deferred, yet its canonical identity remains constant. The `canon` key serves as the type system's **discriminator**, allowing it to correctly identify and apply the correct type to a given configuration.

### Usage

Using Canon is a single, declarative step. You define a type that extends `Canon`, providing your axioms directly in the generic type parameter. This syntax enables IDE IntelliSense to work its magic, allowing you to intuitively compose your data model from a common set of primitives.

```typescript
// 1. Define your Canon's type and augment the global registry.
// This is a type-level declaration with no runtime side effects.
declare module '@canon/core' {
  interface Canons {
    myProject: Canon<{
      Id: {
        basis: { id: string };
        key: 'id';
        meta: { type: 'uuid' };
      };
      type: {
        basis: { type: string };
        key: 'type';
        meta: { description: string };
      };
      version: {
        basis: { version: number };
        key: 'version';
      };
    }>;
  }
}

// 2. Define your Canon's runtime configuration using a helper.
// This is a runtime function that returns a value and is type-safe.
const myProjectCanon = defineCanon<keyof Canons>({
  canon: 'myProject',
  axioms: {
    Id: {
      basis: { id: 'string' },
      key: 'id',
      meta: { type: 'uuid' },
    },
    type: {
      basis: { type: 'string' },
      key: 'type',
      meta: { description: '...' },
    },
    version: {
      basis: { version: 'number' },
      key: 'version',
    },
  },
});
