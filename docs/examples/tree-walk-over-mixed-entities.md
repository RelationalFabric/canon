# Canon Examples: Tree Walk Over Mixed Entities

## Overview

This document demonstrates a real-world scenario where we need to walk a tree of mixed entities from different sources and shapes. We'll define custom axioms for parent/child relationships and show how Canon enables uniform access across diverse data structures.

## Additional Examples

For more practical examples of Canon in action, see:

- [Deduplicating Entities](./examples/deduplicating-entities.md) - How to identify and merge duplicate entities across different data sources
- [User Authentication Tokens](./examples/user-authentication-tokens.md) - Cross-source data transformation for authentication systems

## The Scenario

Imagine you're building a file system browser that needs to:
- Display a unified tree view of files and folders from multiple sources
- Handle different data formats: internal database, JSON-LD API, REST API
- Support parent/child relationships across all sources
- Walk the tree uniformly regardless of source or shape

Without Canon, you'd need separate tree-walking logic for each data source. With Canon, you write universal tree operations that work across all formats.

## Step 1: Setting Up Our Application

We'll start by importing the core axioms and defining our custom axioms for parent/child relationships.

```typescript
import { idOf, typeOf, versionOf, timestampsOf, referencesOf, isPojo } from '@relational-fabric/canon';
import type { Axiom, Pojo } from '@relational-fabric/canon';

// Type definitions for this example
type CanonDefinition = Record<string, unknown>;
type AxiomDefinition = Record<string, unknown>;
type AxiomConfig = Record<string, unknown>;

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
    Parent: ParentAxiom;
    Children: ChildrenAxiom;
  }
}

// Define our universal tree node interface
type TreeNode = {
  id: string;
  type: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  parentId?: string;
  children?: string[];
  size?: number;
  mimeType?: string;
};

// Define application-specific types
interface TreeWalkResult {
  node: TreeNode;
  depth: number;
  path: string[];
  source: string;
}

interface TreeStats {
  totalNodes: number;
  totalSize: number;
  maxDepth: number;
  sourceCounts: Record<string, number>;
}
```

## Step 2: Building Universal Tree Services

Now we'll create services that can walk trees uniformly across all data sources.

### Tree Service

