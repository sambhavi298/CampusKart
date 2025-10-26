import { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import { apiCall } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { Loader2 } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  condition: string;
  imageUrl?: string;
  sellerName: string;
  sellerId: string;
  sellerEmail: string;
  createdAt: string;
}

interface ProductsPageProps {
  onProductClick: (product: Product) => void;
}

export function ProductsPage({ onProductClick }: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await apiCall('/products');
      setProducts(data.products);
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#FF6B35' }} />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <span className="text-4xl">📦</span>
        </div>
        <h2 className="text-2xl mb-2">No products yet</h2>
        <p className="text-muted-foreground">
          Be the first to list a product on CampusKart!
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl mb-6">Available Products</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onProductClick(product)}
          />
        ))}
      </div>
    </div>
  );
}
