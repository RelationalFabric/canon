# Tree Walk Over Mixed Entities

## Overview

This example demonstrates how to walk a tree of mixed entities from different sources and shapes using custom axioms for parent/child relationships. It shows the power of Canon for universal tree operations across diverse data structures without creating specific types.

## The Scenario

Building a file system browser that needs to:
- Display a unified tree view of files and folders from multiple sources
- Handle different data formats: internal database, JSON-LD API, REST API
- Support parent/child relationships across all sources
- Walk the tree uniformly regardless of source or shape

## Step 1: Setting Up Custom Axioms

```typescript
import { idOf, typeOf, versionOf, timestampsOf, referencesOf } from '@relational-fabric/canon';
import type { Satisfies, Axiom } from '@relational-fabric/canon';

// Define custom axioms for parent/child relationships
type ParentAxiom = Axiom<{
  $basis: Record<string, unknown>;
  key: string;
}, {
  key: string;
}>;

type ChildrenAxiom = Axiom<{
  $basis: Record<string, unknown>;
  key: string;
}, {
  key: string;
}>;

// Register our custom axioms
declare module '@relational-fabric/canon' {
  interface Axioms {
    Id: KeyNameAxiom;
    Type: KeyNameAxiom;
    Version: KeyNameAxiom;
    Timestamps: TimestampsAxiom;
    References: ReferencesAxiom;
    Parent: ParentAxiom;
    Children: ChildrenAxiom;
  }
}
```

## Step 2: Building Universal Tree Service

```typescript
class TreeService {
  private nodes: Map<string, any> = new Map();
  private roots: Set<string> = new Set();

  // Import a tree node from any source - works with arbitrary types that satisfy axioms
  async importNode<T extends Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps' | 'Parent' | 'Children'>>(
    nodeData: T,
    source: 'internal' | 'jsonld' | 'rest'
  ): Promise<T> {
    const id = idOf(nodeData);
    const type = typeOf(nodeData);
    const version = versionOf(nodeData) || 1;
    const timestamp = timestampsOf(nodeData) || new Date();

    // Store the original data - no conversion needed!
    this.nodes.set(id, nodeData);
    
    // Check if this is a root node
    const parentId = this.getParentId(nodeData);
    if (!parentId) {
      this.roots.add(id);
    }

    const name = this.getName(nodeData);
    console.log(`✅ Imported ${type} from ${source}:`, name);
    return nodeData;
  }

  // Universal tree walk - works with any data source and arbitrary types!
  async walkTree<T extends Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps' | 'Parent' | 'Children'>>(
    startNodeId?: string,
    maxDepth: number = 10
  ): Promise<TreeWalkResult<T>[]> {
    const results: TreeWalkResult<T>[] = [];
    const visited = new Set<string>();

    const startNodes = startNodeId ? [startNodeId] : Array.from(this.roots);

    for (const nodeId of startNodes) {
      await this.walkNode(nodeId, 0, [], results, visited, maxDepth);
    }

    return results;
  }

  // Recursive tree walk - universal across all sources and types
  private async walkNode<T extends Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps' | 'Parent' | 'Children'>>(
    nodeId: string,
    depth: number,
    path: string[],
    results: TreeWalkResult<T>[],
    visited: Set<string>,
    maxDepth: number
  ): Promise<void> {
    if (depth > maxDepth || visited.has(nodeId)) {
      return;
    }

    const node = this.nodes.get(nodeId) as T;
    if (!node) return;

    visited.add(nodeId);
    const currentPath = [...path, this.getName(node)];

    results.push({
      node,
      depth,
      path: currentPath,
      source: this.getNodeSource(node)
    });

    // Walk children - works with any data source and type!
    const children = this.getChildren(node);
    if (children && children.length > 0) {
      for (const childId of children) {
        await this.walkNode(childId, depth + 1, currentPath, results, visited, maxDepth);
      }
    }
  }

  // Helper methods for extracting data from different formats using axioms
  private getParentId<T extends Satisfies<'Parent'>>(nodeData: T): string | undefined {
    const parentKey = this.getParentKey(nodeData);
    return parentKey ? (nodeData as any)[parentKey] : undefined;
  }

  private getChildren<T extends Satisfies<'Children'>>(nodeData: T): string[] {
    const childrenKey = this.getChildrenKey(nodeData);
    const children = childrenKey ? (nodeData as any)[childrenKey] : [];
    return Array.isArray(children) ? children : [];
  }

  private getName<T extends Satisfies<'Id' | 'Type'>>(nodeData: T): string {
    // Try different common name fields
    const possibleKeys = ['name', 'title', 'filename', 'label'];
    for (const key of possibleKeys) {
      if (key in nodeData) return (nodeData as any)[key];
    }
    return idOf(nodeData); // Fallback to ID
  }

  private getParentKey<T extends Satisfies<'Parent'>>(nodeData: T): string | undefined {
    const possibleKeys = ['parentId', 'parent_id', 'parent', 'folderId', 'folder_id'];
    for (const key of possibleKeys) {
      if (key in nodeData) return key;
    }
    return undefined;
  }

  private getChildrenKey<T extends Satisfies<'Children'>>(nodeData: T): string | undefined {
    const possibleKeys = ['children', 'childIds', 'child_ids', 'files', 'subfolders'];
    for (const key of possibleKeys) {
      if (key in nodeData) return key;
    }
    return undefined;
  }

  private getNodeSource<T extends Satisfies<'Id'>>(node: T): string {
    const id = idOf(node);
    if (id.startsWith('internal-')) return 'internal';
    if (id.startsWith('jsonld-')) return 'jsonld';
    if (id.startsWith('rest-')) return 'rest';
    return 'unknown';
  }
}

interface TreeWalkResult<T> {
  node: T;
  depth: number;
  path: string[];
  source: string;
}
```

