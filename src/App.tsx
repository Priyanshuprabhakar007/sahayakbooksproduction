import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { SampleReaderModal } from './components/SampleReaderModal';
import { AuthModal } from './components/AuthModal';

// Views
import { HomeView } from './views/HomeView';
import { BooksCatalogView } from './views/BooksCatalogView';
import { BookDetailView } from './views/BookDetailView';
import { CheckoutView } from './views/CheckoutView';
import { OrderSuccessView } from './views/OrderSuccessView';
import { OrderTrackingView } from './views/OrderTrackingView';
import { UserDashboardView } from './views/UserDashboardView';
import { CustomerAccountView } from './views/CustomerAccountView';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { ForgotPasswordView } from './views/ForgotPasswordView';
import { ResetPasswordView } from './views/ResetPasswordView';
import { VerifyEmailView } from './views/VerifyEmailView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminSetPasswordView } from './views/AdminSetPasswordView';
import { AuthorsView, AuthorDetailView } from './views/AuthorsView';
import { BlogsView, BlogDetailView } from './views/BlogsView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';
import { CategoriesView, CategoryDetailView } from './views/CategoriesView';
import {
  PrivacyPolicyView,
  TermsConditionsView,
  ShippingPolicyView,
  ReturnRefundPolicyView,
} from './views/PolicyViews';
import { SitemapView } from './views/SitemapView';

