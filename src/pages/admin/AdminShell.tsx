import { type ReactNode } from 'react';
import { useAdmin } from '../../lib/adminAuth';
import { navigate } from '../../lib/router';
import { Logo } from '../../components/Logo';
import {
  LayoutDashboard,
  FileText,
  Film,
  Music,
  Video,
  Camera,
  Sparkles,
  Calendar,
  Image as ImageIcon,
  Quote as QuoteIcon,
  Upload,
  Brain,
  StickyNote,
  LogOut,
  Settings,
  ExternalLink,
  Users,
  Activity,
  Send,
  Clock,
  ScrollText,
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'blog'
  | 'media'
  | 'quotes'
  | 'events'
  | 'gallery'
  | 'creations'
  | 'uploads'
  | 'ai-studio'
  | 'pipeline'
  | 'agents'
  | 'calendar'
  | 'activity'
  | 'newsletter'
  | 'loom'
  | 'capsules'
  | 'drops'
  | 'self-section'
  | 'settings';

const NAV: { section: string; items: { tab: AdminTab; label: string; icon: typeof FileText }[] }[] = [
  {
    section: 'Atelier',
    items: [
      { tab: 'overview', label: 'Overview', icon: LayoutDashboard },
      { tab: 'ai-studio', label: 'AI Generation Studio', icon: Brain },
      { tab: 'pipeline', label: 'AI Pipeline', icon: Activity },
      { tab: 'agents', label: 'Agent Studio', icon: Users },
      { tab: 'uploads', label: 'Media Upload', icon: Upload },
    ],
  },
  {
    section: 'Content',
    items: [
      { tab: 'blog', label: 'Blog Posts', icon: FileText },
      { tab: 'media', label: 'Music Videos', icon: Film },
      { tab: 'creations', label: 'Creations', icon: Sparkles },
      { tab: 'quotes', label: 'Quotes', icon: QuoteIcon },
      { tab: 'events', label: 'Events', icon: Calendar },
      { tab: 'gallery', label: 'Gallery', icon: ImageIcon },
    ],
  },
  {
    section: 'Features',
    items: [
      { tab: 'loom', label: 'The Loom', icon: ScrollText },
      { tab: 'capsules', label: 'Time Capsules', icon: Clock },
      { tab: 'drops', label: 'Scheduled Drops', icon: Calendar },
      { tab: 'newsletter', label: 'Newsletter', icon: Send },
      { tab: 'calendar', label: 'Content Calendar', icon: Calendar },
      { tab: 'activity', label: 'Team Activity', icon: Activity },
    ],
  },
  {
    section: 'Private',
    items: [
      { tab: 'self-section', label: 'Self-Section', icon: StickyNote },
      { tab: 'settings', label: 'Site Settings', icon: Settings },
    ],
  },
];

const ICONS_BY_TAB = {
  music_videos: Music,
  self_recorded: Video,
  public_media: Camera,
} as const;

export function AdminShell({
  activeTab,
  onTab,
  children,
}: {
  activeTab: AdminTab;
  onTab: (tab: AdminTab) => void;
  children: ReactNode;
}) {
  const { logout } = useAdmin();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
        <div className="p-6 border-b border-white/[0.06]">
          <Logo size="sm" onClick={() => onTab('overview')} />
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {NAV.map((group) => (
            <div key={group.section}>
              <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.28em] text-slate-500">{group.section}</p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => onTab(item.tab)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                      activeTab === item.tab
                        ? 'bg-gradient-to-r from-aura-500/20 to-transparent text-white border border-aura-400/30 shadow-aura-soft'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    <item.icon size={16} className={activeTab === item.tab ? 'text-neon-pink' : ''} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-white/[0.06] space-y-1">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/[0.03] transition"
          >
            <ExternalLink size={16} /> View public site
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/admin');
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/10 transition"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-5 h-16 bg-ink-950/90 backdrop-blur-xl border-b border-white/[0.06]">
          <Logo size="sm" showText={false} onClick={() => onTab('overview')} />
          <select
            value={activeTab}
            onChange={(e) => onTab(e.target.value as AdminTab)}
            className="bg-ink-850 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 max-w-[60%]"
          >
            {NAV.flatMap((g) => g.items).map((item) => (
              <option key={item.tab} value={item.tab}>{item.label}</option>
            ))}
          </select>
        </header>

        <main className="flex-1 min-w-0 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}

export { NAV, ICONS_BY_TAB };
