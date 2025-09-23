# Multi-Source Integration

## Overview

This example demonstrates how to integrate data from multiple sources (REST API, JSON-LD, GraphQL) into a unified product catalog system. It shows the real value of Canon for building universal data integration layers.

## The Scenario

Building a product catalog that needs to:
- Integrate products from multiple e-commerce APIs
- Handle different data formats and field names
- Provide a unified API regardless of source
- Support real-time updates from all sources

## Step 1: Setting Up the Integration

```typescript
import { idOf, typeOf, versionOf, timestampsOf, referencesOf } from '@relational-fabric/canon';
import type { Satisfies } from '@relational-fabric/canon';

// Our unified product model
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
  source: string;
} & Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps' | 'References'>;

// Define application-specific types
interface ProductWithDetails extends Product {
  category?: Category;
  reviews?: Review[];
  averageRating?: number;
}

interface Category {
  id: string;
  name: string;
  parentId?: string;
}

interface Review {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
```

## Step 2: Building Universal Integration Service

```typescript
class ProductIntegrationService {
  private products: Map<string, Product> = new Map();
  private categories: Map<string, Category> = new Map();
  private reviews: Map<string, Review[]> = new Map();

  // Universal product import - works with any source!
  async importProduct<T extends Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps' | 'References'>>(
    productData: T,
    source: 'shopify' | 'woocommerce' | 'magento' | 'jsonld'
  ): Promise<Product> {
    const id = idOf(productData);
    const type = typeOf(productData);
    const version = versionOf(productData) || 1;
    const timestamp = timestampsOf(productData) || new Date();

    // Universal validation
    if (!this.isValidId(id)) {
      throw new Error(`Invalid product ID from ${source}: ${id}`);
    }

    if (!this.isValidType(type)) {
      throw new Error(`Invalid product type from ${source}: ${type}`);
    }

    // Convert to unified format - this is where Canon shines!
    const product: Product = {
      id: `${source}-${id}`,
      type,
      version,
      createdAt: timestamp,
      updatedAt: timestamp,
      name: this.extractName(productData, source),
      description: this.extractDescription(productData, source),
      price: this.extractPrice(productData, source),
      categoryId: this.extractCategoryId(productData, source),
      sku: this.extractSku(productData, source),
      source
    };

    this.products.set(product.id, product);
    console.log(`✅ Imported product from ${source}:`, product.name);
    
    return product;
  }

  // Universal product search - works across all sources
  async searchProducts(query: string, source?: string): Promise<Product[]> {
    let products = Array.from(this.products.values());

    if (source) {
      products = products.filter(p => p.source === source);
    }

    return products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Get product with full details - universal across all sources
  async getProductWithDetails(productId: string): Promise<ProductWithDetails | null> {
    const product = this.products.get(productId);
    if (!product) return null;

    const category = this.categories.get(product.categoryId);
    const productReviews = this.reviews.get(productId) || [];
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

  // Update product - works with any source
  async updateProduct<T extends Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps'>>(
    productData: T,
    updates: Partial<Product>
  ): Promise<Product> {
    const id = idOf(productData);
    const currentVersion = versionOf(productData);

    // Find the product (could be from any source)
    const existingProduct = Array.from(this.products.values())
      .find(p => p.id.endsWith(id));

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

    this.products.set(updatedProduct.id, updatedProduct);
    console.log(`✅ Updated product:`, updatedProduct.name);
    
    return updatedProduct;
  }

  // Helper methods for extracting data from different formats
  private extractName<T>(productData: T, source: string): string {
    switch (source) {
      case 'shopify':
        return (productData as any).title;
      case 'woocommerce':
        return (productData as any).name;
      case 'magento':
        return (productData as any).name;
      case 'jsonld':
        return (productData as any).name || (productData as any).title;
      default:
        return (productData as any).name || (productData as any).title;
    }
  }

  private extractDescription<T>(productData: T, source: string): string {
    switch (source) {
      case 'shopify':
        return (productData as any).body_html || '';
      case 'woocommerce':
        return (productData as any).description || '';
      case 'magento':
        return (productData as any).description || '';
      case 'jsonld':
        return (productData as any).description || (productData as any).summary || '';
      default:
        return (productData as any).description || '';
    }
  }

  private extractPrice<T>(productData: T, source: string): number {
    switch (source) {
      case 'shopify':
        return parseFloat((productData as any).variants?.[0]?.price || '0');
      case 'woocommerce':
        return parseFloat((productData as any).price || '0');
      case 'magento':
        return parseFloat((productData as any).price || '0');
      case 'jsonld':
        return parseFloat((productData as any).price || (productData as any).cost || '0');
      default:
        return parseFloat((productData as any).price || '0');
    }
  }

  private extractCategoryId<T>(productData: T, source: string): string {
    switch (source) {
      case 'shopify':
        return `shopify-cat-${(productData as any).product_type}`;
      case 'woocommerce':
        return `woo-cat-${(productData as any).categories?.[0]?.id || 'uncategorized'}`;
      case 'magento':
        return `magento-cat-${(productData as any).category_id || 'uncategorized'}`;
      case 'jsonld':
        return `jsonld-cat-${referencesOf(productData) || 'uncategorized'}`;
      default:
        return 'uncategorized';
    }
  }

  private extractSku<T>(productData: T, source: string): string {
    switch (source) {
      case 'shopify':
        return (productData as any).variants?.[0]?.sku || '';
      case 'woocommerce':
        return (productData as any).sku || '';
      case 'magento':
        return (productData as any).sku || '';
      case 'jsonld':
        return (productData as any).sku || (productData as any).productCode || '';
      default:
        return (productData as any).sku || '';
    }
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

## Step 3: Using the Universal Integration System

```typescript
// Initialize the integration service
const integrationService = new ProductIntegrationService();

