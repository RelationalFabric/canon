# Canon Examples

This directory contains examples demonstrating how Canon solves real problems developers face when working with multiple libraries and data sources. Like Clojure's seq abstraction, Canon provides a small interface (axioms) that enables universal operations across diverse data structures.

## Examples Overview

### [User Authentication Tokens](./user-authentication-tokens.md)
**Focus**: Universal authentication across JWT, OAuth, and session cookies
- Shows how to extract user identity, expiration, and permissions from any token type
- Demonstrates the power of small, focused axioms for common problems
- Perfect for microservices and API gateways

### [Deduplicating Entities](./deduplicating-entities.md)
**Focus**: Finding duplicates across heterogeneous data sources
- Shows how to identify the same logical entity across different formats
- Demonstrates universal deduplication without complex mapping logic
- Perfect for search results, data aggregation, and reporting

## The Canon Approach

Each example follows the same pattern:
1. **The Story** - A real problem developers face
2. **The Problem** - Why traditional approaches fail
3. **The Canon Solution** - How axioms solve it elegantly
4. **The Flow** - The step-by-step approach
5. **The Magic** - The universal code that works everywhere

## Key Patterns

### Small Interfaces
Like Clojure's seq, Canon uses small, focused axioms that capture essential concepts.

### Universal Operations
Write business logic once, works across all data sources and formats.

### No Type Conversion
Work with original data structures directly through axioms.

### Format Independence
The same code works with REST APIs, JSON-LD, databases, and any other source.

## Next Steps

These examples will be implemented as working code in the codebase. Each demonstrates how Canon's axiom system enables universal operations across diverse data sources - just like how Clojure's seq abstraction enables universal operations on any collection.