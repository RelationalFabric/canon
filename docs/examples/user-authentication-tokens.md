# User Authentication Tokens

## The Story

You're building a microservices architecture where different services use different authentication mechanisms. Your API gateway needs to extract user information from JWT tokens, OAuth access tokens, and session cookies. Each has completely different structures, but you need the same business logic to work with all of them.

## The Problem

Without a unified approach, you'd need separate code paths for each token type, leading to code duplication and maintenance nightmares. Your authorization middleware becomes a mess of `if (token.type === 'jwt')` statements.

## The Canon Solution

Use the existing core axioms (`Id` and `Type`) to identify tokens, then define `Expiration` and `Permissions` axioms for the auth-specific concepts.

## The Flow

**Step 1: Decide which axioms are needed**
- `Id` and `Type` from core axioms (already provided)
- `Expiration` and `Permissions` - new axioms for auth concepts

**Step 2: Compose the Canon and register it**
```typescript
// Register only the new axioms
declare module '@relational-fabric/canon' {
  interface Axioms {
    Expiration: ExpirationAxiom;
    Permissions: PermissionsAxiom;
  }
}

// Define the canon for this example
type AuthCanon = Canon<{
  Expiration: { $basis: { expires: number }; key: 'expires'; $meta: { type: string } };
  Permissions: { $basis: { permissions: string[] }; key: 'permissions'; $meta: { type: string } };
}>;
```

**Step 3: Implement the API for the new axioms**
```typescript
function expirationOf<T extends Satisfies<'Expiration'>>(token: T): number {
  return (token as any).expires;
}

function permissionsOf<T extends Satisfies<'Permissions'>>(token: T): string[] {
  return (token as any).permissions || [];
}
```

**Step 4: The usage**
```typescript
// One function works with all token types
function isTokenValid(token: any): boolean {
  const id = idOf(token);
  const type = typeOf(token);
  const expires = expirationOf(token);
  return id && type && expires > Date.now();
}
```

## The Magic

The same authorization logic works across JWT tokens (with `sub` and `exp` fields), OAuth tokens (with `user_id` and `expires_at`), and session cookies (with `userId` and `ttl`). You write the business logic once, and it works everywhere.