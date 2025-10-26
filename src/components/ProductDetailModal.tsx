import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MessageSquare, User } from 'lucide-react';

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

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onContactSeller: (product: Product) => void;
}

export function ProductDetailModal({ product, open, onClose, onContactSeller }: ProductDetailModalProps) {
  if (!product) return null;

  const currentUserId = localStorage.getItem('user_id');
  const isOwnProduct = product.sellerId === currentUserId;

  const conditionColors: Record<string, string> = {
    'brand-new': 'bg-green-100 text-green-800',
    'like-new': 'bg-blue-100 text-blue-800',
    'good': 'bg-yellow-100 text-yellow-800',
    'fair': 'bg-orange-100 text-orange-800',
    'poor': 'bg-red-100 text-red-800',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.title}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
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

          <div className="space-y-4">
            <div>
              <h3 className="text-3xl mb-2" style={{ color: '#FF6B35' }}>
                ₹{product.price.toLocaleString()}
              </h3>
              <Badge className={conditionColors[product.condition] || 'bg-gray-100 text-gray-800'}>
                {product.condition.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>

            <div>
              <h4 className="text-sm mb-1">Description</h4>
              <p className="text-muted-foreground">
                {product.description || 'No description provided'}
              </p>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Seller Information</span>
              </div>
              <p className="mb-1">{product.sellerName}</p>
              <p className="text-sm text-muted-foreground">{product.sellerEmail}</p>
            </div>

            {!isOwnProduct && (
              <Button
                className="w-full"
                style={{ backgroundColor: '#FF6B35' }}
                onClick={() => {
                  onContactSeller(product);
                  onClose();
                }}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Seller
              </Button>
            )}

            {isOwnProduct && (
              <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm text-center">
                This is your listing
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Listed on {new Date(product.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
