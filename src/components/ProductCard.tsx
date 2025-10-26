import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  condition: string;
  imageUrl?: string;
  sellerName: string;
  createdAt: string;
}

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const conditionColors: Record<string, string> = {
    'brand-new': 'bg-green-100 text-green-800',
    'like-new': 'bg-blue-100 text-blue-800',
    'good': 'bg-yellow-100 text-yellow-800',
    'fair': 'bg-orange-100 text-orange-800',
    'poor': 'bg-red-100 text-red-800',
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="aspect-square relative bg-gray-100">
        {product.imageUrl ? (
          <ImageWithFallback
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="truncate mb-1">{product.title}</h3>
        <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
          {product.description || 'No description'}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl" style={{ color: '#FF6B35' }}>
            ₹{product.price.toLocaleString()}
          </span>
          <Badge className={conditionColors[product.condition] || 'bg-gray-100 text-gray-800'}>
            {product.condition.replace('-', ' ')}
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 bg-gray-50 text-sm text-muted-foreground">
        Sold by {product.sellerName}
      </CardFooter>
    </Card>
  );
}