## Step 3: Using the Universal Tree System

```typescript
// Initialize the tree service
const treeService = new TreeService();

// Example 1: Internal database format - arbitrary type that satisfies axioms
const internalFolder = {
  id: "internal-folder-1",
  type: "Folder",
  version: 1,
  createdAt: new Date("2022-01-01"),
  name: "Documents",
  parentId: undefined,
  children: ["internal-file-1", "internal-file-2"],
  // Additional fields specific to internal format
  internalId: 12345,
  databaseVersion: "2.1.0"
};

const internalFile = {
  id: "internal-file-1",
  type: "File",
  version: 1,
  createdAt: new Date("2022-01-01"),
  name: "report.pdf",
  parentId: "internal-folder-1",
  children: [],
  size: 1024000,
  mimeType: "application/pdf",
  // Additional fields specific to internal format
  filePath: "/documents/report.pdf",
  checksum: "abc123def456"
};

// Example 2: JSON-LD format from cloud storage API - different shape, same axioms
const jsonLdFolder = {
  "@id": "https://api.cloud.com/folders/projects",
  "@type": "Directory",
  "@version": 1,
  "dateCreated": "2022-01-15T10:30:00Z",
  "title": "Projects",
  "parent": "https://api.cloud.com/folders/root",
  "subfolders": ["https://api.cloud.com/folders/project-a"],
  // Additional JSON-LD specific fields
  "@context": "https://schema.org/",
  "description": "Project files directory"
};

const jsonLdFile = {
  "@id": "https://api.cloud.com/files/readme.txt",
  "@type": "Document",
  "@version": 1,
  "dateCreated": "2022-01-15T11:00:00Z",
  "filename": "README.md",
  "folder": "https://api.cloud.com/folders/project-a",
  "files": [],
  "bytes": 2048,
  "contentType": "text/markdown",
  // Additional JSON-LD specific fields
  "author": "https://api.cloud.com/users/john-doe",
  "license": "MIT"
};

// Example 3: REST API format from file server - different shape again
const restFolder = {
  id: "rest-folder-1",
  type: "Folder",
  version: 1,
  created_at: 1640995200,
  title: "Images",
  parent_id: "rest-folder-0",
  child_ids: ["rest-file-1"],
  // Additional REST API specific fields
  _links: {
    self: { href: "/api/folders/rest-folder-1" },
    children: { href: "/api/folders/rest-folder-1/children" }
  },
  metadata: {
    owner: "user123",
    permissions: "rwxr-xr-x"
  }
};

const restFile = {
  id: "rest-file-1",
  type: "File",
  version: 1,
  created_at: 1640995200,
  filename: "photo.jpg",
  parent_id: "rest-folder-1",
  child_ids: [],
  fileSize: 512000,
  mimeType: "image/jpeg",
  // Additional REST API specific fields
  url: "https://files.example.com/photo.jpg",
  thumbnailUrl: "https://files.example.com/thumbs/photo.jpg"
};

// Import all nodes - same method works for all sources and arbitrary types!
const importedInternalFolder = await treeService.importNode(internalFolder, 'internal');
const importedInternalFile = await treeService.importNode(internalFile, 'internal');
const importedJsonLdFolder = await treeService.importNode(jsonLdFolder, 'jsonld');
const importedJsonLdFile = await treeService.importNode(jsonLdFile, 'jsonld');
const importedRestFolder = await treeService.importNode(restFolder, 'rest');
const importedRestFile = await treeService.importNode(restFile, 'rest');

// Walk the entire tree - universal across all sources and types!
const treeWalk = await treeService.walkTree();
console.log('Tree walk results:');
treeWalk.forEach(result => {
  const indent = '  '.repeat(result.depth);
  const name = treeService.getName(result.node);
  const type = typeOf(result.node);
  console.log(`${indent}${name} (${type}) [${result.source}]`);
});

// The beauty: we can work with the original data structures!
console.log('\nOriginal data preserved:');
console.log('Internal folder internalId:', (importedInternalFolder as any).internalId);
console.log('JSON-LD folder context:', (importedJsonLdFolder as any)['@context']);
console.log('REST folder links:', (importedRestFolder as any)._links);
```

## Key Benefits

This example demonstrates:
- **Universal Tree Walk**: Same `walkTree()` method works across all data sources and arbitrary types
- **Custom Axioms**: We defined our own `Parent` and `Children` axioms for relationships
- **Mixed Sources**: Entities from internal DB, JSON-LD API, REST API
- **Mixed Shapes**: Different field names (`parentId` vs `parent` vs `parent_id`) and additional fields
- **Format Independence**: Tree operations don't need to know about data source differences
- **Type Preservation**: Original data structures are preserved - no conversion needed
- **Arbitrary Types**: Works with any type that satisfies the required axioms, not just predefined interfaces