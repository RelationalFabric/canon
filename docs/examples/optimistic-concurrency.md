# Optimistic Concurrency Control

## Overview

This example demonstrates how to implement optimistic concurrency control across multiple data sources using Canon's versioning capabilities. It shows how to handle concurrent updates safely regardless of data format.

## The Scenario

Building a collaborative document editing system that needs to:
- Handle concurrent edits from multiple users
- Support different data sources (internal DB, REST API, WebSocket)
- Prevent data loss from conflicting updates
- Provide clear error messages for conflicts

## Step 1: Setting Up the Concurrency System

```typescript
import { idOf, typeOf, versionOf, timestampsOf } from '@relational-fabric/canon';
import type { Satisfies } from '@relational-fabric/canon';

// Our document model with versioning
type Document = {
  id: string;
  type: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  content: string;
  authorId: string;
  lastModifiedBy: string;
  source: string;
} & Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps'>;

// Define application-specific types
interface ConcurrencyError extends Error {
  code: 'CONCURRENT_MODIFICATION';
  currentVersion: number;
  expectedVersion: number;
  lastModifiedBy: string;
  lastModifiedAt: Date;
}

interface UpdateResult {
  success: boolean;
  document?: Document;
  error?: ConcurrencyError;
}
```

## Step 2: Building Concurrency-Aware Service

```typescript
class DocumentConcurrencyService {
  private documents: Map<string, Document> = new Map();
  private updateHistory: Map<string, Document[]> = new Map();

  // Universal document import - works with any source
  async importDocument<T extends Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps'>>(
    documentData: T,
    source: 'internal' | 'rest' | 'websocket'
  ): Promise<Document> {
    const id = idOf(documentData);
    const type = typeOf(documentData);
    const version = versionOf(documentData) || 1;
    const timestamp = timestampsOf(documentData) || new Date();

    const document: Document = {
      id,
      type,
      version,
      createdAt: timestamp,
      updatedAt: timestamp,
      title: (documentData as any).title || (documentData as any).name,
      content: (documentData as any).content || (documentData as any).body,
      authorId: (documentData as any).authorId || (documentData as any).author_id,
      lastModifiedBy: (documentData as any).lastModifiedBy || (documentData as any).last_modified_by,
      source
    };

    this.documents.set(id, document);
    this.updateHistory.set(id, [document]);
    
    console.log(`✅ Imported document from ${source}:`, document.title);
    return document;
  }

  // Universal document update with optimistic concurrency
  async updateDocument<T extends Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps'>>(
    documentData: T,
    updates: Partial<Document>,
    userId: string
  ): Promise<UpdateResult> {
    const id = idOf(documentData);
    const expectedVersion = versionOf(documentData);

    // Get current document
    const currentDocument = this.documents.get(id);
    if (!currentDocument) {
      return {
        success: false,
        error: new Error(`Document not found: ${id}`) as ConcurrencyError
      };
    }

    // Check for concurrent modifications
    if (currentDocument.version !== expectedVersion) {
      const error: ConcurrencyError = {
        name: 'ConcurrencyError',
        message: `Document has been modified by another user. Expected version ${expectedVersion}, but current version is ${currentDocument.version}`,
        code: 'CONCURRENT_MODIFICATION',
        currentVersion: currentDocument.version,
        expectedVersion: expectedVersion,
        lastModifiedBy: currentDocument.lastModifiedBy,
        lastModifiedAt: currentDocument.updatedAt
      };

      return {
        success: false,
        error
      };
    }

    // Apply updates
    const updatedDocument: Document = {
      ...currentDocument,
      ...updates,
      version: currentDocument.version + 1,
      updatedAt: new Date(),
      lastModifiedBy: userId
    };

    // Store the update
    this.documents.set(id, updatedDocument);
    
    // Add to history
    const history = this.updateHistory.get(id) || [];
    history.push(updatedDocument);
    this.updateHistory.set(id, history);

    console.log(`✅ Updated document:`, updatedDocument.title, `(version ${updatedDocument.version})`);
    
    return {
      success: true,
      document: updatedDocument
    };
  }

  // Get document with version info
  async getDocument(id: string): Promise<Document | null> {
    return this.documents.get(id) || null;
  }

  // Get document history
  async getDocumentHistory(id: string): Promise<Document[]> {
    return this.updateHistory.get(id) || [];
  }

  // Resolve conflicts by merging changes
  async resolveConflict(
    documentId: string,
    baseVersion: number,
    changes: Partial<Document>,
    userId: string
  ): Promise<UpdateResult> {
    const currentDocument = this.documents.get(documentId);
    if (!currentDocument) {
      return {
        success: false,
        error: new Error(`Document not found: ${documentId}`) as ConcurrencyError
      };
    }

    // Create a new version that incorporates the changes
    const resolvedDocument: Document = {
      ...currentDocument,
      ...changes,
      version: currentDocument.version + 1,
      updatedAt: new Date(),
      lastModifiedBy: userId
    };

    this.documents.set(documentId, resolvedDocument);
    
    const history = this.updateHistory.get(documentId) || [];
    history.push(resolvedDocument);
    this.updateHistory.set(documentId, history);

    console.log(`✅ Resolved conflict for document:`, resolvedDocument.title);
    
    return {
      success: true,
      document: resolvedDocument
    };
  }

  // Get concurrent modification info
  async getConcurrencyInfo(documentId: string): Promise<{
    currentVersion: number;
    lastModifiedBy: string;
    lastModifiedAt: Date;
    hasConflicts: boolean;
  } | null> {
    const document = this.documents.get(documentId);
    if (!document) return null;

    return {
      currentVersion: document.version,
      lastModifiedBy: document.lastModifiedBy,
      lastModifiedAt: document.updatedAt,
      hasConflicts: false // This would be determined by your conflict detection logic
    };
  }
}
```

