# User Authentication Tokens

## The Story

You're building a microservices architecture where different services use different authentication mechanisms. Your API gateway needs to extract user information from JWT tokens, OAuth access tokens, and session cookies. Each has completely different structures, but you need the same business logic to work with all of them.

## The Problem

Without a unified approach, you'd need separate code paths for each token type, leading to code duplication and maintenance nightmares. Your authorization middleware becomes a mess of `if (token.type === 'jwt')` statements.

## The Canon Solution

Define just three axioms for the essential concepts, then write universal auth logic.

## The Flow

Start by defining `UserIdentity`, `Expiration`, and `Permissions` axioms. These capture the core concepts you need: who the user is, when the token expires, and what they can do. Now your auth middleware can extract these values using `userIdentityOf(token)`, `expirationOf(token)`, and `permissionsOf(token)` regardless of the token format.

## The Magic

The same authorization logic works across JWT tokens (with `sub` and `exp` fields), OAuth tokens (with `user_id` and `expires_at`), and session cookies (with `userId` and `ttl`). You write the business logic once, and it works everywhere.