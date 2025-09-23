# Canon Examples: A Complete Workflow

## Overview

This document walks through a complete, real-world example of using Canon's core axioms. We'll build a user management system that works seamlessly across different data formats (REST APIs, MongoDB, JSON-LD) using a single, universal codebase.

## The Scenario

Imagine you're building a user management system that needs to:
- Handle users from multiple data sources with different formats
- Support optimistic concurrency control
- Provide audit logging
- Work with relationships between entities

Without Canon, you'd need format-specific code for each data source. With Canon, you write universal code that works across all formats.

## Step 1: Setting Up Core Axioms

First, we need to register the core axioms that our application will use. These define the semantic concepts we'll work with.

```typescript
// Register core axioms for our application
declare module '@relational-fabric/canon' {
  interface Axioms {
    Id: KeyNameAxiom;
    Type: KeyNameAxiom;
    Version: KeyNameAxiom;
    Timestamps: TimestampsAxiom;
    References: ReferencesAxiom;
  }
}
```

## Step 2: Defining Conversion Types

We need to define the types that our axioms will convert to. These represent the "standard" format for our application.

```typescript
// Define conversion types for our application
type TimestampType = Date;
type ReferenceType = string;
```

## Step 3: Creating Our Data Models

Now let's define our application's data models using the core axioms. We'll create a User model that can work with different data formats.

```typescript
import type { Satisfies } from '@relational-fabric/canon';

// Our User model that works with any data format
type User = {
  id: string;
  type: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  roleId: string;
} & Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps' | 'References'>;

// Define application-specific types
interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface AuditLog {
  entityId: string;
  action: string;
  timestamp: Date;
  createdAt: Date;
}

interface ResolvedUser extends User {
  role?: {
    id: string;
    name: string;
    permissions: string[];
  };
}
```

## Step 4: Building Universal Services

Now we'll create services that work with any data format using the core axioms.

### User Service

```typescript
import { idOf, typeOf, versionOf, timestampsOf, referencesOf } from '@relational-fabric/canon';
import type { Satisfies } from '@relational-fabric/canon';

class UserService {
  private users: User[] = [];

  // Create a new user - works with any format
  async createUser<T extends Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps'>>(
    userData: T
  ): Promise<User> {
    const id = idOf(userData);
    const type = typeOf(userData);
    const version = versionOf(userData) || 1;
    const timestamp = timestampsOf(userData) || new Date();

    // Validate the user data
    if (!this.isValidId(id)) {
      throw new Error('Invalid user ID');
    }

    if (!this.isValidType(type)) {
      throw new Error('Invalid user type');
    }

    // Create the user with canonical format
    const user: User = {
      id,
      type,
      version,
      createdAt: timestamp,
      updatedAt: timestamp,
      name: (userData as any).name,
      email: (userData as any).email,
      roleId: (userData as any).roleId || '',
    };

    this.users.push(user);
    await this.auditService.logCreation(user);
    
    return user;
  }

  // Update user with optimistic concurrency control
  async updateUser<T extends Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps'>>(
    userData: T,
    updates: Partial<User>
  ): Promise<User> {
    const id = idOf(userData);
    const currentVersion = versionOf(userData);

    // Check for concurrent modifications
    const existingUser = this.users.find(u => u.id === id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    if (existingUser.version !== currentVersion) {
      throw new Error('User has been modified by another user');
    }

    // Apply updates
    const updatedUser: User = {
      ...existingUser,
      ...updates,
      version: existingUser.version + 1,
      updatedAt: new Date(),
    };

    const index = this.users.findIndex(u => u.id === id);
    this.users[index] = updatedUser;
    
    await this.auditService.logUpdate(existingUser, updatedUser);
    
    return updatedUser;
  }

  // Find users by type with time filtering
  async findUsersByType<T extends Satisfies<'Type' | 'Timestamps'>>(
    type: string,
    since?: Date
  ): Promise<User[]> {
    let users = this.users.filter(user => user.type === type);

    if (since) {
      users = users.filter(user => user.createdAt > since);
    }

    return users;
  }

  // Resolve user relationships (e.g., role information)
  async resolveUserRelationships<T extends Satisfies<'References'>>(
    users: T[]
  ): Promise<ResolvedUser[]> {
    const roleIds = users.map(user => referencesOf(user));
    const roles = await this.roleService.findByIds(roleIds);

    return users.map(user => ({
      ...user as User,
      role: roles.find(role => role.id === referencesOf(user))
    }));
  }

  // Validation helpers
  private isValidId(id: string): boolean {
    return id && id.length > 0;
  }

  private isValidType(type: string): boolean {
    return ['User', 'Admin', 'Guest'].includes(type);
  }

  constructor(private auditService: AuditService, private roleService: RoleService) {}
}
```

### Audit Service

