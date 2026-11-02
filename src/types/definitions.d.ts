/**
 * The kind of definition a definition URI names.
 */
export type DefinitionKind = 'canon' | 'axiom' | 'theory' | 'morphism'

/**
 * A definition's formal identity is a URI that says what kind of definition sits at that location (ADR-0017).
 * A Morphism's name is the path `<Source>/<Target>`.
 */
export type DefinitionUri<K extends DefinitionKind = DefinitionKind, N extends string = string> = `canon://${K}/${N}`

/**
 * A lexicon term URI. A lexicon name defaults to `default`.
 */
export type LexiconTermUri<L extends string = 'default', T extends string = string> = `canon://lexicon/${L}/${T}`
