import { useState } from 'react';
import { AdminShell, type AdminTab } from './AdminShell';
import { Overview } from './Overview';
import { BlogManager } from './BlogManager';
import { MediaManager } from './MediaManager';
import { QuotesManager } from './QuotesManager';
import { EventsManager } from './EventsManager';
import { GalleryManager } from './GalleryManager';
import { SelfSectionManager } from './SelfSectionManager';
import { SettingsManager } from './SettingsManager';
import { AIStudio } from './AIStudio';
import { UploadsManager } from './UploadsManager';
import { AiPipelineViewer } from './AiPipelineViewer';
import { AgentStudio } from './AgentStudio';
import { ContentCalendarPage, TeamActivityLog } from './TeamPages';
import { NewsletterManager } from './NewsletterManager';
import { LoomManager, CapsuleManager, DropManager } from './FeatureManagers';
import { ToastViewport } from './ui';

export function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>('overview');

  return (
    <>
      <AdminShell activeTab={tab} onTab={setTab}>
        {tab === 'overview' && <Overview onTab={setTab} />}
        {tab === 'blog' && <BlogManager />}
        {tab === 'media' && <MediaManager category="music_videos" title="Music Videos" subtitle="Official music videos — embedded links or uploaded files." />}
        {tab === 'audio' && <MediaManager category="audio_library" title="Audio Library" subtitle="Tracks, soundscapes, and spoken word." />}
        {tab === 'self-recorded' && <MediaManager category="self_recorded" title="Self-Recorded Videos" subtitle="Personal, raw, and direct — recorded by Love Parekh." />}
        {tab === 'public-media' && <MediaManager category="public_media" title="Public Media" subtitle="Interviews, features, and public appearances." />}
        {tab === 'quotes' && <QuotesManager />}
        {tab === 'events' && <EventsManager />}
        {tab === 'gallery' && <GalleryManager />}
        {tab === 'creations' && <MediaManager category="creations" title="Creations" subtitle="Original creative works — embedded or uploaded." />}
        {tab === 'self-section' && <SelfSectionManager />}
        {tab === 'settings' && <SettingsManager />}
        {tab === 'ai-studio' && <AIStudio />}
        {tab === 'uploads' && <UploadsManager />}
        {tab === 'pipeline' && <AiPipelineViewer />}
        {tab === 'agents' && <AgentStudio />}
        {tab === 'calendar' && <ContentCalendarPage />}
        {tab === 'activity' && <TeamActivityLog />}
        {tab === 'newsletter' && <NewsletterManager />}
        {tab === 'loom' && <LoomManager />}
        {tab === 'capsules' && <CapsuleManager />}
        {tab === 'drops' && <DropManager />}
      </AdminShell>
      <ToastViewport />
    </>
  );
}
