# Tree Walk Over Mixed Entities

## Overview

This example demonstrates how to walk a tree of mixed entities from different sources and shapes using custom axioms for parent/child relationships. It shows the power of Canon for universal tree operations across diverse data structures.

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
} & Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps' | 'Parent' | 'Children'>;
```

## Step 2: Building Universal Tree Service

```typescript
class TreeService {
  private nodes: Map<string, TreeNode> = new Map();
  private roots: Set<string> = new Set();

  // Import a tree node from any source
  async importNode<T extends Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps' | 'Parent' | 'Children'>>(
    nodeData: T,
    source: 'internal' | 'jsonld' | 'rest'
  ): Promise<TreeNode> {
    const id = idOf(nodeData);
    const type = typeOf(nodeData);
    const version = versionOf(nodeData) || 1;
    const timestamp = timestampsOf(nodeData) || new Date();

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

  // Helper methods for extracting data from different formats
  private getParentId<T extends Satisfies<'Parent'>>(nodeData: T): string | undefined {
    const parentKey = this.getParentKey(nodeData);
    return parentKey ? (nodeData as any)[parentKey] : undefined;
  }

  private getChildren<T extends Satisfies<'Children'>>(nodeData: T): string[] {
    const childrenKey = this.getChildrenKey(nodeData);
    const children = childrenKey ? (nodeData as any)[childrenKey] : [];
    return Array.isArray(children) ? children : [];
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

  private getNodeSource(node: TreeNode): string {
    if (node.id.startsWith('internal-')) return 'internal';
    if (node.id.startsWith('jsonld-')) return 'jsonld';
    if (node.id.startsWith('rest-')) return 'rest';
    return 'unknown';
  }
}

interface TreeWalkResult {
  node: TreeNode;
  depth: number;
  path: string[];
  source: string;
}
```

## Step 3: Using the Universal Tree System

```typescript
// Initialize the tree service
const treeService = new TreeService();

// Example 1: Internal database format
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
  "subfolders": ["https://api.cloud.com/folders/project-a"]
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
  child_ids: ["rest-file-1"]
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
```

## Key Benefits

This example demonstrates:
- **Universal Tree Walk**: Same `walkTree()` method works across all data sources
- **Custom Axioms**: We defined our own `Parent` and `Children` axioms for relationships
- **Mixed Sources**: Entities from internal DB, JSON-LD API, REST API
- **Mixed Shapes**: Different field names (`parentId` vs `parent` vs `parent_id`)
- **Format Independence**: Tree operations don't need to know about data source differences