// Example 1: Shopify product (REST API)
const shopifyProduct = {
  id: "123456789",
  title: "Wireless Headphones",
  body_html: "<p>High-quality wireless headphones with noise cancellation</p>",
  product_type: "Electronics",
  variants: [{
    price: "99.99",
    sku: "WH-001"
  }],
  created_at: "2022-01-01T00:00:00Z",
  updated_at: "2022-01-01T00:00:00Z"
};

// Example 2: WooCommerce product (REST API)
const woocommerceProduct = {
  id: 987654321,
  name: "Mechanical Keyboard",
  description: "RGB mechanical keyboard with blue switches",
  price: "149.99",
  sku: "KB-002",
  categories: [{
    id: 5,
    name: "Electronics"
  }],
  date_created: "2022-01-15T10:30:00",
  date_modified: "2022-01-15T10:30:00"
};

// Example 3: Magento product (REST API)
const magentoProduct = {
  id: 456789123,
  name: "Smart Watch",
  description: "Fitness tracking smart watch with heart rate monitor",
  price: 199.99,
  sku: "SW-003",
  category_id: 12,
  created_at: "2022-02-01T00:00:00",
  updated_at: "2022-02-01T00:00:00"
};

// Example 4: JSON-LD product from e-commerce API
const jsonLdProduct = {
  "@id": "https://api.store.com/products/wireless-mouse",
  "@type": "Product",
  "name": "Wireless Mouse",
  "summary": "Ergonomic wireless mouse with precision tracking",
  "cost": "29.99",
  "category": "https://api.store.com/categories/electronics",
  "productCode": "WM-004",
  "dateCreated": "2022-01-20T14:00:00Z"
};

// Import all products - same method works for all sources!
const importedShopify = await integrationService.importProduct(shopifyProduct, 'shopify');
const importedWooCommerce = await integrationService.importProduct(woocommerceProduct, 'woocommerce');
const importedMagento = await integrationService.importProduct(magentoProduct, 'magento');
const importedJsonLd = await integrationService.importProduct(jsonLdProduct, 'jsonld');

console.log('Imported products:', {
  shopify: importedShopify.name,
  woocommerce: importedWooCommerce.name,
  magento: importedMagento.name,
  jsonld: importedJsonLd.name
});

// Universal search across all sources
const searchResults = await integrationService.searchProducts('wireless');
console.log('Search results:', searchResults.map(p => `${p.name} (${p.source})`));

// Get product details - works the same for all sources
const productDetails = await integrationService.getProductWithDetails(importedShopify.id);
console.log('Product details:', {
  name: productDetails?.name,
  price: productDetails?.price,
  source: productDetails?.source
});
```

## Key Benefits

This example demonstrates:
- **Universal Integration**: Same `importProduct()` method works with Shopify, WooCommerce, Magento, and JSON-LD
- **Format Independence**: Business logic doesn't need to know about API differences
- **Easy Extension**: Adding new sources requires no code changes
- **Unified API**: All products work the same way regardless of source
- **Real-World Value**: Shows practical integration scenarios