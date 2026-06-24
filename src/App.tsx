import { AdminProvider, useAdmin } from './lib/adminAuth';
import { useHashRoute, navigate } from './lib/router';
import { HomePage } from './pages/HomePage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import {
  MusicVideosPage,
  AudioLibraryPage,
  SelfRecordedPage,
  PublicMediaPage,
  CreationsPage,
} from './pages/MediaPages';
import { GalleryPage } from './pages/GalleryPage';
import { EventsPage } from './pages/EventsPage';
import { QuotesPage } from './pages/QuotesPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';
import { LoomChapterPage } from './pages/LoomChapterPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';

function AppContent() {
  const { session } = useAdmin();
  const route = useHashRoute();
  const path = route.path;

  // --- Admin routes ---
  if (path === '/admin') {
    if (session) {
      navigate('/admin/dashboard');
      return null;
    }
    return <AdminLoginPage />;
  }
  if (path === '/admin/dashboard') {
    if (!session) {
      navigate('/admin');
      return null;
    }
    return <AdminDashboard />;
  }

  // --- Public routes ---
  if (path === '/' || path === '') return <HomePage />;
  if (path === '/blog') return <BlogPage />;
  if (path.startsWith('/blog/')) return <BlogPostPage id={path.replace('/blog/', '')} />;
  if (path === '/music-videos') return <MusicVideosPage />;
  if (path === '/audio-library') return <AudioLibraryPage />;
  if (path === '/self-recorded') return <SelfRecordedPage />;
  if (path === '/public-media') return <PublicMediaPage />;
  if (path === '/creations') return <CreationsPage />;
  if (path === '/gallery') return <GalleryPage />;
  if (path === '/events') return <EventsPage />;
  if (path === '/quotes') return <QuotesPage />;
  if (path === '/contact') return <ContactPage />;
  if (path.startsWith('/loom/')) return <LoomChapterPage id={path.replace('/loom/', '')} />;
  if (path === '/legal/privacy') return <LegalPage kind="privacy" />;
  if (path === '/legal/terms') return <LegalPage kind="terms" />;
  if (path === '/legal/cookies') return <LegalPage kind="cookies" />;
  if (path === '/legal/disclaimer') return <LegalPage kind="disclaimer" />;

  return <NotFoundPage />;
}

export default function App() {
  return (
    <AdminProvider>
      <AppContent />
    </AdminProvider>
  );
}
