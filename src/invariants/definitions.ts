/**
 * Type invariants for definition and lexicon term URIs
 *
 * These compile-time assertions verify type relationships and guard against regressions.
 */

import type { Expect, IsFalse } from '../testing.js'
import type { DefinitionUri, LexiconTermUri } from '../types/index.js'
import { invariant } from '../testing.js'

invariant<Expect<'canon://theory/Identity', DefinitionUri<'theory'>>>()
invariant<IsFalse<Expect<'canon://theory/Identity', DefinitionUri<'canon'>>>>()
invariant<Expect<'canon://morphism/Identity/Taxonomy', DefinitionUri<'morphism'>>>()
invariant<Expect<'canon://lexicon/default/User', LexiconTermUri>>()
invariant<IsFalse<Expect<'canon://lexicon/other/User', LexiconTermUri>>>()
invariant<Expect<'canon://lexicon/other/User', LexiconTermUri<string>>>()
invariant<IsFalse<Expect<'canon://widget/X', DefinitionUri>>>()
