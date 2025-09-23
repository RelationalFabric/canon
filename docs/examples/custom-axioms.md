# Custom Axioms for Domain-Specific Needs

## Overview

This example demonstrates how to create custom axioms for domain-specific concepts like geolocation, file permissions, and user roles. It shows how Canon can be extended beyond the core axioms to handle specialized use cases.

## The Scenario

Building a content management system that needs to:
- Handle geolocation data from different sources
- Manage file permissions across different systems
- Support user roles and permissions
- Work with different data formats and field names

## Step 1: Defining Custom Axioms

```typescript
import { idOf, typeOf, versionOf, timestampsOf, referencesOf } from '@relational-fabric/canon';
import type { Satisfies, Axiom } from '@relational-fabric/canon';

// Custom axiom for geolocation data
type GeolocationAxiom = Axiom<{
  $basis: Record<string, unknown>;
  key: string;
  toCanonical: (value: this['$basis']) => { lat: number; lng: number };
  fromCanonical: (value: { lat: number; lng: number }) => this['$basis'];
}, {
  key: string;
}>;

// Custom axiom for file permissions
type PermissionsAxiom = Axiom<{
  $basis: Record<string, unknown>;
  key: string;
  toCanonical: (value: this['$basis']) => { read: boolean; write: boolean; execute: boolean };
  fromCanonical: (value: { read: boolean; write: boolean; execute: boolean }) => this['$basis'];
}, {
  key: string;
}>;

// Custom axiom for user roles
type RoleAxiom = Axiom<{
  $basis: Record<string, unknown>;
  key: string;
  toCanonical: (value: this['$basis']) => string[];
  fromCanonical: (value: string[]) => this['$basis'];
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
    Geolocation: GeolocationAxiom;
    Permissions: PermissionsAxiom;
    Role: RoleAxiom;
  }
}

// Our content model with custom axioms
type Content = {
  id: string;
  type: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  content: string;
  location?: { lat: number; lng: number };
  permissions?: { read: boolean; write: boolean; execute: boolean };
  roles?: string[];
  authorId: string;
} & Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps' | 'Geolocation' | 'Permissions' | 'Role'>;

// Define application-specific types
interface ContentWithDetails extends Content {
  author?: {
    id: string;
    name: string;
    email: string;
  };
  locationName?: string;
  permissionLevel?: 'public' | 'private' | 'restricted';
}
```

## Step 2: Building Custom Axiom Service

