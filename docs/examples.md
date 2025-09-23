# Canon Examples: A Complete Workflow

## Overview

This document walks through a complete, real-world example of using Canon's core axioms. We'll build a product catalog system that integrates data from multiple sources: our internal database, a JSON-LD API, and a REST API. This demonstrates why Canon is valuable - without it, you'd need format-specific code for each source.

## The Scenario

Imagine you're building a product catalog system that needs to:
- Display products from your internal database (standard format)
- Integrate products from a JSON-LD e-commerce API
- Import products from a REST API
- Handle relationships between products, categories, and reviews
- Support versioning and audit trails across all sources

Without Canon, you'd need separate code paths for each data source. With Canon, you write universal code that works across all formats.

## Step 1: Setting Up Our Application

We'll start by importing the core axioms. The core axioms (Id, Type, Version, Timestamps, References) are already provided by Canon.

```typescript
import { idOf, typeOf, versionOf, timestampsOf, referencesOf } from '@relational-fabric/canon';
import type { Satisfies } from '@relational-fabric/canon';
```

## Step 2: Creating Our Data Models

Let's define our application's data models that can work with any data format.

```typescript
// Our internal models that work with any data format
type Product = {
  id: string;
  type: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  sku: string;
} & Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps' | 'References'>;

type Category = {
  id: string;
  type: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  parentId?: string;
} & Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps' | 'References'>;

type Review = {
  id: string;
  type: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
} & Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps' | 'References'>;

// Define application-specific types
interface ProductWithDetails extends Product {
  category?: Category;
  reviews?: Review[];
  averageRating?: number;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}
```

## Step 3: Building Universal Services

Now we'll create services that work with any data format using the core axioms.

### Product Service

```typescript
class ProductService {
  private products: Product[] = [];
  private categories: Category[] = [];
  private reviews: Review[] = [];

  // Import product from any source - this is where Canon shines!
  async importProduct<T extends Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps' | 'References'>>(
    productData: T,
    source: 'internal' | 'jsonld' | 'rest'
  ): Promise<Product> {
    const id = idOf(productData);
    const type = typeOf(productData);
    const version = versionOf(productData) || 1;
    const timestamp = timestampsOf(productData) || new Date();

    // Universal validation - works with any format
    if (!this.isValidId(id)) {
      throw new Error(`Invalid product ID from ${source}: ${id}`);
    }

    if (!this.isValidType(type)) {
      throw new Error(`Invalid product type from ${source}: ${type}`);
    }

    // Convert to our internal format - this is the magic!
    const product: Product = {
      id,
      type,
      version,
      createdAt: timestamp,
      updatedAt: timestamp,
      name: (productData as any).name || (productData as any).title,
      description: (productData as any).description || (productData as any).summary,
      price: (productData as any).price || (productData as any).cost,
      categoryId: referencesOf(productData) || (productData as any).categoryId,
      sku: (productData as any).sku || (productData as any).productCode,
    };

    this.products.push(product);
    console.log(`✅ Imported product from ${source}:`, product.name);
    
    return product;
  }

  // Get product with full details - works with any source
  async getProductWithDetails(productId: string): Promise<ProductWithDetails | null> {
    const product = this.products.find(p => p.id === productId);
    if (!product) return null;

    const category = this.categories.find(c => c.id === product.categoryId);
    const productReviews = this.reviews.filter(r => r.productId === productId);
    const averageRating = productReviews.length > 0 
      ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length 
      : 0;

    return {
      ...product,
      category,
      reviews: productReviews,
      averageRating
    };
  }

  // Find products by category - universal across all sources
  async findProductsByCategory<T extends Satisfies<'References'>>(
    categoryId: string,
    since?: Date
  ): Promise<Product[]> {
    let products = this.products.filter(p => p.categoryId === categoryId);

    if (since) {
      products = products.filter(p => p.createdAt > since);
    }

    return products;
  }

  // Update product - works with any format
  async updateProduct<T extends Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps'>>(
    productData: T,
    updates: Partial<Product>
  ): Promise<Product> {
    const id = idOf(productData);
    const currentVersion = versionOf(productData);

    // Check for concurrent modifications
    const existingProduct = this.products.find(p => p.id === id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    if (existingProduct.version !== currentVersion) {
      throw new Error('Product has been modified by another user');
    }

    // Apply updates
    const updatedProduct: Product = {
      ...existingProduct,
      ...updates,
      version: existingProduct.version + 1,
      updatedAt: new Date(),
    };

    const index = this.products.findIndex(p => p.id === id);
    this.products[index] = updatedProduct;
    
    console.log(`✅ Updated product:`, updatedProduct.name);
    return updatedProduct;
  }

  // Validation helpers
  private isValidId(id: string): boolean {
    return id && id.length > 0;
  }

  private isValidType(type: string): boolean {
    return ['Product', 'Item', 'Good'].includes(type);
  }
}
```

### Category Service

