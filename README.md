# Canon
The foundational library for a useful type ecosystem. It is a canonical source of truth that solves common design problems and enables seamless composition for any project.

## What is Canon

Canon is a universal type library designed to solve the fundamental **empty room problem**: how to establish a consistent set of initial design decisions across any project without unnecessary friction. Our philosophy is that a strong, canonical type system is the most useful tool for building robust, data-centric applications.

### The Philosophy

Canon provides a framework for treating types as a shared, foundational resource. By formalising a common core, it ensures that your project starts with a consistent set of high-quality, battle-tested type primitives, letting you focus on your unique business logic.

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

Using Canon is a two-step, declarative process. You define a type that extends `Canon`, providing your axioms directly in the generic type parameter. This syntax enables IDE IntelliSense to work its magic, allowing you to intuitively compose your data model from a common set of primitives.

```typescript
// 1. Define your Canon's type and augment the global registry.
// This is a type-level declaration with no runtime side effects.
declare module '@relational-fabric/canon' {
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

// 2. Register the runtime configuration for your Canon.
declareCanon({
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
```

### Sharing Canons

A core purpose of the Canon library is to enable a truly interconnected ecosystem where **type systems** are not siloed but shared and composed. A single project's canon can become a foundational building block for other applications, libraries, or services. This process is about sharing type definitions, not data.

To facilitate this, the library provides a simple pattern for exporting and registering canonical type configurations. This approach cleanly separates the definition of a canon from its consumption, ensuring that each module remains self-contained and reusable.

1.  **Define and Export**: In your module, define your canon's type and its corresponding runtime configuration. The `defineCanon` helper returns the configuration, which is then exported as a default.

    ```typescript
    // my-module/canon.ts

    import { type Canon, defineCanon } from '@relationalfabric/canon';

    export type MyCanon = Canon<{
      Id: {
        basis: { id: string };
        key: 'id';
      };
    }>;

    export default defineCanon<MyCanon>({
      axioms: {
        Id: {
          basis: { id: 'string' },
          key: 'id',
        },
      },
    });
    ```

2.  **Import and Register**: In your main application or a shared configuration file, import the types and values of the canons you need. You then augment the global `Canons` interface with their types and register their runtime values.

    ```typescript
    // main.ts

    import myCanon, { type MyCanon } from 'my-module/canon';
    import otherCanon, { type OtherCanon } from 'other-module/canon';
    import { registerCanons } from '@relationalfabric/canon';

    // Augment the global Canons interface to unify the types
    declare module '@relationalfabric/canon' {
      interface Canons {
        myCanon: MyCanon;
        otherCanon: OtherCanon;
      }
    }

    // Register the runtime values for the system to use
    registerCanons({ myCanon, otherCanon });
    ```

This pattern ensures that a canon's definition remains a single source of truth, but its identity is globally recognized, enabling seamless interoperability and semantic-level communication across different parts of your ecosystem.