```typescript
class CustomAxiomService {
  private contents: Map<string, Content> = new Map();
  private authors: Map<string, any> = new Map();

  // Universal content import - works with any source and custom axioms
  async importContent<T extends Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps' | 'Geolocation' | 'Permissions' | 'Role'>>(
    contentData: T,
    source: 'internal' | 'cms' | 'api' | 'jsonld'
  ): Promise<Content> {
    const id = idOf(contentData);
    const type = typeOf(contentData);
    const version = versionOf(contentData) || 1;
    const timestamp = timestampsOf(contentData) || new Date();

    const content: Content = {
      id,
      type,
      version,
      createdAt: timestamp,
      updatedAt: timestamp,
      title: (contentData as any).title || (contentData as any).name,
      content: (contentData as any).content || (contentData as any).body,
      location: this.extractLocation(contentData),
      permissions: this.extractPermissions(contentData),
      roles: this.extractRoles(contentData),
      authorId: (contentData as any).authorId || (contentData as any).author_id
    };

    this.contents.set(id, content);
    console.log(`✅ Imported content from ${source}:`, content.title);
    
    return content;
  }

  // Extract geolocation data using custom axiom
  private extractLocation<T extends Satisfies<'Geolocation'>>(contentData: T): { lat: number; lng: number } | undefined {
    const locationKey = this.getLocationKey(contentData);
    if (!locationKey) return undefined;

    const locationData = (contentData as any)[locationKey];
    if (!locationData) return undefined;

    // Convert different location formats to canonical format
    if (typeof locationData === 'object') {
      if ('lat' in locationData && 'lng' in locationData) {
        return { lat: locationData.lat, lng: locationData.lng };
      }
      if ('latitude' in locationData && 'longitude' in locationData) {
        return { lat: locationData.latitude, lng: locationData.longitude };
      }
      if ('coordinates' in locationData && Array.isArray(locationData.coordinates)) {
        return { lat: locationData.coordinates[1], lng: locationData.coordinates[0] };
      }
    }

    return undefined;
  }

  // Extract permissions data using custom axiom
  private extractPermissions<T extends Satisfies<'Permissions'>>(contentData: T): { read: boolean; write: boolean; execute: boolean } | undefined {
    const permissionsKey = this.getPermissionsKey(contentData);
    if (!permissionsKey) return undefined;

    const permissionsData = (contentData as any)[permissionsKey];
    if (!permissionsData) return undefined;

    // Convert different permission formats to canonical format
    if (typeof permissionsData === 'object') {
      return {
        read: permissionsData.read || permissionsData.r || false,
        write: permissionsData.write || permissionsData.w || false,
        execute: permissionsData.execute || permissionsData.x || false
      };
    }

    if (typeof permissionsData === 'string') {
      // Parse Unix-style permissions (e.g., "755", "rwxr-xr-x")
      const perms = permissionsData.split('');
      return {
        read: perms.includes('r'),
        write: perms.includes('w'),
        execute: perms.includes('x')
      };
    }

    return undefined;
  }

  // Extract roles data using custom axiom
  private extractRoles<T extends Satisfies<'Role'>>(contentData: T): string[] | undefined {
    const rolesKey = this.getRolesKey(contentData);
    if (!rolesKey) return undefined;

    const rolesData = (contentData as any)[rolesKey];
    if (!rolesData) return undefined;

    // Convert different role formats to canonical format
    if (Array.isArray(rolesData)) {
      return rolesData;
    }

    if (typeof rolesData === 'string') {
      return rolesData.split(',').map(role => role.trim());
    }

    return undefined;
  }

  // Helper methods for finding the right keys
  private getLocationKey<T extends Satisfies<'Geolocation'>>(contentData: T): string | undefined {
    const possibleKeys = ['location', 'coordinates', 'geo', 'position', 'latlng'];
    for (const key of possibleKeys) {
      if (key in contentData) return key;
    }
    return undefined;
  }

  private getPermissionsKey<T extends Satisfies<'Permissions'>>(contentData: T): string | undefined {
    const possibleKeys = ['permissions', 'perms', 'access', 'rights', 'mode'];
    for (const key of possibleKeys) {
      if (key in contentData) return key;
    }
    return undefined;
  }

  private getRolesKey<T extends Satisfies<'Role'>>(contentData: T): string | undefined {
    const possibleKeys = ['roles', 'role', 'groups', 'permissions', 'access'];
    for (const key of possibleKeys) {
      if (key in contentData) return key;
    }
    return undefined;
  }

  // Get content with full details
  async getContentWithDetails(contentId: string): Promise<ContentWithDetails | null> {
    const content = this.contents.get(contentId);
    if (!content) return null;

    const author = this.authors.get(content.authorId);
    const locationName = content.location ? await this.getLocationName(content.location) : undefined;
    const permissionLevel = this.getPermissionLevel(content.permissions);

    return {
      ...content,
      author,
      locationName,
      permissionLevel
    };
  }

  // Find content by location
  async findContentByLocation(lat: number, lng: number, radius: number = 1): Promise<Content[]> {
    return Array.from(this.contents.values()).filter(content => {
      if (!content.location) return false;
      
      const distance = this.calculateDistance(
        { lat, lng },
        content.location
      );
      
      return distance <= radius;
    });
  }

  // Find content by permissions
  async findContentByPermissions(requiredPermissions: { read: boolean; write: boolean; execute: boolean }): Promise<Content[]> {
    return Array.from(this.contents.values()).filter(content => {
      if (!content.permissions) return false;
      
      return (
        (!requiredPermissions.read || content.permissions.read) &&
        (!requiredPermissions.write || content.permissions.write) &&
        (!requiredPermissions.execute || content.permissions.execute)
      );
    });
  }

  // Find content by roles
  async findContentByRoles(userRoles: string[]): Promise<Content[]> {
    return Array.from(this.contents.values()).filter(content => {
      if (!content.roles) return true; // No role restrictions
      
      return content.roles.some(role => userRoles.includes(role));
    });
  }

  // Helper methods
  private async getLocationName(location: { lat: number; lng: number }): Promise<string> {
    // This would typically call a geocoding service
    return `Location: ${location.lat}, ${location.lng}`;
  }

  private getPermissionLevel(permissions?: { read: boolean; write: boolean; execute: boolean }): 'public' | 'private' | 'restricted' {
    if (!permissions) return 'private';
    
    if (permissions.read && permissions.write && permissions.execute) return 'public';
    if (permissions.read) return 'restricted';
    return 'private';
  }

  private calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    // Simple distance calculation (in km)
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
```

