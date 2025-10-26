import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { apiCall } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { MessageSquare, Loader2 } from 'lucide-react';
import { ChatWindow } from './ChatWindow';

interface Conversation {
  id: string;
  participants: string[];
  productId: string;
  lastMessage: string;
  lastMessageAt: string;
  product: {
    title: string;
    price: number;
  };
  otherUser: {
    id: string;
    name: string;
    email: string;
  };
}

export function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
    
    // Refresh conversations every 5 seconds
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    try {
      const data = await apiCall('/conversations');
      setConversations(data.conversations);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
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

  if (conversations.length === 0 && !selectedConversation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <MessageSquare className="w-24 h-24 text-gray-300 mb-4" />
        <h2 className="text-2xl mb-2">No messages yet</h2>
        <p className="text-muted-foreground">
          Start a conversation by contacting a seller on a product listing
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl mb-6">Messages</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="md:col-span-1 space-y-2">
          {conversations.map((conversation) => (
            <Card
              key={conversation.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selectedConversation?.id === conversation.id ? 'ring-2' : ''
              }`}
              style={
                selectedConversation?.id === conversation.id
                  ? { borderColor: '#FF6B35' }
                  : {}
              }
              onClick={() => setSelectedConversation(conversation)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="truncate flex-1">{conversation.otherUser.name}</h3>
                  <Badge variant="outline" className="text-xs ml-2">
                    ₹{conversation.product.price}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate mb-1">
                  {conversation.product.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {conversation.lastMessage}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(conversation.lastMessageAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chat Window */}
        <div className="md:col-span-2">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              onMessageSent={loadConversations}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center text-muted-foreground">
                Select a conversation to start chatting
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