```typescript
class TreeService {
  private nodes: Map<string, TreeNode> = new Map();
  private roots: Set<string> = new Set();

  // Import a tree node from any source - this is where Canon shines!
  async importNode<T extends Pojo>(
    nodeData: T,
    source: 'internal' | 'jsonld' | 'rest'
  ): Promise<TreeNode> {
    const id = idOf(nodeData);
    const type = typeOf(nodeData);
    const version = versionOf(nodeData) || 1;
    const timestamp = timestampsOf(nodeData) || new Date();

    // Universal type checking - works with any format
    if (!this.isValidId(id)) {
      throw new Error(`Invalid node ID from ${source}: ${id}`);
    }

    if (!this.isValidType(type)) {
      throw new Error(`Invalid node type from ${source}: ${type}`);
    }

    // Convert to our internal format - this is the magic!
    const node: TreeNode = {
      id,
      type,
      version,
      createdAt: timestamp,
      updatedAt: timestamp,
      name: (nodeData as any).name || (nodeData as any).title || (nodeData as any).filename,
      parentId: this.getParentId(nodeData),
      children: this.getChildren(nodeData),
      size: (nodeData as any).size || (nodeData as any).fileSize || (nodeData as any).bytes,
      mimeType: (nodeData as any).mimeType || (nodeData as any).contentType,
    };

    this.nodes.set(id, node);
    
    // Track root nodes (no parent)
    if (!node.parentId) {
      this.roots.add(id);
    }

    console.log(`✅ Imported ${node.type} from ${source}:`, node.name);
    return node;
  }

  // Universal tree walk - works with any data source!
  async walkTree(
    startNodeId?: string,
    maxDepth: number = 10
  ): Promise<TreeWalkResult[]> {
    const results: TreeWalkResult[] = [];
    const visited = new Set<string>();

    // Start from root nodes if no specific node provided
    const startNodes = startNodeId ? [startNodeId] : Array.from(this.roots);

    for (const nodeId of startNodes) {
      await this.walkNode(nodeId, 0, [], results, visited, maxDepth);
    }

    return results;
  }

  // Recursive tree walk - universal across all sources
  private async walkNode(
    nodeId: string,
    depth: number,
    path: string[],
    results: TreeWalkResult[],
    visited: Set<string>,
    maxDepth: number
  ): Promise<void> {
    if (depth > maxDepth || visited.has(nodeId)) {
      return;
    }

    const node = this.nodes.get(nodeId);
    if (!node) return;

    visited.add(nodeId);
    const currentPath = [...path, node.name];

    // Add current node to results
    results.push({
      node,
      depth,
      path: currentPath,
      source: this.getNodeSource(node)
    });

    // Walk children - works with any data source!
    if (node.children && node.children.length > 0) {
      for (const childId of node.children) {
        await this.walkNode(childId, depth + 1, currentPath, results, visited, maxDepth);
      }
    }
  }

  // Get tree statistics - universal across all sources
  async getTreeStats(): Promise<TreeStats> {
    const stats: TreeStats = {
      totalNodes: this.nodes.size,
      totalSize: 0,
      maxDepth: 0,
      sourceCounts: {}
    };

    for (const node of this.nodes.values()) {
      // Count by source
      const source = this.getNodeSource(node);
      stats.sourceCounts[source] = (stats.sourceCounts[source] || 0) + 1;

      // Sum sizes
      if (node.size) {
        stats.totalSize += node.size;
      }
    }

    // Calculate max depth
    const walkResults = await this.walkTree();
    stats.maxDepth = Math.max(...walkResults.map(r => r.depth));

    return stats;
  }

  // Find nodes by type - universal across all sources
  async findNodesByType(
    type: string,
    since?: Date
  ): Promise<TreeNode[]> {
    let nodes = Array.from(this.nodes.values()).filter(n => n.type === type);

    if (since) {
      nodes = nodes.filter(n => n.createdAt > since);
    }

    return nodes;
  }

  // Get node by ID - universal across all sources
  getNode(nodeId: string): TreeNode | undefined {
    return this.nodes.get(nodeId);
  }

  // Helper methods for extracting data from different formats
  private getParentId(nodeData: Pojo): string | undefined {
    const parentKey = this.getParentKey(nodeData);
    return parentKey ? (nodeData as any)[parentKey] : undefined;
  }

  private getChildren(nodeData: Pojo): string[] {
    const childrenKey = this.getChildrenKey(nodeData);
    const children = childrenKey ? (nodeData as any)[childrenKey] : [];
    return Array.isArray(children) ? children : [];
  }

  private getParentKey(nodeData: Pojo): string | undefined {
    // Try different common parent field names
    const possibleKeys = ['parentId', 'parent_id', 'parent', 'folderId', 'folder_id'];
    for (const key of possibleKeys) {
      if (key in nodeData) return key;
    }
    return undefined;
  }

  private getChildrenKey(nodeData: Pojo): string | undefined {
    // Try different common children field names
    const possibleKeys = ['children', 'childIds', 'child_ids', 'files', 'subfolders'];
    for (const key of possibleKeys) {
      if (key in nodeData) return key;
    }
    return undefined;
  }

  private getNodeSource(node: TreeNode): string {
    // Determine source based on node characteristics
    if (node.id.startsWith('internal-')) return 'internal';
    if (node.id.startsWith('jsonld-')) return 'jsonld';
    if (node.id.startsWith('rest-')) return 'rest';
    return 'unknown';
  }

  // Type checking helpers
  private isValidId(id: string): boolean {
    return id && id.length > 0;
  }

  private isValidType(type: string): boolean {
    return ['File', 'Folder', 'Directory', 'Document'].includes(type);
  }
}
```

## Step 3: Using the Universal Tree System

Now let's see how our universal tree system works with mixed entities from different sources:

