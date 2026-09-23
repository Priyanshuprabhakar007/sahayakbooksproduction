import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  isR2Configured,
  getSafeMaskedStatus,
  testR2Connection,
  uploadBufferToR2,
  deleteObjectFromR2,
  createPresignedUploadUrl,
} from './server/r2';
import { getDatabase, saveDatabase } from './server/db';
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  normalizeEmail,
  generateToken,
  createSession,
  validateSession,
  invalidateSession,
  invalidateAllUserSessions,
} from './server/auth';
import {
  getMerchantConfig,
  testMerchantConnection,
  syncBookToGoogleMerchantAPI,
  removeBookFromGoogleMerchantAPI,
  bulkSyncBooksToGoogleMerchantAPI,
  getGoogleShoppingDashboardMetrics,
  validateBookForGoogleMerchant,
  recordSyncLog,
  maskSecret,
} from './server/googleMerchant';

dotenv.config();

function sanitizeUser(user: any) {
  if (!user) return null;
  const { passwordHash, resetToken, resetTokenExpires, verifyToken, ...rest } = user;
  return rest;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // High body size limit for base64 / raw image uploads up to 50mb
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // ============================================================
  // DATABASE & PERSISTENCE API ROUTES (ALWAYS BEFORE VITE)
  // ============================================================

  // System Health & Database status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      r2Configured: isR2Configured(),
      dbConnected: true,
    });
  });

  // Get full database snapshot
  app.get('/api/db', (req, res) => {
    try {
      const db = getDatabase();
      res.json({ success: true, data: db });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Sync / bulk save database snapshot
  app.post('/api/db', (req, res) => {
    try {
      const payload = req.body;
      const updated = saveDatabase(payload);
      res.json({ success: true, message: 'Database saved successfully', data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ============================================================
  // CUSTOMER AUTHENTICATION & ACCOUNT ENDPOINTS
  // ============================================================

  // Helper middleware to extract authenticated user from session token
  const getAuthUser = (req: express.Request) => {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = tokenFromHeader || (req.headers['x-session-token'] as string) || (req.body?.sessionToken as string);
    if (!token) return null;
    const session = validateSession(token);
    if (!session) return null;
    const db = getDatabase();
    const user = (db.allUsers || []).find((u: any) => u.id === session.userId);
    return user ? { user, session } : null;
  };

  // Register Customer
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, phone, password, confirmPassword, agreeToTerms } = req.body;

      if (!name || !name.trim()) {
        res.status(400).json({ success: false, error: 'Full Name is required.' });
        return;
      }

      const cleanEmail = normalizeEmail(email);
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
        return;
      }

      if (password !== confirmPassword) {
        res.status(400).json({ success: false, error: 'Passwords do not match.' });
        return;
      }

      const passCheck = validatePasswordStrength(password);
      if (!passCheck.valid) {
        res.status(400).json({ success: false, error: passCheck.error });
        return;
      }

      if (!agreeToTerms) {
        res.status(400).json({ success: false, error: 'You must agree to the Terms & Privacy Policy to register.' });
        return;
      }

      const db = getDatabase();
      const existingUsers = db.allUsers || [];

      // Duplicate email protection
      const duplicate = existingUsers.find((u: any) => normalizeEmail(u.email) === cleanEmail);
      if (duplicate) {
        res.status(400).json({
          success: false,
          error: 'An account with this email already exists. Please log in or reset your password.',
        });
        return;
      }

      const userId = `usr-cust-${Date.now()}`;
      const passwordHashStr = hashPassword(password);
      const verifyTokenStr = generateToken('ver');

      const newUser = {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : '',
        passwordHash: passwordHashStr,
        role: 'CUSTOMER' as const, // Always CUSTOMER for public register
        emailVerified: false,
        verifyToken: verifyTokenStr,
        status: 'ACTIVE' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        registrationDate: new Date().toISOString().split('T')[0],
        addresses: [],
        wishlist: [],
        savedBookIds: [],
        savedArticleIds: [],
        orderIds: [],
        savedEbooks: [],
      };

      const updatedUsers = [newUser, ...existingUsers];

      // Track analytics
      const analyticsEvents = [
        {
          id: `ev-${Date.now()}-signup-start`,
          type: 'signup_started',
          target: cleanEmail,
          timestamp: new Date().toISOString(),
          device: 'web',
        },
        {
          id: `ev-${Date.now()}-signup-complete`,
          type: 'signup_completed',
          target: cleanEmail,
          timestamp: new Date().toISOString(),
          device: 'web',
        },
        ...(db.analyticsEvents || []).slice(0, 498),
      ];

      saveDatabase({ allUsers: updatedUsers as any, analyticsEvents });

      // Create session
      const { token, expiresAt } = createSession(userId, 'CUSTOMER', true);

      res.status(201).json({
        success: true,
        message: 'Account created successfully. Please verify your email.',
        user: sanitizeUser(newUser),
        sessionToken: token,
        expiresAt,
        verifyToken: verifyTokenStr, // Return token for mock email verification flow in development
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Registration failed.' });
    }
  });

  // Customer Login
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;
      const cleanEmail = normalizeEmail(email);

      if (!cleanEmail || !password) {
        res.status(400).json({ success: false, error: 'Email and password are required.' });
        return;
      }

      const db = getDatabase();
      const user = (db.allUsers || []).find((u: any) => normalizeEmail(u.email) === cleanEmail);

      // Generic login error if not found or wrong password (prevents email enumeration)
      if (!user || !verifyPassword(password, user.passwordHash)) {
        // Track analytics
        const analyticsEvents = [
          {
            id: `ev-${Date.now()}-login-fail`,
            type: 'login_failed',
            target: cleanEmail,
            timestamp: new Date().toISOString(),
            device: 'web',
          },
          ...(db.analyticsEvents || []).slice(0, 499),
        ];
        saveDatabase({ analyticsEvents });

        res.status(401).json({ success: false, error: 'Invalid email or password.' });
        return;
      }

      // Check user account status
      const userStatus = (user as any).status;
      if (userStatus === 'SUSPENDED' || userStatus === 'DISABLED' || userStatus === 'disabled') {
        res.status(403).json({
          success: false,
          error: 'Your account has been suspended or disabled. Please contact customer support.',
        });
        return;
      }

      // Update last login timestamp
      const updatedUser = {
        ...user,
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedUsers = (db.allUsers || []).map((u: any) => (u.id === user.id ? updatedUser : u));

      // Track analytics
      const analyticsEvents = [
        {
          id: `ev-${Date.now()}-login-success`,
          type: 'login_completed',
          target: cleanEmail,
          timestamp: new Date().toISOString(),
          device: 'web',
        },
        ...(db.analyticsEvents || []).slice(0, 499),
      ];

      saveDatabase({ allUsers: updatedUsers as any, analyticsEvents });

      const { token, expiresAt } = createSession(user.id, user.role, rememberMe);

      res.json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        user: sanitizeUser(updatedUser),
        sessionToken: token,
        expiresAt,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Login failed.' });
    }
  });

  // Get current logged in user
  app.get('/api/auth/me', (req, res) => {
    try {
      const auth = getAuthUser(req);
      if (!auth) {
        res.status(401).json({ success: false, error: 'Not authenticated.' });
        return;
      }
      res.json({ success: true, user: sanitizeUser(auth.user) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
      const token = tokenFromHeader || (req.headers['x-session-token'] as string) || (req.body?.sessionToken as string);
      if (token) {
        invalidateSession(token);
      }
      res.json({ success: true, message: 'Logged out successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Forgot Password
  app.post('/api/auth/forgot-password', (req, res) => {
    try {
      const { email } = req.body;
      const cleanEmail = normalizeEmail(email);

      if (!cleanEmail) {
        res.status(400).json({ success: false, error: 'Email address is required.' });
        return;
      }

      const db = getDatabase();
      const user = (db.allUsers || []).find((u: any) => normalizeEmail(u.email) === cleanEmail);

      if (user) {
        const resetToken = generateToken('reset');
        const resetTokenExpires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

        const updatedUsers = db.allUsers.map((u: any) =>
          u.id === user.id ? { ...u, resetToken, resetTokenExpires } : u
        );

        saveDatabase({ allUsers: updatedUsers });
      }

      // Track analytics
      const analyticsEvents = [
        {
          id: `ev-${Date.now()}-reset-req`,
          type: 'password_reset_requested',
          target: cleanEmail,
          timestamp: new Date().toISOString(),
          device: 'web',
        },
        ...(db.analyticsEvents || []).slice(0, 499),
      ];
      saveDatabase({ analyticsEvents });

      // Always return generic response to prevent email discovery
      res.json({
        success: true,
        message: 'If an account exists for this email, a password reset link has been sent.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Reset Password
  app.post('/api/auth/reset-password', (req, res) => {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      if (!token) {
        res.status(400).json({ success: false, error: 'Password reset token is missing.' });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).json({ success: false, error: 'Passwords do not match.' });
        return;
      }

      const passCheck = validatePasswordStrength(newPassword);
      if (!passCheck.valid) {
        res.status(400).json({ success: false, error: passCheck.error });
        return;
      }

      const db = getDatabase();
      const user = (db.allUsers || []).find(
        (u: any) => u.resetToken === token && new Date(u.resetTokenExpires).getTime() > Date.now()
      );

      if (!user) {
        res.status(400).json({ success: false, error: 'Password reset link is invalid or has expired.' });
        return;
      }

      const passwordHashStr = hashPassword(newPassword);
      const updatedUser = {
        ...user,
        passwordHash: passwordHashStr,
        resetToken: undefined,
        resetTokenExpires: undefined,
        updatedAt: new Date().toISOString(),
      };

      const updatedUsers = db.allUsers.map((u: any) => (u.id === user.id ? updatedUser : u));

      // Invalidate active sessions for security
      invalidateAllUserSessions(user.id);

      saveDatabase({ allUsers: updatedUsers });

      res.json({
        success: true,
        message: 'Password updated successfully. Please log in with your new password.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Verify Email
  app.post('/api/auth/verify-email', (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ success: false, error: 'Verification token is required.' });
        return;
      }

      const db = getDatabase();
      const user = (db.allUsers || []).find((u: any) => u.verifyToken === token || u.emailVerified === true);

      if (!user) {
        res.status(400).json({ success: false, error: 'Invalid or expired email verification token.' });
        return;
      }

      const updatedUser = {
        ...user,
        emailVerified: true,
        verifyToken: undefined,
        updatedAt: new Date().toISOString(),
      };

      const updatedUsers = db.allUsers.map((u: any) => (u.id === user.id ? updatedUser : u));
      saveDatabase({ allUsers: updatedUsers });

      res.json({
        success: true,
        message: 'Your email has been verified successfully.',
        user: sanitizeUser(updatedUser),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update Profile
  app.post('/api/auth/update-profile', (req, res) => {
    try {
      const auth = getAuthUser(req);
      if (!auth) {
        res.status(401).json({ success: false, error: 'Not authenticated.' });
        return;
      }

      const { name, phone, city, country, avatar } = req.body;
      const db = getDatabase();

      const updatedUser = {
        ...auth.user,
        name: name ? name.trim() : auth.user.name,
        phone: phone !== undefined ? phone : auth.user.phone,
        city: city !== undefined ? city : auth.user.city,
        country: country !== undefined ? country : auth.user.country,
        avatar: avatar !== undefined ? avatar : (auth.user as any).avatar,
        updatedAt: new Date().toISOString(),
      };

      const updatedUsers = db.allUsers.map((u: any) => (u.id === auth.user.id ? updatedUser : u));
      saveDatabase({ allUsers: updatedUsers });

      res.json({
        success: true,
        message: 'Profile updated successfully.',
        user: sanitizeUser(updatedUser),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Change Password
  app.post('/api/auth/change-password', (req, res) => {
    try {
      const auth = getAuthUser(req);
      if (!auth) {
        res.status(401).json({ success: false, error: 'Not authenticated.' });
        return;
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!verifyPassword(currentPassword, auth.user.passwordHash)) {
        res.status(400).json({ success: false, error: 'Current password is incorrect.' });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).json({ success: false, error: 'New passwords do not match.' });
        return;
      }

      const passCheck = validatePasswordStrength(newPassword);
      if (!passCheck.valid) {
        res.status(400).json({ success: false, error: passCheck.error });
        return;
      }

      const db = getDatabase();
      const updatedUser = {
        ...auth.user,
        passwordHash: hashPassword(newPassword),
        updatedAt: new Date().toISOString(),
      };

      const updatedUsers = db.allUsers.map((u: any) => (u.id === auth.user.id ? updatedUser : u));
      saveDatabase({ allUsers: updatedUsers });

      res.json({
        success: true,
        message: 'Password changed successfully.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Toggle Save Book
  app.post('/api/auth/toggle-save-book', (req, res) => {
    try {
      const auth = getAuthUser(req);
      if (!auth) {
        res.status(401).json({ success: false, error: 'Please log in to save this book.' });
        return;
      }

      const { bookId } = req.body;
      if (!bookId) {
        res.status(400).json({ success: false, error: 'bookId is required.' });
        return;
      }

      const db = getDatabase();
      const currentSaved: string[] = auth.user.savedBookIds || [];
      let nextSaved: string[];

      if (currentSaved.includes(bookId)) {
        nextSaved = currentSaved.filter((id) => id !== bookId);
      } else {
        nextSaved = [...currentSaved, bookId];
      }

      const updatedUser = {
        ...auth.user,
        savedBookIds: nextSaved,
        updatedAt: new Date().toISOString(),
      };

      const updatedUsers = db.allUsers.map((u: any) => (u.id === auth.user.id ? updatedUser : u));

      // Track analytics
      const analyticsEvents = [
        {
          id: `ev-${Date.now()}-book-saved`,
          type: 'book_saved',
          target: bookId,
          timestamp: new Date().toISOString(),
          device: 'web',
        },
        ...(db.analyticsEvents || []).slice(0, 499),
      ];

      saveDatabase({ allUsers: updatedUsers, analyticsEvents });

      res.json({
        success: true,
        savedBookIds: nextSaved,
        isSaved: nextSaved.includes(bookId),
        message: nextSaved.includes(bookId) ? 'Book saved to your account.' : 'Book removed from saved items.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Toggle Save Article
  app.post('/api/auth/toggle-save-article', (req, res) => {
    try {
      const auth = getAuthUser(req);
      if (!auth) {
        res.status(401).json({ success: false, error: 'Please log in to save this article.' });
        return;
      }

      const { blogId } = req.body;
      if (!blogId) {
        res.status(400).json({ success: false, error: 'blogId is required.' });
        return;
      }

      const db = getDatabase();
      const currentSaved: string[] = auth.user.savedArticleIds || [];
      let nextSaved: string[];

      if (currentSaved.includes(blogId)) {
        nextSaved = currentSaved.filter((id) => id !== blogId);
      } else {
        nextSaved = [...currentSaved, blogId];
      }

      const updatedUser = {
        ...auth.user,
        savedArticleIds: nextSaved,
        updatedAt: new Date().toISOString(),
      };

      const updatedUsers = db.allUsers.map((u: any) => (u.id === auth.user.id ? updatedUser : u));

      // Track analytics
      const analyticsEvents = [
        {
          id: `ev-${Date.now()}-article-saved`,
          type: 'article_saved',
          target: blogId,
          timestamp: new Date().toISOString(),
          device: 'web',
        },
        ...(db.analyticsEvents || []).slice(0, 499),
      ];

      saveDatabase({ allUsers: updatedUsers, analyticsEvents });

      res.json({
        success: true,
        savedArticleIds: nextSaved,
        isSaved: nextSaved.includes(blogId),
        message: nextSaved.includes(blogId) ? 'Article saved to your account.' : 'Article removed from saved items.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ADMIN: Get all customers
  app.get('/api/admin/users', (req, res) => {
    try {
      const auth = getAuthUser(req);
      const userRole = (auth?.user?.role || '') as string;
      if (!auth || (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN')) {
        res.status(403).json({ success: false, error: 'Access denied. Administrative privileges required.' });
        return;
      }

      const db = getDatabase();
      const users = (db.allUsers || []).map((u: any) => sanitizeUser(u));
      res.json({ success: true, users });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ADMIN: Update user status (Disable / Reactivate)
  app.put('/api/admin/users/:id/status', (req, res) => {
    try {
      const auth = getAuthUser(req);
      const userRole = (auth?.user?.role || '') as string;
      if (!auth || (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN')) {
        res.status(403).json({ success: false, error: 'Access denied. Administrative privileges required.' });
        return;
      }

      const { id } = req.params;
      const { status } = req.body;

      const db = getDatabase();
      const targetUser = db.allUsers.find((u: any) => u.id === id);
      if (!targetUser) {
        res.status(404).json({ success: false, error: 'User not found.' });
        return;
      }

      const updatedUser = {
        ...targetUser,
        status,
        updatedAt: new Date().toISOString(),
      };

      const updatedUsers = db.allUsers.map((u: any) => (u.id === id ? updatedUser : u));

      // Audit log
      const auditLogs = [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userName: auth.user.name,
          userRole: auth.user.role,
          action: 'User Status Updated',
          resource: targetUser.email,
          details: `Changed user status for ${targetUser.name} (${targetUser.email}) to ${status}`,
        },
        ...(db.auditLogs || []),
      ];

      saveDatabase({ allUsers: updatedUsers, auditLogs });

      res.json({
        success: true,
        message: `User status updated to ${status}.`,
        user: sanitizeUser(updatedUser),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Books endpoints
  app.get('/api/books', (req, res) => {
    const db = getDatabase();
    const authors = db.authors || [];
    const books = (db.books || []).map((b: any) => {
      const author = authors.find((a: any) => a.id === b.authorId || a.name === b.authorName);
      return {
        ...b,
        author: author ? {
          id: author.id,
          name: author.name,
          slug: author.slug,
          title: author.title,
          avatar: author.avatar,
          bio: author.bio,
        } : undefined
      };
    });
    res.json({ success: true, books });
  });

  app.get('/api/books/:id', (req, res) => {
    const { id } = req.params;
    const db = getDatabase();
    const authors = db.authors || [];
    const book = (db.books || []).find((b: any) => b.id === id || b.slug === id);
    if (!book) {
      res.status(404).json({ success: false, error: 'Book not found' });
      return;
    }
    const author = authors.find((a: any) => a.id === book.authorId || a.name === book.authorName);
    res.json({
      success: true,
      book: {
        ...book,
        author: author ? {
          id: author.id,
          name: author.name,
          slug: author.slug,
          title: author.title,
          avatar: author.avatar,
          bio: author.bio,
        } : undefined
      }
    });
  });

  app.post('/api/books', (req, res) => {
    try {
      const db = getDatabase();
      const newBook = {
        ...req.body,
        id: req.body.id || `book-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const books = [newBook, ...db.books];
      saveDatabase({ books });
      res.status(201).json({ success: true, book: newBook });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/books/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = getDatabase();
      const oldBook = db.books.find((b: any) => b.id === id);
      if (!oldBook) {
        res.status(404).json({ success: false, error: 'Book not found' });
        return;
      }
      
      const auditLogs = [...(db.auditLogs || [])];
      if (req.body.coverImage && oldBook.coverImage !== req.body.coverImage) {
        auditLogs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userName: req.body.updatedBy || 'Administrative Officer',
          userRole: 'ADMIN',
          action: 'Book Cover Changed',
          resource: oldBook.title,
          details: `Changed cover image for "${oldBook.title}" (ID: ${id}) to ${req.body.coverImage.slice(0, 60)}...`,
        });
      }

      const updatedBookData = {
        ...oldBook,
        ...req.body,
        updatedAt: new Date().toISOString(),
      };

      const books = db.books.map((b: any) =>
        b.id === id ? updatedBookData : b
      );

      saveDatabase({ books, auditLogs });

      // Auto-Sync to Google Merchant Center if enabled
      try {
        const merchantConfig = getMerchantConfig();
        if (
          merchantConfig.settings.autoSync &&
          updatedBookData.googleEnabled !== false &&
          !updatedBookData.googleExcluded
        ) {
          const priceChanged = oldBook.price !== updatedBookData.price;
          const stockChanged = oldBook.stockCount !== updatedBookData.stockCount || oldBook.inStock !== updatedBookData.inStock;
          const imageChanged = oldBook.coverImage !== updatedBookData.coverImage;
          const titleChanged = oldBook.title !== updatedBookData.title;

          if (priceChanged || stockChanged || imageChanged || titleChanged) {
            const hostUrl = `${req.protocol}://${req.get('host')}`;
            syncBookToGoogleMerchantAPI(id, hostUrl).catch((err) => {
              console.warn('[Google Merchant Auto-Sync Error]:', err.message);
            });
          }
        }
      } catch (autoSyncErr: any) {
        console.warn('[Google Merchant Auto-Sync Hook]:', autoSyncErr.message);
      }

      res.json({ success: true, book: updatedBookData });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/books/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = getDatabase();
      const books = db.books.filter((b: any) => b.id !== id);
      saveDatabase({ books });

      // Remove from Google Merchant Center asynchronously
      removeBookFromGoogleMerchantAPI(id).catch(() => {});

      res.json({ success: true, message: 'Book deleted permanently' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Authors endpoints
  app.get('/api/authors', (req, res) => {
    const db = getDatabase();
    res.json({ success: true, authors: db.authors || [] });
  });

  app.get('/api/authors/:id', (req, res) => {
    const { id } = req.params;
    const db = getDatabase();
    const author = (db.authors || []).find((a: any) => a.id === id || a.slug === id);
    if (!author) {
      res.status(404).json({ success: false, error: 'Author not found' });
      return;
    }
    const authorBooks = (db.books || []).filter(
      (b: any) => b.authorId === author.id || b.authorName?.toLowerCase().includes(author.name.toLowerCase())
    );
    res.json({ success: true, author: { ...author, books: authorBooks } });
  });

  app.post('/api/authors', (req, res) => {
    try {
      const db = getDatabase();
      const slug = req.body.slug || (req.body.name || 'author').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const newAuthor = {
        ...req.body,
        id: req.body.id || `author-${Date.now()}`,
        slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const authors = [...(db.authors || []), newAuthor];
      saveDatabase({ authors });
      res.status(201).json({ success: true, author: newAuthor });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/authors/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = getDatabase();
      const oldAuthor = (db.authors || []).find((a: any) => a.id === id);
      if (!oldAuthor) {
        res.status(404).json({ success: false, error: 'Author not found' });
        return;
      }
      const updatedAuthor = {
        ...oldAuthor,
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      const authors = (db.authors || []).map((a: any) => (a.id === id ? updatedAuthor : a));
      
      // Update books linked to this author if author name changed
      let books = db.books || [];
      if (req.body.name && req.body.name !== oldAuthor.name) {
        books = books.map((b: any) => b.authorId === id ? { ...b, authorName: req.body.name } : b);
      }

      saveDatabase({ authors, books });
      res.json({ success: true, author: updatedAuthor });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/authors/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = getDatabase();
      const authors = (db.authors || []).filter((a: any) => a.id !== id);
      saveDatabase({ authors });
      res.json({ success: true, message: 'Author deleted permanently' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Website Settings
  app.get('/api/settings', (req, res) => {
    const db = getDatabase();
    res.json({ success: true, settings: db.settings });
  });

  app.put('/api/settings', (req, res) => {
    try {
      const db = getDatabase();
      const oldSettings = db.settings || {};
      const newSettings = { ...oldSettings, ...req.body };
      
      const auditLogs = [...(db.auditLogs || [])];
      const newLogo = req.body.logoUrl || req.body.mainLogo;
      const oldLogo = (oldSettings as any).logoUrl || (oldSettings as any).mainLogo;
      if (newLogo && oldLogo !== newLogo) {
        auditLogs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userName: req.body.updatedBy || 'Administrative Officer',
          userRole: 'ADMIN',
          action: 'Brand Logo Updated',
          resource: 'Website Settings',
          details: `Updated primary website logo asset (Height: ${newSettings.logoHeight || 40}px, Padding: ${newSettings.logoPadding || 0}px)`,
        });
      }

      saveDatabase({ settings: newSettings, auditLogs });
      res.json({ success: true, settings: newSettings });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Reviews API
  app.get('/api/reviews', (req, res) => {
    const db = getDatabase();
    res.json({ success: true, reviews: db.reviews });
  });

  app.post('/api/reviews', (req, res) => {
    try {
      const db = getDatabase();
      const newReview = {
        id: `rev-${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        approved: false, // requires moderation by default
        status: 'Pending',
        ...req.body,
      };
      const reviews = [newReview, ...db.reviews];
      saveDatabase({ reviews });
      res.status(201).json({ success: true, review: newReview });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/reviews/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = getDatabase();
      const reviews = db.reviews.map((r: any) => (r.id === id ? { ...r, ...req.body } : r));
      saveDatabase({ reviews });
      res.json({ success: true, review: reviews.find((r: any) => r.id === id) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/reviews/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = getDatabase();
      const reviews = db.reviews.filter((r: any) => r.id !== id);
      saveDatabase({ reviews });
      res.json({ success: true, message: 'Review deleted' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Orders API
  app.get('/api/orders', (req, res) => {
    const db = getDatabase();
    res.json({ success: true, orders: db.orders });
  });

  app.post('/api/orders', (req, res) => {
    try {
      const db = getDatabase();
      const newOrder = {
        ...req.body,
        id: req.body.id || `ord-${Date.now()}`,
        date: new Date().toISOString(),
      };
      const orders = [newOrder, ...db.orders];

      // Auto inventory deduction if trackInventory enabled
      let books = db.books;
      if (req.body.items && Array.isArray(req.body.items)) {
        books = books.map((b: any) => {
          const orderedItem = req.body.items.find((i: any) => i.bookId === b.id);
          if (orderedItem && b.trackInventory) {
            const newCount = Math.max(0, (b.stockCount || 0) - (orderedItem.quantity || 1));
            return {
              ...b,
              stockCount: newCount,
              inStock: newCount > 0,
              stockStatus: newCount === 0 ? 'Out of Stock' : newCount < 10 ? 'Low Stock' : 'In Stock',
            };
          }
          return b;
        });
      }

      saveDatabase({ orders, books });
      res.status(201).json({ success: true, order: newOrder });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/orders/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = getDatabase();
      const orders = db.orders.map((o: any) => (o.id === id ? { ...o, ...req.body } : o));
      saveDatabase({ orders });
      res.json({ success: true, order: orders.find((o: any) => o.id === id) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Leads & Bulk Enquiries
  app.get('/api/leads', (req, res) => {
    const db = getDatabase();
    res.json({ success: true, leads: db.leads });
  });

  app.post('/api/leads', (req, res) => {
    try {
      const db = getDatabase();
      const newLead = {
        id: `lead-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        status: 'New',
        ...req.body,
      };
      const leads = [newLead, ...db.leads];
      saveDatabase({ leads });
      res.status(201).json({ success: true, lead: newLead });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/leads/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = getDatabase();
      const leads = db.leads.map((l: any) => (l.id === id ? { ...l, ...req.body } : l));
      saveDatabase({ leads });
      res.json({ success: true, lead: leads.find((l: any) => l.id === id) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Authors API
  app.get('/api/authors', (req, res) => {
    const db = getDatabase();
    res.json({ success: true, authors: db.authors });
  });

  app.post('/api/authors', (req, res) => {
    try {
      const db = getDatabase();
      const newAuthor = {
        ...req.body,
        id: req.body.id || `author-${Date.now()}`,
      };
      const authors = [newAuthor, ...db.authors];
      saveDatabase({ authors });
      res.status(201).json({ success: true, author: newAuthor });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/authors/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = getDatabase();
      const oldAuthor = db.authors.find((a: any) => a.id === id);
      const authors = db.authors.map((a: any) =>
        a.id === id ? { ...a, ...req.body } : a
      );
      
      const auditLogs = [...(db.auditLogs || [])];
      if (oldAuthor && req.body.avatar && oldAuthor.avatar !== req.body.avatar) {
        auditLogs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userName: req.body.updatedBy || 'Administrative Officer',
          userRole: 'ADMIN',
          action: 'Author Photo Changed',
          resource: oldAuthor.name,
          details: `Changed author portrait from ${oldAuthor.avatar.slice(0, 40)}... to ${req.body.avatar.slice(0, 40)}...`,
        });
      }

      saveDatabase({ authors, auditLogs });
      const updatedAuthor = authors.find((a: any) => a.id === id);
      res.json({ success: true, author: updatedAuthor });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/authors/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = getDatabase();
      const authors = db.authors.filter((a: any) => a.id !== id);
      saveDatabase({ authors });
      res.json({ success: true, message: 'Author deleted' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Blogs API
  app.get('/api/blogs', (req, res) => {
    const db = getDatabase();
    res.json({ success: true, blogs: db.blogs });
  });

  app.post('/api/blogs', (req, res) => {
    try {
      const db = getDatabase();
      const newBlog = {
        ...req.body,
        id: req.body.id || `blog-${Date.now()}`,
        publishedAt: new Date().toISOString(),
      };
      const blogs = [newBlog, ...db.blogs];
      saveDatabase({ blogs });
      res.status(201).json({ success: true, blog: newBlog });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/blogs/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = getDatabase();
      const blogs = db.blogs.map((b: any) =>
        b.id === id ? { ...b, ...req.body, updatedAt: new Date().toISOString() } : b
      );
      saveDatabase({ blogs });
      res.json({ success: true, blog: blogs.find((b: any) => b.id === id) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/blogs/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = getDatabase();
      const blogs = db.blogs.filter((b: any) => b.id !== id);
      saveDatabase({ blogs });
      res.json({ success: true, message: 'Blog deleted' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Categories API
  app.get('/api/categories', (req, res) => {
    const db = getDatabase();
    res.json({ success: true, categories: db.categories });
  });

  app.put('/api/categories', (req, res) => {
    try {
      const { categories } = req.body;
      if (Array.isArray(categories)) {
        saveDatabase({ categories });
        res.json({ success: true, categories });
      } else {
        res.status(400).json({ error: 'categories must be an array' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Media Library Catalog API
  app.get('/api/media', (req, res) => {
    const db = getDatabase();
    res.json({ success: true, mediaItems: db.mediaItems || [] });
  });

  app.post('/api/media', (req, res) => {
    try {
      const db = getDatabase();
      const mediaItem = {
        id: req.body.id || `med-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...req.body,
      };
      const mediaItems = [mediaItem, ...(db.mediaItems || []).filter((m: any) => m.id !== mediaItem.id)];
      saveDatabase({ mediaItems });
      res.status(201).json({ success: true, media: mediaItem });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Authors, Blogs, Coupons, Users, Audit
  app.post('/api/analytics', (req, res) => {
    try {
      const db = getDatabase();
      const newEvent = {
        id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        ...req.body,
      };
      const analyticsEvents = [newEvent, ...(db.analyticsEvents || []).slice(0, 499)];
      saveDatabase({ analyticsEvents });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Storage / R2 Connection Status (Masked & Safe)
  app.get('/api/media/status', (req, res) => {
    try {
      const status = getSafeMaskedStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Test Cloudflare R2 Connection Live
  app.post('/api/media/test-connection', async (req, res) => {
    try {
      const result = await testR2Connection();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to execute Cloudflare R2 test',
      });
    }
  });

  // Upload Media Asset to Cloudflare R2
  app.post('/api/media/upload', async (req, res) => {
    try {
      const {
        dataUrl,
        buffer: rawBuffer,
        originalFilename,
        folder = 'books',
        mimeType,
        altText,
        caption,
        uploadedBy = 'admin',
      } = req.body;

      if (!dataUrl && !rawBuffer) {
        res.status(400).json({ error: 'Missing image data payload (dataUrl or buffer required).' });
        return;
      }

      let fileBuffer: Buffer;
      let detectedMime = mimeType || 'image/jpeg';

      if (dataUrl && typeof dataUrl === 'string') {
        const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          detectedMime = matches[1];
          fileBuffer = Buffer.from(matches[2], 'base64');
        } else {
          // If raw base64 without prefix
          fileBuffer = Buffer.from(dataUrl, 'base64');
        }
      } else if (rawBuffer) {
        fileBuffer = Buffer.from(rawBuffer);
      } else {
        res.status(400).json({ error: 'Invalid payload format.' });
        return;
      }

      const safeFilename = originalFilename || `asset-${Date.now()}`;

      // Upload to Cloudflare R2
      const mediaItem = await uploadBufferToR2({
        buffer: fileBuffer,
        mimeType: detectedMime,
        originalFilename: safeFilename,
        folder,
        altText,
        caption,
        uploadedBy,
      });

      // Persist directly to database catalog
      const db = getDatabase();
      const existingMedia = db.mediaItems || [];

      const auditLogs = [...(db.auditLogs || [])];
      auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userName: uploadedBy || 'Administrative Officer',
        userRole: 'ADMIN',
        action: 'Media Uploaded',
        resource: safeFilename,
        details: `Uploaded asset to R2 [Key: ${mediaItem.objectKey}, Size: ${mediaItem.size}] in folder "${folder}"`,
      });

      const mediaRecord = {
        ...mediaItem,
        date: new Date().toISOString().split('T')[0],
      };

      const updatedMedia = [
        mediaRecord,
        ...existingMedia.filter((m: any) => m.id !== mediaItem.id && m.objectKey !== mediaItem.objectKey),
      ];

      saveDatabase({ mediaItems: updatedMedia as any, auditLogs });

      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully to Cloudflare R2 and saved to database.',
        media: mediaRecord,
      });
    } catch (err: any) {
      console.error('Upload to Cloudflare R2 failed:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to upload asset to Cloudflare R2.',
      });
    }
  });

  // Delete Media Object from Cloudflare R2
  app.post('/api/media/delete', async (req, res) => {
    try {
      const { objectKey } = req.body;
      if (!objectKey) {
        res.status(400).json({ error: 'objectKey is required for deletion.' });
        return;
      }

      const result = await deleteObjectFromR2(objectKey);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete object from R2.' });
    }
  });

  // Generate Presigned Upload URL for Direct Client-to-R2 Upload
  app.post('/api/media/presign', async (req, res) => {
    try {
      const { folder = 'books', originalFilename, mimeType } = req.body;
      if (!originalFilename || !mimeType) {
        res.status(400).json({ error: 'originalFilename and mimeType are required.' });
        return;
      }

      const presigned = await createPresignedUploadUrl({
        folder,
        originalFilename,
        mimeType,
      });

      res.json({
        success: true,
        ...presigned,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============================================================
  // GOOGLE MERCHANT CENTER & SHOPPING API ROUTES
  // ============================================================

  // Get Google Merchant connection status and dashboard metrics
  app.get('/api/admin/google-merchant/status', (req, res) => {
    try {
      const metrics = getGoogleShoppingDashboardMetrics();
      const config = getMerchantConfig();
      res.json({
        success: true,
        metrics,
        credentials: {
          hasAccountId: Boolean(config.merchantAccountId),
          hasDataSourceName: Boolean(config.dataSourceName),
          authMethod: config.authMethod,
          isAuthConfigured: config.isAuthConfigured,
          maskedClientId: maskSecret(config.clientId),
          maskedRefreshToken: maskSecret(config.refreshToken),
          maskedAccountId: config.merchantAccountId,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Test live connection to Google Merchant API / Data Source
  app.post('/api/admin/google-merchant/test-connection', async (req, res) => {
    try {
      const result = await testMerchantConnection();
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Sync / update a single book to Google Merchant Center
  app.post('/api/admin/google-merchant/sync-book/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const hostUrl = `${req.protocol}://${req.get('host')}`;
      const result = await syncBookToGoogleMerchantAPI(id, hostUrl);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Remove / delete a single book from Google Merchant Center
  app.post('/api/admin/google-merchant/remove-book/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await removeBookFromGoogleMerchantAPI(id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Bulk sync books to Google Merchant Center
  app.post('/api/admin/google-merchant/bulk-sync', async (req, res) => {
    try {
      const { bookIds } = req.body;
      const hostUrl = `${req.protocol}://${req.get('host')}`;
      const result = await bulkSyncBooksToGoogleMerchantAPI(bookIds, hostUrl);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get Google Merchant Sync Logs
  app.get('/api/admin/google-merchant/logs', (req, res) => {
    try {
      const db = getDatabase();
      const logs = db.googleSyncLogs || [];
      res.json({ success: true, logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Run comprehensive Catalog Diagnostics for Google Shopping
  app.get('/api/admin/google-merchant/diagnostics', (req, res) => {
    try {
      const db = getDatabase();
      const config = getMerchantConfig();
      const books = db.books || [];

      const report = books.map((b) => {
        const val = validateBookForGoogleMerchant(b, config.settings);
        return {
          bookId: b.id,
          title: b.title,
          sku: b.sku,
          isbn: b.isbn,
          price: b.price,
          inStock: b.inStock,
          stockCount: b.stockCount,
          status: b.status || 'published',
          googleSyncStatus: b.googleSyncStatus || 'Not Submitted',
          googleExcluded: b.googleExcluded || false,
          isEligible: val.isEligible,
          issues: val.issues,
          lastSyncedAt: b.googleLastSyncedAt,
        };
      });

      res.json({
        success: true,
        total: books.length,
        eligible: report.filter((r) => r.isEligible).length,
        excluded: report.filter((r) => r.googleExcluded).length,
        report,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Save Google Shopping & Shipping Settings
  app.post('/api/admin/google-merchant/settings', (req, res) => {
    try {
      const db = getDatabase();
      const { googleShopping, shippingSettings, returnPolicy } = req.body;

      const currentSettings = db.settings;
      const updatedSettings = {
        ...currentSettings,
        ...(googleShopping ? { googleShopping: { ...currentSettings.googleShopping, ...googleShopping } } : {}),
        ...(shippingSettings ? { shippingSettings: { ...currentSettings.shippingSettings, ...shippingSettings } } : {}),
        ...(returnPolicy ? { returnPolicy: { ...currentSettings.returnPolicy, ...returnPolicy } } : {}),
      };

      saveDatabase({ settings: updatedSettings });
      res.json({ success: true, settings: updatedSettings });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ============================================================
  // VITE DEV MIDDLEWARE & PRODUCTION STATIC FALLBACK
  // ============================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sahayak Associates Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