## Step 3: Using the Custom Axiom System

```typescript
// Initialize the custom axiom service
const customAxiomService = new CustomAxiomService();

// Example 1: Internal database content with custom axioms
const internalContent = {
  id: "content-123",
  type: "Article",
  version: 1,
  createdAt: new Date("2022-01-01"),
  title: "Local News Article",
  content: "Breaking news about local events",
  location: { lat: 40.7128, lng: -74.0060 }, // New York City
  permissions: { read: true, write: false, execute: false },
  roles: ["editor", "admin"],
  authorId: "author-1"
};

// Example 2: CMS content with different field names
const cmsContent = {
  id: "content-456",
  type: "Blog Post",
  version: 1,
  created_at: "2022-01-15T10:30:00Z",
  title: "Travel Guide",
  body: "A comprehensive guide to traveling",
  coordinates: { latitude: 51.5074, longitude: -0.1278 }, // London
  perms: "rw-", // Unix-style permissions
  groups: "traveler,reader",
  author_id: "author-2"
};

// Example 3: API content with different structure
const apiContent = {
  id: "content-789",
  type: "Document",
  version: 1,
  createdAt: "2022-02-01T00:00:00Z",
  name: "Technical Documentation",
  content: "API documentation and examples",
  geo: { coordinates: [139.6917, 35.6895] }, // Tokyo (GeoJSON format)
  access: { read: true, write: true, execute: false },
  role: "developer,admin",
  authorId: "author-3"
};

// Example 4: JSON-LD content
const jsonLdContent = {
  "@id": "https://api.example.com/content/guide",
  "@type": "Guide",
  "@version": 1,
  "dateCreated": "2022-02-15T14:00:00Z",
  "title": "User Guide",
  "content": "Step-by-step user guide",
  "position": { lat: 37.7749, lng: -122.4194 }, // San Francisco
  "rights": { read: true, write: false, execute: false },
  "permissions": "admin,user",
  "authorId": "author-4"
};

// Import all content - same method works for all sources and custom axioms!
const importedInternal = await customAxiomService.importContent(internalContent, 'internal');
const importedCms = await customAxiomService.importContent(cmsContent, 'cms');
const importedApi = await customAxiomService.importContent(apiContent, 'api');
const importedJsonLd = await customAxiomService.importContent(jsonLdContent, 'jsonld');

console.log('Imported content:', {
  internal: importedInternal.title,
  cms: importedCms.title,
  api: importedApi.title,
  jsonld: importedJsonLd.title
});

// Find content by location - works across all sources!
const nycContent = await customAxiomService.findContentByLocation(40.7128, -74.0060, 10);
console.log('Content near NYC:', nycContent.map(c => c.title));

// Find content by permissions - works across all sources!
const publicContent = await customAxiomService.findContentByPermissions({
  read: true,
  write: false,
  execute: false
});
console.log('Public content:', publicContent.map(c => c.title));

// Find content by roles - works across all sources!
const adminContent = await customAxiomService.findContentByRoles(['admin']);
console.log('Admin content:', adminContent.map(c => c.title));

// Get content with full details
const contentDetails = await customAxiomService.getContentWithDetails(importedInternal.id);
console.log('Content details:', {
  title: contentDetails?.title,
  location: contentDetails?.locationName,
  permissionLevel: contentDetails?.permissionLevel
});
```

## Key Benefits

This example demonstrates:
- **Custom Axioms**: Define domain-specific concepts like geolocation, permissions, and roles
- **Format Flexibility**: Handle different data structures and field names
- **Universal Operations**: Same methods work across all sources and custom axioms
- **Domain Logic**: Rich business logic that works regardless of data source
- **Extensibility**: Easy to add new custom axioms for new domain concepts