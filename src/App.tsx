import { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { Header } from './components/Header';
import { ProductsPage } from './components/ProductsPage';
import { ProductDetailModal } from './components/ProductDetailModal';
import { UploadProductPage } from './components/UploadProductPage';
import { ProfilePage } from './components/ProfilePage';
import { MessagesPage } from './components/MessagesPage';
import { Toaster } from './components/ui/sonner';
import { apiCall } from './utils/api';
import { createClient } from './utils/supabase/client';

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

type View = 'products' | 'messages' | 'profile' | 'upload';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentView, setCurrentView] = useState<View>('products');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isUserVerified, setIsUserVerified] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        localStorage.setItem('access_token', session.access_token);
        localStorage.setItem('user_id', session.user.id);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setCurrentView('products');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('products');
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleContactSeller = async (product: Product) => {
    // Switch to messages view and initiate conversation
    setCurrentView('messages');
    
    // Send initial message to create conversation
    try {
      await apiCall('/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          receiverId: product.sellerId,
          message: `Hi! I'm interested in your ${product.title}`,
        }),
      });
    } catch (error) {
      console.error('Error initiating conversation:', error);
    }
  };

  const handleProductCreated = () => {
    setCurrentView('products');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#FF6B35' }}>
            <span className="text-2xl">🛒</span>
          </div>
          <p className="text-muted-foreground">Loading CampusKart...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthPage onAuthSuccess={handleAuthSuccess} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF5F0' }}>
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
      />
      
      <main className="min-h-[calc(100vh-64px)]">
        {currentView === 'products' && (
          <ProductsPage onProductClick={handleProductClick} />
        )}
        
        {currentView === 'messages' && <MessagesPage />}
        
        {currentView === 'profile' && (
          <ProfilePage onVerificationChange={setIsUserVerified} />
        )}
        
        {currentView === 'upload' && (
          <UploadProductPage
            onProductCreated={handleProductCreated}
            userVerified={isUserVerified}
          />
        )}
      </main>

      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onContactSeller={handleContactSeller}
      />

      <Toaster />
    </div>
  );
}