## Step 3: Using the Concurrency System

```typescript
// Initialize the concurrency service
const concurrencyService = new DocumentConcurrencyService();

// Example 1: Internal database document
const internalDocument = {
  id: "doc-123",
  type: "Document",
  version: 1,
  createdAt: new Date("2022-01-01"),
  title: "Project Requirements",
  content: "Initial project requirements document",
  authorId: "user-1",
  lastModifiedBy: "user-1"
};

// Example 2: REST API document
const restDocument = {
  id: "doc-456",
  type: "Document",
  version: 1,
  created_at: "2022-01-15T10:30:00Z",
  title: "API Documentation",
  body: "REST API documentation for the project",
  author_id: "user-2",
  last_modified_by: "user-2"
};

// Example 3: WebSocket document
const websocketDocument = {
  id: "doc-789",
  type: "Document",
  version: 1,
  createdAt: "2022-02-01T00:00:00Z",
  name: "User Guide",
  content: "User guide for the application",
  authorId: "user-3",
  lastModifiedBy: "user-3"
};

// Import all documents
await concurrencyService.importDocument(internalDocument, 'internal');
await concurrencyService.importDocument(restDocument, 'rest');
await concurrencyService.importDocument(websocketDocument, 'websocket');

// Simulate concurrent updates
console.log('\n--- Simulating Concurrent Updates ---');

// User 1 starts editing
const user1Document = await concurrencyService.getDocument('doc-123');
if (user1Document) {
  console.log(`User 1 editing: ${user1Document.title} (version ${user1Document.version})`);
}

// User 2 starts editing the same document
const user2Document = await concurrencyService.getDocument('doc-123');
if (user2Document) {
  console.log(`User 2 editing: ${user2Document.title} (version ${user2Document.version})`);
}

// User 1 saves first
const user1Update = await concurrencyService.updateDocument(
  user1Document!,
  { content: "Updated project requirements with new features" },
  "user-1"
);

if (user1Update.success) {
  console.log(`✅ User 1 saved successfully (version ${user1Update.document!.version})`);
} else {
  console.log(`❌ User 1 save failed:`, user1Update.error!.message);
}

// User 2 tries to save (this should fail due to concurrency)
const user2Update = await concurrencyService.updateDocument(
  user2Document!,
  { content: "Updated project requirements with different changes" },
  "user-2"
);

if (user2Update.success) {
  console.log(`✅ User 2 saved successfully (version ${user2Update.document!.version})`);
} else {
  console.log(`❌ User 2 save failed:`, user2Update.error!.message);
  console.log(`   Expected version: ${user2Update.error!.expectedVersion}`);
  console.log(`   Current version: ${user2Update.error!.currentVersion}`);
  console.log(`   Last modified by: ${user2Update.error!.lastModifiedBy}`);
}

// Resolve the conflict
console.log('\n--- Resolving Conflict ---');
const conflictResolution = await concurrencyService.resolveConflict(
  'doc-123',
  user2Document!.version,
  { content: "Merged project requirements with both sets of changes" },
  "user-2"
);

if (conflictResolution.success) {
  console.log(`✅ Conflict resolved (version ${conflictResolution.document!.version})`);
}

// Show document history
console.log('\n--- Document History ---');
const history = await concurrencyService.getDocumentHistory('doc-123');
history.forEach((doc, index) => {
  console.log(`Version ${doc.version}: ${doc.content} (by ${doc.lastModifiedBy})`);
});
```

## Key Benefits

This example demonstrates:
- **Universal Concurrency**: Same versioning logic works across all data sources
- **Conflict Detection**: Automatic detection of concurrent modifications
- **Clear Error Messages**: Detailed information about conflicts
- **Conflict Resolution**: Ability to resolve conflicts programmatically
- **Audit Trail**: Complete history of document changes
- **Format Independence**: Concurrency logic doesn't depend on data source