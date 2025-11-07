/**
 * Canon Registry
 *
 * Class for storing and managing canon configurations.
 */

import type { CanonConfig, Canons } from './types/index.js'

/**
 * Canon Registry class
 *
 * Stores canon configurations. Axioms are defined within canons.
 */
export class Registry {
  private canons = new Map<string, CanonConfig>()

  /**
   * Register a canon
   */
  register<Label extends keyof Canons>(label: Label, config: CanonConfig): void {
    this.canons.set(label as string, config)
  }

  /**
   * Get a canon configuration by label
   */
  get(label: string): CanonConfig | undefined {
    return this.canons.get(label)
  }

  /**
   * Get all registered canon configurations
   */
  values(): IterableIterator<CanonConfig> {
    return this.canons.values()
  }

  /**
   * Make registry iterable - iterates over canon configs
   */
  *[Symbol.iterator](): Iterator<CanonConfig> {
    yield * this.canons.values()
  }

  /**
   * Check if a canon is registered
   */
  has(label: string): boolean {
    return this.canons.has(label)
  }

  /**
   * Get the number of registered canons
   */
  get size(): number {
    return this.canons.size
  }

  /**
   * Clear all registered canons
   */
  clear(): void {
    this.canons.clear()
  }
}

/**
 * Create a new empty registry
 */
export function createRegistry(): Registry {
  return new Registry()
}
