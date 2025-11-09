import 'reflect-metadata'

const METADATA_KEY = Symbol.for('@relational-fabric/canon:meta')

export type Metadata = Record<PropertyKey, unknown>

export function meta<T extends object, M extends Metadata = Metadata>(obj: T): M {
  const existing = Reflect.getMetadata(METADATA_KEY, obj) as M | undefined
  return (existing ?? ({} as M))
}

export function withMeta<T extends object, M extends Metadata = Metadata>(obj: T, metadata: M): T {
  Reflect.defineMetadata(METADATA_KEY, metadata, obj)
  return obj
}

export function updateMeta<T extends object, M extends Metadata = Metadata>(
  obj: T,
  updater: (metadata?: M) => M | undefined,
): T {
  const current = Reflect.getMetadata(METADATA_KEY, obj) as M | undefined
  const next = updater(current)

  if (next === undefined) {
    if (Reflect.hasMetadata(METADATA_KEY, obj))
      Reflect.deleteMetadata(METADATA_KEY, obj)
  } else {
    Reflect.defineMetadata(METADATA_KEY, next, obj)
  }

  return obj
}
