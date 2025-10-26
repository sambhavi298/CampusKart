import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase client for storage and auth
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize storage bucket on startup
const BUCKET_NAME = 'make-c38bb9ce-products';
(async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
  if (!bucketExists) {
    await supabase.storage.createBucket(BUCKET_NAME, { public: false });
    console.log(`Created bucket: ${BUCKET_NAME}`);
  }
})();

// Helper to verify user authentication
async function verifyUser(authHeader: string | null) {
  if (!authHeader) return null;
  const accessToken = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) return null;
  return user;
}

// Health check endpoint
app.get("/make-server-c38bb9ce/health", (c) => {
  return c.json({ status: "ok" });
});

// SIGNUP - Create new user with @srmist.edu.in email validation
app.post("/make-server-c38bb9ce/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    // Validate email domain
    if (!email.endsWith('@srmist.edu.in')) {
      return c.json({ error: 'Only @srmist.edu.in email addresses are allowed' }, 400);
    }

    // Create user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Initialize user data
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      aadharVerified: false,
      aadharNumber: null,
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// VERIFY AADHAR - Store Aadhar number for user
app.post("/make-server-c38bb9ce/verify-aadhar", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { aadharNumber } = await c.req.json();
    
    if (!aadharNumber || aadharNumber.length !== 12) {
      return c.json({ error: 'Invalid Aadhar number' }, 400);
    }

    // Get user data
    const userData = await kv.get(`user:${user.id}`);
    
    // Update user with Aadhar verification
    await kv.set(`user:${user.id}`, {
      ...userData,
      aadharNumber,
      aadharVerified: true,
      aadharVerifiedAt: new Date().toISOString()
    });

    return c.json({ success: true, message: 'Aadhar verified successfully' });
  } catch (error) {
    console.error('Aadhar verification error:', error);
    return c.json({ error: 'Failed to verify Aadhar' }, 500);
  }
});

// GET USER DATA
app.get("/make-server-c38bb9ce/user", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    return c.json({ user: userData });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Failed to get user data' }, 500);
  }
});

// UPLOAD IMAGE - Upload product image to Supabase Storage
app.post("/make-server-c38bb9ce/upload-image", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const fileBuffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return c.json({ error: 'Failed to upload image' }, 500);
    }

    // Get signed URL
    const { data: signedUrlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

    return c.json({ success: true, path: fileName, url: signedUrlData?.signedUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Failed to upload image' }, 500);
  }
});

// CREATE PRODUCT - Create new product listing
app.post("/make-server-c38bb9ce/products", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user has verified Aadhar
    const userData = await kv.get(`user:${user.id}`);
    if (!userData?.aadharVerified) {
      return c.json({ error: 'Aadhar verification required to sell products' }, 403);
    }

    const { title, description, price, condition, imagePath } = await c.req.json();
    
    const productId = `product:${Date.now()}-${user.id}`;
    const product = {
      id: productId,
      title,
      description,
      price: parseFloat(price),
      condition,
      imagePath,
      sellerId: user.id,
      sellerName: userData.name,
      sellerEmail: userData.email,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    await kv.set(productId, product);

    // Get signed URL for the image
    if (imagePath) {
      const { data: signedUrlData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(imagePath, 60 * 60 * 24 * 365);
      
      product.imageUrl = signedUrlData?.signedUrl;
    }

    return c.json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    return c.json({ error: 'Failed to create product' }, 500);
  }
});

// GET ALL PRODUCTS
app.get("/make-server-c38bb9ce/products", async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    
    // Get signed URLs for all products
    const productsWithUrls = await Promise.all(
      products.map(async (product: any) => {
        if (product.imagePath) {
          const { data: signedUrlData } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(product.imagePath, 60 * 60 * 24 * 365);
          
          return { ...product, imageUrl: signedUrlData?.signedUrl };
        }
        return product;
      })
    );

    // Sort by createdAt descending
    productsWithUrls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ products: productsWithUrls });
  } catch (error) {
    console.error('Get products error:', error);
    return c.json({ error: 'Failed to get products' }, 500);
  }
});

// GET SINGLE PRODUCT
app.get("/make-server-c38bb9ce/products/:id", async (c) => {
  try {
    const productId = c.req.param('id');
    const product = await kv.get(productId);
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    // Get signed URL
    if (product.imagePath) {
      const { data: signedUrlData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(product.imagePath, 60 * 60 * 24 * 365);
      
      product.imageUrl = signedUrlData?.signedUrl;
    }

    return c.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return c.json({ error: 'Failed to get product' }, 500);
  }
});

// SEND MESSAGE
app.post("/make-server-c38bb9ce/messages/send", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { productId, receiverId, message } = await c.req.json();
    
    const userData = await kv.get(`user:${user.id}`);
    
    // Create conversation ID (sorted to ensure consistency)
    const conversationId = [user.id, receiverId].sort().join(':');
    
    const messageId = `message:${conversationId}:${Date.now()}`;
    const messageData = {
      id: messageId,
      conversationId,
      productId,
      senderId: user.id,
      senderName: userData.name,
      receiverId,
      message,
      createdAt: new Date().toISOString()
    };

    await kv.set(messageId, messageData);

    // Update conversation metadata
    await kv.set(`conversation:${conversationId}`, {
      id: conversationId,
      participants: [user.id, receiverId],
      productId,
      lastMessage: message,
      lastMessageAt: new Date().toISOString()
    });

    return c.json({ success: true, message: messageData });
  } catch (error) {
    console.error('Send message error:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// GET CONVERSATIONS
app.get("/make-server-c38bb9ce/conversations", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allConversations = await kv.getByPrefix('conversation:');
    
    // Filter conversations where user is a participant
    const userConversations = allConversations.filter((conv: any) => 
      conv.participants.includes(user.id)
    );

    // Enrich with product and other user info
    const enrichedConversations = await Promise.all(
      userConversations.map(async (conv: any) => {
        const product = await kv.get(conv.productId);
        const otherUserId = conv.participants.find((id: string) => id !== user.id);
        const otherUser = await kv.get(`user:${otherUserId}`);

        return {
          ...conv,
          product,
          otherUser: otherUser ? { id: otherUser.id, name: otherUser.name, email: otherUser.email } : null
        };
      })
    );

    // Sort by last message time
    enrichedConversations.sort((a, b) => 
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );

    return c.json({ conversations: enrichedConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    return c.json({ error: 'Failed to get conversations' }, 500);
  }
});

// GET MESSAGES FOR A CONVERSATION
app.get("/make-server-c38bb9ce/messages/:conversationId", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const conversationId = c.req.param('conversationId');
    
    // Verify user is part of conversation
    if (!conversationId.includes(user.id)) {
      return c.json({ error: 'Unauthorized access to conversation' }, 403);
    }

    const allMessages = await kv.getByPrefix(`message:${conversationId}:`);
    
    // Sort by timestamp
    allMessages.sort((a: any, b: any) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return c.json({ messages: allMessages });
  } catch (error) {
    console.error('Get messages error:', error);
    return c.json({ error: 'Failed to get messages' }, 500);
  }
});

Deno.serve(app.fetch);
