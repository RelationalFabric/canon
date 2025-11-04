import { type Expect, invariant, type IsFalse } from '@relational-fabric/canon'

// ---------------------------------------------------------------------------
// Example 01 – Basic Id Axiom
// ---------------------------------------------------------------------------

interface BasicInternalEntity {
  id: string
  name: string
}

void invariant<Expect<BasicInternalEntity['id'], string>>()
void invariant<IsFalse<Expect<BasicInternalEntity['name'], number>>>()

// ---------------------------------------------------------------------------
// Example 02 – MongoDB Canon Module
// ---------------------------------------------------------------------------

interface MongoDbDocument {
  _id: string
  title: string
}

void invariant<Expect<MongoDbDocument['_id'], string>>()

// ---------------------------------------------------------------------------
// Example 03 – Multi-Axiom Canon
// ---------------------------------------------------------------------------

interface ComprehensiveEntity {
  id: string
  type: string
  version: number
}

void invariant<Expect<ComprehensiveEntity['version'], number>>()

// ---------------------------------------------------------------------------
// Example 04 – Format Conversion
// ---------------------------------------------------------------------------

interface RestApiUser {
  id: string
  type: string
}

void invariant<Expect<RestApiUser['type'], string>>()

// ---------------------------------------------------------------------------
// Example 05 – Error Handling
// ---------------------------------------------------------------------------

interface ValidEntity {
  id: string
  version: number
}

void invariant<Expect<ValidEntity['version'], number>>()

// ---------------------------------------------------------------------------
// Example 06 – Real World Business Scenarios
// ---------------------------------------------------------------------------

interface SampleOrder {
  id: string
  status: 'pending' | 'processing' | 'shipped'
}

void invariant<Expect<SampleOrder['status'], 'pending' | 'processing' | 'shipped'>>()

// ---------------------------------------------------------------------------
// Example 07 – Custom Axioms
// ---------------------------------------------------------------------------

interface Priority {
  level: number
  label: string
}

interface CustomEntity {
  status: 'active' | 'inactive'
  priority: Priority
}

void invariant<Expect<CustomEntity['priority'], Priority>>()