const MainRouter: React.FC = () => {
  const { currentPath, settings } = useStore();

  // Scroll to top on route change & update document title
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let titleSuffix = 'Sahayak Books | Knowledge That Moves You Forward';
    if (currentPath === '/') {
      document.title = `${settings.brandName} - Powered by ${settings.parentCompany}`;
    } else if (currentPath.startsWith('/books/')) {
      document.title = `Book Dossier | ${settings.brandName}`;
    } else if (currentPath === '/books') {
      document.title = `Scholarly Publications Catalog | ${settings.brandName}`;
    } else if (currentPath === '/checkout') {
      document.title = `Secure Checkout | ${settings.brandName}`;
    } else if (currentPath.startsWith('/order-success')) {
      document.title = `Order Confirmed | ${settings.brandName}`;
    } else if (currentPath.startsWith('/track-order')) {
      document.title = `Track Consignment | ${settings.brandName}`;
    } else if (currentPath === '/dashboard') {
      document.title = `Reader Dashboard | ${settings.brandName}`;
    } else if (currentPath.startsWith('/admin')) {
      document.title = `Admin Master Control | ${settings.brandName}`;
    } else if (currentPath === '/authors') {
      document.title = `Authors & Jurists Faculty | ${settings.brandName}`;
    } else if (currentPath === '/blogs') {
      document.title = `Insights & Articles | ${settings.brandName}`;
    } else if (currentPath === '/about') {
      document.title = `About Sahayak Associates | ${settings.brandName}`;
    } else if (currentPath === '/contact') {
      document.title = `Contact Advisory Desk | ${settings.brandName}`;
    } else {
      document.title = `${settings.brandName} - ${settings.tagline}`;
    }
  }, [currentPath, settings]);

  // Route Dispatcher
  const renderRoute = () => {
    let cleanPath = (currentPath || '').split('?')[0].trim();
    if (cleanPath.startsWith('#')) cleanPath = cleanPath.substring(1).trim();
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    if (cleanPath.length > 1 && cleanPath.endsWith('/')) cleanPath = cleanPath.replace(/\/+$/, '');

    // 1. Home - Primary Landing Default
    if (
      cleanPath === '/' ||
      cleanPath === '' ||
      cleanPath === '/home' ||
      cleanPath === 'home' ||
      cleanPath === '/#' ||
      cleanPath === '#' ||
      cleanPath === '/#/'
    ) {
      return <HomeView />;
    }

    // 2. Books Catalog
    if (cleanPath === '/books') {
      return <BooksCatalogView />;
    }

    // 3. Book Detail: /books/:slug
    if (cleanPath.startsWith('/books/')) {
      const slug = cleanPath.replace('/books/', '');
      return <BookDetailView slug={slug} />;
    }

    // 4. Checkout
    if (cleanPath === '/checkout') {
      return <CheckoutView />;
    }

    // 5. Order Success: /order-success/:orderId
    if (cleanPath.startsWith('/order-success')) {
      const parts = cleanPath.split('/');
      const orderId = parts[2] || '';
      return <OrderSuccessView orderId={orderId} />;
    }

    // 6. Order Tracking: /track-order
    if (cleanPath.startsWith('/track-order')) {
      return <OrderTrackingView />;
    }

    // Customer Authentication Routes
    if (cleanPath.startsWith('/login')) {
      return <LoginView />;
    }
    if (cleanPath.startsWith('/register')) {
      return <RegisterView />;
    }
    if (cleanPath.startsWith('/forgot-password')) {
      return <ForgotPasswordView />;
    }
    if (cleanPath.startsWith('/reset-password')) {
      return <ResetPasswordView />;
    }
    if (cleanPath.startsWith('/verify-email')) {
      return <VerifyEmailView />;
    }
    if (cleanPath === '/account' || cleanPath.startsWith('/account/')) {
      return <CustomerAccountView />;
    }

    // 7. Customer Dashboard & Wishlist
    if (cleanPath === '/wishlist') {
      return <CustomerAccountView />;
    }
    if (cleanPath === '/dashboard' || cleanPath.startsWith('/dashboard')) {
      return <CustomerAccountView />;
    }

    // 8. Admin Control Center
    if (cleanPath === '/admin/set-password') {
      return <AdminSetPasswordView />;
    }
    if (cleanPath.startsWith('/admin')) {
      return <AdminDashboardView />;
    }

    // 9. Authors Roster & Detail
    if (cleanPath === '/authors' || cleanPath === '/author') {
      return <AuthorsView />;
    }
    if (cleanPath.startsWith('/authors/')) {
      const slug = cleanPath.replace('/authors/', '');
      return <AuthorDetailView slug={slug} />;
    }
    if (cleanPath.startsWith('/author/')) {
      const slug = cleanPath.replace('/author/', '');
      return <AuthorDetailView slug={slug} />;
    }

    // 10. Blogs & Articles
    if (cleanPath === '/blogs') {
      return <BlogsView />;
    }
    if (cleanPath.startsWith('/blogs/')) {
      const slug = cleanPath.replace('/blogs/', '');
      return <BlogDetailView slug={slug} />;
    }

    // 11. Categories & Disciplines
    if (cleanPath === '/categories') {
      return <CategoriesView />;
    }
    if (cleanPath.startsWith('/categories/')) {
      const slug = cleanPath.replace('/categories/', '');
      return <CategoryDetailView slug={slug} />;
    }

    // 12. Institutional & Information Pages
    if (cleanPath === '/about') {
      return <AboutView />;
    }
    if (cleanPath === '/contact') {
      return <ContactView />;
    }
    if (cleanPath === '/privacy-policy') {
      return <PrivacyPolicyView />;
    }
    if (cleanPath === '/terms-conditions') {
      return <TermsConditionsView />;
    }
    if (cleanPath === '/shipping-policy') {
      return <ShippingPolicyView />;
    }
    if (cleanPath === '/returns-policy') {
      return <ReturnRefundPolicyView />;
    }
    if (cleanPath === '/sitemap') {
      return <SitemapView />;
    }

    // Fallback default
    return <HomeView />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#0B192C] font-sans antialiased selection:bg-[#C5A059] selection:text-[#0B192C]">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Dynamic Viewport */}
      <main className="flex-1">{renderRoute()}</main>

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <WishlistDrawer />
      <QuickViewModal />
      <SampleReaderModal />
      <AuthModal />
      <WhatsAppButton />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainRouter />
    </StoreProvider>
  );
}