```typescript
// Initialize the tree service
const treeService = new TreeService();

// Example 1: Internal database format (our standard)
const internalFolder = {
  id: "internal-folder-1",
  type: "Folder",
  version: 1,
  createdAt: new Date("2022-01-01"),
  name: "Documents",
  parentId: undefined,
  children: ["internal-file-1", "internal-file-2"]
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
  mimeType: "application/pdf"
};

// Example 2: JSON-LD format from cloud storage API
const jsonLdFolder = {
  "@id": "https://api.cloud.com/folders/projects",
  "@type": "Directory",
  "@version": 1,
  "dateCreated": "2022-01-15T10:30:00Z",
  "title": "Projects",
  "parent": "https://api.cloud.com/folders/root",
  "subfolders": ["https://api.cloud.com/folders/project-a", "https://api.cloud.com/folders/project-b"]
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
  "contentType": "text/markdown"
};

// Example 3: REST API format from file server
const restFolder = {
  id: "rest-folder-1",
  type: "Folder",
  version: 1,
  created_at: 1640995200,
  title: "Images",
  parent_id: "rest-folder-0",
  child_ids: ["rest-file-1", "rest-file-2"]
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
  mimeType: "image/jpeg"
};

// Import all nodes - same method works for all sources!
await treeService.importNode(internalFolder, 'internal');
await treeService.importNode(internalFile, 'internal');
await treeService.importNode(jsonLdFolder, 'jsonld');
await treeService.importNode(jsonLdFile, 'jsonld');
await treeService.importNode(restFolder, 'rest');
await treeService.importNode(restFile, 'rest');

// Walk the entire tree - universal across all sources!
const treeWalk = await treeService.walkTree();
console.log('Tree walk results:');
treeWalk.forEach(result => {
  const indent = '  '.repeat(result.depth);
  console.log(`${indent}${result.node.name} (${result.node.type}) [${result.source}]`);
});

// Get tree statistics - works across all sources
const stats = await treeService.getTreeStats();
console.log('Tree statistics:', stats);

// Find all files - universal across all sources
const allFiles = await treeService.findNodesByType('File');
console.log('All files:', allFiles.map(f => `${f.name} (${f.size} bytes)`));
```

## Step 4: Advanced Tree Operations

Let's demonstrate more advanced tree operations that work uniformly across all sources:

```typescript
// Find all nodes created after a certain date - universal across all sources
const recentNodes = await treeService.findNodesByType('File', new Date('2022-01-10'));
console.log('Recent files:', recentNodes.map(f => f.name));

// Walk a specific subtree - works with any source
const subtreeWalk = await treeService.walkTree('internal-folder-1');
console.log('Subtree walk:', subtreeWalk.map(r => r.node.name));

// Get node details - universal across all sources
const node = treeService.getNode('internal-file-1');
if (node) {
  console.log('Node details:', {
    name: node.name,
    type: node.type,
    size: node.size,
    mimeType: node.mimeType
  });
}
```

## Step 5: Adding New Data Sources

Let's demonstrate how easy it is to add new data sources:

```typescript
// New data source: GraphQL API
const graphqlFolder = {
  id: "gql-folder-1",
  __typename: "Directory",
  version: 1,
  createdAt: "2022-02-01T00:00:00Z",
  title: "Videos",
  parentId: "gql-folder-0",
  files: ["gql-file-1"]
};

const graphqlFile = {
  id: "gql-file-1",
  __typename: "File",
  version: 1,
  createdAt: "2022-02-01T00:00:00Z",
  filename: "demo.mp4",
  parentId: "gql-folder-1",
  files: [],
  fileSize: 10485760,
  mimeType: "video/mp4"
};

// No new code needed! The same service method works
await treeService.importNode(graphqlFolder, 'rest');
await treeService.importNode(graphqlFile, 'rest');

// All tree operations work the same
const updatedTreeWalk = await treeService.walkTree();
console.log('Updated tree walk:', updatedTreeWalk.map(r => r.node.name));
```

## Key Benefits Demonstrated

This example shows why Canon is valuable for tree operations:

1. **Universal Tree Walk**: Same `walkTree()` method works across all data sources
2. **Custom Axioms**: We defined our own `Parent` and `Children` axioms for relationships
3. **Mixed Sources**: Entities from internal DB, JSON-LD API, REST API, GraphQL
4. **Mixed Shapes**: Different field names (`parentId` vs `parent` vs `parent_id`)
5. **Format Independence**: Tree operations don't need to know about data source differences
6. **Easy Extension**: Adding new data sources requires no code changes
7. **Type Safety**: TypeScript ensures compile-time type checking across all formats

## Conclusion

By using Canon's core axioms and defining custom axioms for parent/child relationships, we've built a file system browser that:
- Seamlessly handles mixed entities from multiple sources and shapes
- Provides universal tree walking operations regardless of data format
- Supports custom relationship axioms for domain-specific needs
- Requires no code changes when adding new data sources
- Maintains type safety and type checking across all formats

The system demonstrates the real value of Canon: **universal tree operations that work across diverse data structures with custom relationship semantics**.