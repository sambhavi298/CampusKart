import { ShoppingBag, MessageSquare, User, Plus, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { createClient } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface HeaderProps {
  currentView: 'products' | 'messages' | 'profile' | 'upload';
  onViewChange: (view: 'products' | 'messages' | 'profile' | 'upload') => void;
  onLogout: () => void;
}

export function Header({ currentView, onViewChange, onLogout }: HeaderProps) {
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      toast.success('Logged out successfully');
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewChange('products')}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF6B35' }}>
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl">CampusKart</span>
          </div>

          <nav className="flex items-center gap-2">
            <Button
              variant={currentView === 'products' ? 'default' : 'ghost'}
              onClick={() => onViewChange('products')}
              style={currentView === 'products' ? { backgroundColor: '#FF6B35' } : {}}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Products
            </Button>
            
            <Button
              variant={currentView === 'messages' ? 'default' : 'ghost'}
              onClick={() => onViewChange('messages')}
              style={currentView === 'messages' ? { backgroundColor: '#FF6B35' } : {}}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </Button>
            
            <Button
              variant={currentView === 'upload' ? 'default' : 'ghost'}
              onClick={() => onViewChange('upload')}
              style={currentView === 'upload' ? { backgroundColor: '#FF6B35' } : {}}
            >
              <Plus className="w-4 h-4 mr-2" />
              Sell
            </Button>
            
            <Button
              variant={currentView === 'profile' ? 'default' : 'ghost'}
              onClick={() => onViewChange('profile')}
              style={currentView === 'profile' ? { backgroundColor: '#FF6B35' } : {}}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>

            <Button
              variant="ghost"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