```typescript
import { idOf, timestampsOf } from '@relational-fabric/canon';
import type { Satisfies } from '@relational-fabric/canon';

class AuditService {
  private auditLogs: AuditLog[] = [];

  async logCreation<T extends Satisfies<'Id' | 'Timestamps'>>(
    entity: T
  ): Promise<void> {
    const id = idOf(entity);
    const timestamp = timestampsOf(entity);

    const auditLog: AuditLog = {
      entityId: id,
      action: 'CREATE',
      timestamp,
      createdAt: new Date()
    };

    this.auditLogs.push(auditLog);
  }

  async logUpdate<T extends Satisfies<'Id' | 'Timestamps'>>(
    oldEntity: T,
    newEntity: T
  ): Promise<void> {
    const id = idOf(newEntity);
    const timestamp = timestampsOf(newEntity);

    const auditLog: AuditLog = {
      entityId: id,
      action: 'UPDATE',
      timestamp,
      createdAt: new Date()
    };

    this.auditLogs.push(auditLog);
  }

  async findRecentChanges<T extends Satisfies<'Timestamps'>>(
    entities: T[],
    since: Date
  ): T[] {
    return entities.filter(entity => 
      timestampsOf(entity) > since
    );
  }
}
```

### Role Service

```typescript
import { referencesOf } from '@relational-fabric/canon';
import type { Satisfies } from '@relational-fabric/canon';

class RoleService {
  private roles = [
    { id: 'admin', name: 'Administrator', permissions: ['read', 'write', 'delete'] },
    { id: 'user', name: 'User', permissions: ['read', 'write'] },
    { id: 'guest', name: 'Guest', permissions: ['read'] }
  ];

  async findByIds<T extends Satisfies<'References'>>(
    references: T[]
  ): Promise<any[]> {
    const ids = references.map(ref => referencesOf(ref));
    return this.roles.filter(role => ids.includes(role.id));
  }
}
```

## Step 5: Using the Universal System

Now let's see how our universal system works with different data formats:

```typescript
// Initialize services
const auditService = new AuditService();
const roleService = new RoleService();
const userService = new UserService(auditService, roleService);

// Example 1: REST API format
const restUser = {
  id: "user-123",
  type: "User",
  version: 1,
  createdAt: "2022-01-01T00:00:00Z",
  name: "John Doe",
  email: "john@example.com",
  roleId: "admin"
};

// Example 2: MongoDB format
const mongoUser = {
  _id: "user-456",
  _type: "User",
  _version: 1,
  created_at: 1640995200,
  name: "Jane Doe",
  email: "jane@example.com",
  roleId: "user"
};

// Example 3: JSON-LD format
const jsonLdUser = {
  "@id": "user-789",
  "@type": "User",
  "@version": 1,
  "dateCreated": "2022-01-01T00:00:00Z",
  "name": "Bob Smith",
  "email": "bob@example.com",
  "roleId": "guest"
};

// All formats work with the same service methods!
const createdRestUser = await userService.createUser(restUser);
const createdMongoUser = await userService.createUser(mongoUser);
const createdJsonLdUser = await userService.createUser(jsonLdUser);

console.log('Created users:', {
  rest: createdRestUser.id,
  mongo: createdMongoUser.id,
  jsonLd: createdJsonLdUser.id
});

// Universal queries work across all formats
const recentUsers = await userService.findUsersByType("User", new Date("2022-01-01"));
console.log('Recent users:', recentUsers.length);

// Resolve relationships
const usersWithRoles = await userService.resolveUserRelationships([
  createdRestUser,
  createdMongoUser,
  createdJsonLdUser
]);

console.log('Users with roles:', usersWithRoles.map(u => ({
  name: u.name,
  role: u.role?.name
})));
```

## Step 6: Handling Updates with Optimistic Concurrency

Let's see how optimistic concurrency control works:

```typescript
// Update a user - this will work with any format
try {
  const updatedUser = await userService.updateUser(createdRestUser, {
    name: "John Updated",
    email: "john.updated@example.com"
  });
  
  console.log('User updated successfully:', updatedUser.name);
  console.log('New version:', updatedUser.version);
} catch (error) {
  console.error('Update failed:', error.message);
}

// Simulate concurrent modification
const conflictingUser = { ...createdRestUser, version: 999 };
try {
  await userService.updateUser(conflictingUser, {
    name: "Conflicting Update"
  });
} catch (error) {
  console.log('Concurrent modification detected:', error.message);
}
```

## Step 7: Audit Trail

Let's check the audit trail:

```typescript
// The audit service automatically logs all changes
console.log('Audit logs:', auditService.auditLogs.map(log => ({
  entityId: log.entityId,
  action: log.action,
  timestamp: log.timestamp
})));
```

## Key Benefits Demonstrated

This example shows how Canon enables:

1. **Universal Code**: The same service methods work with REST, MongoDB, and JSON-LD formats
2. **Type Safety**: TypeScript ensures compile-time validation across all formats
3. **Optimistic Concurrency**: Built-in version checking prevents data conflicts
4. **Audit Logging**: Automatic tracking of all changes regardless of format
5. **Relationship Resolution**: Easy handling of entity relationships across formats
6. **Format Independence**: Business logic doesn't need to know about data format differences

## Conclusion

By using Canon's core axioms, we've built a user management system that:
- Works seamlessly across multiple data formats
- Provides type safety and compile-time validation
- Handles optimistic concurrency control
- Maintains comprehensive audit trails
- Resolves entity relationships automatically

The system is maintainable, testable, and easily extensible to new data formats without changing the core business logic.