import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { apiCall } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { Send, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  conversationId: string;
  productId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  message: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  participants: string[];
  productId: string;
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

interface ChatWindowProps {
  conversation: Conversation;
  onMessageSent: () => void;
}

export function ChatWindow({ conversation, onMessageSent }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem('user_id');

  useEffect(() => {
    loadMessages();
    
    // Auto-refresh messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [conversation.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await apiCall(`/messages/${conversation.id}`);
      setMessages(data.messages);
    } catch (error: any) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;

    setSending(true);

    try {
      await apiCall('/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          productId: conversation.productId,
          receiverId: conversation.otherUser.id,
          message: messageText.trim(),
        }),
      });

      setMessageText('');
      loadMessages();
      onMessageSent();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex justify-between items-center">
          <span>{conversation.otherUser.name}</span>
          <span className="text-sm" style={{ color: '#FF6B35' }}>
            ₹{conversation.product.price}
          </span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{conversation.product.title}</p>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isCurrentUser = message.senderId === currentUserId;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isCurrentUser
                        ? 'text-white'
                        : 'bg-gray-100'
                    }`}
                    style={isCurrentUser ? { backgroundColor: '#FF6B35' } : {}}
                  >
                    <p className="text-sm break-words">{message.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-white/80' : 'text-muted-foreground'
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>

      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
          />
          <Button
            type="submit"
            disabled={sending || !messageText.trim()}
            style={{ backgroundColor: '#FF6B35' }}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}