```typescript
class CategoryService {
  private categories: Category[] = [];

  async importCategory<T extends Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps' | 'References'>>(
    categoryData: T,
    source: 'internal' | 'jsonld' | 'rest'
  ): Promise<Category> {
    const id = idOf(categoryData);
    const type = typeOf(categoryData);
    const version = versionOf(categoryData) || 1;
    const timestamp = timestampsOf(categoryData) || new Date();

    const category: Category = {
      id,
      type,
      version,
      createdAt: timestamp,
      updatedAt: timestamp,
      name: (categoryData as any).name || (categoryData as any).title,
      parentId: referencesOf(categoryData) || (categoryData as any).parentId,
    };

    this.categories.push(category);
    console.log(`✅ Imported category from ${source}:`, category.name);
    
    return category;
  }

  async getCategory(categoryId: string): Promise<Category | null> {
    return this.categories.find(c => c.id === categoryId) || null;
  }
}
```

## Step 4: Using the Universal System

Now let's see how our universal system works with different data formats:

```typescript
// Initialize services
const productService = new ProductService();
const categoryService = new CategoryService();

// Example 1: Internal database format (our standard)
const internalProduct = {
  id: "prod-123",
  type: "Product",
  version: 1,
  createdAt: new Date("2022-01-01"),
  name: "Wireless Headphones",
  description: "High-quality wireless headphones",
  price: 99.99,
  categoryId: "cat-electronics",
  sku: "WH-001"
};

// Example 2: JSON-LD format from e-commerce API
const jsonLdProduct = {
  "@id": "https://api.store.com/products/wireless-mouse",
  "@type": "Product",
  "@version": 1,
  "dateCreated": "2022-01-15T10:30:00Z",
  "name": "Wireless Mouse",
  "summary": "Ergonomic wireless mouse with precision tracking",
  "cost": 29.99,
  "category": "https://api.store.com/categories/electronics",
  "productCode": "WM-002"
};

// Example 3: REST API format from supplier
const restProduct = {
  id: "supplier-456",
  type: "Item",
  version: 1,
  created_at: 1640995200,
  title: "Mechanical Keyboard",
  description: "RGB mechanical keyboard with blue switches",
  price: 149.99,
  categoryId: "cat-electronics",
  sku: "KB-003"
};

// Import categories first
await categoryService.importCategory({
  id: "cat-electronics",
  type: "Category",
  name: "Electronics",
  createdAt: new Date("2022-01-01")
}, 'internal');

// All formats work with the same service methods!
const importedInternal = await productService.importProduct(internalProduct, 'internal');
const importedJsonLd = await productService.importProduct(jsonLdProduct, 'jsonld');
const importedRest = await productService.importProduct(restProduct, 'rest');

console.log('Imported products:', {
  internal: importedInternal.name,
  jsonLd: importedJsonLd.name,
  rest: importedRest.name
});

// Get product with full details - works the same for all sources
const productDetails = await productService.getProductWithDetails(importedJsonLd.id);
console.log('Product details:', {
  name: productDetails?.name,
  category: productDetails?.category?.name,
  averageRating: productDetails?.averageRating
});

// Find products by category - universal across all sources
const electronicsProducts = await productService.findProductsByCategory('cat-electronics');
console.log('Electronics products:', electronicsProducts.map(p => p.name));
```

## Step 5: Handling Updates with Optimistic Concurrency

Let's see how optimistic concurrency control works across different sources:

```typescript
// Update a product from any source
try {
  const updatedProduct = await productService.updateProduct(importedJsonLd, {
    name: "Wireless Mouse Pro",
    price: 34.99
  });
  
  console.log('Product updated successfully:', updatedProduct.name);
  console.log('New version:', updatedProduct.version);
} catch (error) {
  console.error('Update failed:', error.message);
}

// Simulate concurrent modification
const conflictingProduct = { ...importedRest, version: 999 };
try {
  await productService.updateProduct(conflictingProduct, {
    name: "Conflicting Update"
  });
} catch (error) {
  console.log('Concurrent modification detected:', error.message);
}
```

## Step 6: The Power of Universal Code

Let's demonstrate why Canon is valuable by showing what happens when we add a new data source:

```typescript
// New data source: GraphQL API
const graphqlProduct = {
  id: "gql-789",
  __typename: "Product",
  version: 1,
  createdAt: "2022-02-01T00:00:00Z",
  title: "Smart Watch",
  description: "Fitness tracking smart watch",
  cost: 199.99,
  category: "cat-electronics",
  productCode: "SW-004"
};

// No new code needed! The same service method works
const importedGraphql = await productService.importProduct(graphqlProduct, 'rest');
console.log('✅ GraphQL product imported:', importedGraphql.name);

// All queries work the same
const allProducts = await productService.findProductsByCategory('cat-electronics');
console.log('Total products:', allProducts.length);
```

## Key Benefits Demonstrated

This example shows why Canon is valuable:

1. **Universal Import**: Same `importProduct` method works with internal DB, JSON-LD, REST, and GraphQL
2. **Format Independence**: Business logic doesn't need to know about data source differences
3. **Easy Integration**: Adding new data sources requires no code changes
4. **Type Safety**: TypeScript ensures compile-time validation across all formats
5. **Consistent API**: All products work the same way regardless of source
6. **Maintainable**: One codebase handles all data sources

## Conclusion

By using Canon's core axioms, we've built a product catalog system that:
- Seamlessly integrates data from multiple sources (internal DB, JSON-LD API, REST API)
- Provides a consistent API regardless of data source
- Handles optimistic concurrency control across all sources
- Requires no code changes when adding new data sources
- Maintains type safety and validation across all formats

The system demonstrates the real value of Canon: **universal code that works across diverse data sources without format-specific logic**.