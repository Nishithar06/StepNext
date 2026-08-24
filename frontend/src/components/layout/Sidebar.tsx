import React from 'react';
import { Home, Compass, Activity, User, X, Brain, Sparkles, ChevronRight } from 'lucide-react';
import { UserProfile, HealthResponse } from '../../types/schema';
import { StepNextLogo } from '../common/StepNextLogo';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';

export type TabType = 'overview' | 'digital_twin' | 'current_state' | 'simulator' | 'profile';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onNavigateSection?: (tab: TabType, sectionId?: string) => void;
  profile: UserProfile | null;
  health: HealthResponse | null;
  onOpenOnboarding: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onNavigateSection,
  profile,
  health,
  onOpenOnboarding,
  isOpenMobile,
  onCloseMobile
}) => {
  const workspaceItems: { id: TabType; label: string; sublabel: string; icon: React.ReactNode; accent: string }[] = [
    { id: 'overview', label: 'Dashboard', sublabel: 'Trajectory & Telemetry', icon: <Home className="w-4 h-4" />, accent: 'text-[#5850EC]' },
    { id: 'digital_twin', label: 'Digital Twin', sublabel: 'Cognitive Model', icon: <Brain className="w-4 h-4" />, accent: 'text-purple-600' },
    { id: 'current_state', label: 'Current State', sublabel: 'Overload Risk Matrix', icon: <Activity className="w-4 h-4" />, accent: 'text-[#F43F5E]' },
    { id: 'simulator', label: 'Future Simulator', sublabel: 'Scenario Evaluation', icon: <Compass className="w-4 h-4" />, accent: 'text-[#10B981]' }
  ];

  const simulatorSubSections = [
    { label: 'Scenarios', sectionId: 'section-simulator', hint: 'Inputs' },
    { label: '90-Day Roadmap', sectionId: 'section-roadmap', hint: 'Milestones' },
    { label: 'Check-in Sync', sectionId: 'section-checkin', hint: 'Daily' },
    { label: 'Progress Intelligence', sectionId: 'section-progress', hint: 'Velocity' },
    { label: 'Adaptive Future', sectionId: 'section-adaptive-future', hint: 'Confidence' }
  ];

  const accountItems: { id: TabType; label: string; sublabel: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile & Goals', sublabel: 'Baseline Configuration', icon: <User className="w-4 h-4 text-slate-500" /> }
  ];

  const handleNavClick = (tabId: TabType, sectionId?: string) => {
    if (onNavigateSection) {
      onNavigateSection(tabId, sectionId);
    } else {
      onTabChange(tabId);
    }
    onCloseMobile();
  };

  const isGeminiLive = health?.gemini_connected && health?.api_key_configured;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-xl border-r border-black/[0.06] w-64 py-5 px-4 text-[#0F172A] shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-5 border-b border-black/[0.06] mb-5">
        <StepNextLogo height="h-[48px]" />

        <button onClick={onCloseMobile} className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav Links */}
      <div className="space-y-6 flex-1 overflow-y-auto pr-1">
        {/* WORKSPACE SECTION */}
        <div className="space-y-1">
          <p className="text-[9px] font-mono font-bold uppercase text-slate-400 tracking-[0.18em] px-3 mb-2 flex items-center justify-between">
            <span>WORKSPACE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          </p>
          {workspaceItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => handleNavClick(item.id, item.id === 'simulator' ? 'section-simulator' : undefined)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-[#EEF2FF] text-[#5850EC] font-bold shadow-[0_2px_12px_rgba(99,102,241,0.12)] border border-[#5850EC]/20'
                      : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`shrink-0 ${isActive ? 'text-[#5850EC]' : item.accent}`}>{item.icon}</span>
                    <div className="text-left">
                      <span className="block font-semibold">{item.label}</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive ? 'text-[#5850EC] translate-x-0.5' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} />
                </button>

                {/* Sub-sections for Future Simulator */}
                {item.id === 'simulator' && (
                  <div className="ml-5 pl-2.5 border-l border-[#10B981]/40 my-1 space-y-0.5 animate-in fade-in duration-200">
                    {simulatorSubSections.map((sub) => (
                      <button
                        key={sub.sectionId}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavClick('simulator', sub.sectionId);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-slate-500 hover:text-[#5850EC] hover:bg-[#EEF2FF]/60 transition-all text-left"
                      >
                        <span className="font-semibold">{sub.label}</span>
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-md">{sub.hint}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ACCOUNT SECTION */}
        <div className="space-y-1">
          <p className="text-[9px] font-mono font-bold uppercase text-slate-400 tracking-[0.18em] px-3 mb-2">
            PREFERENCES
          </p>
          {accountItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-[#EEF2FF] text-[#5850EC] font-bold shadow-[0_2px_12px_rgba(99,102,241,0.12)] border border-[#5850EC]/20'
                    : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="shrink-0">{item.icon}</span>
                  <span className="font-semibold">{item.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Settings</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Footer Profile Card */}
      <div className="pt-4 border-t border-black/[0.06] space-y-3">
        <div
          onClick={() => {
            onTabChange('profile');
            onCloseMobile();
          }}
          className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50/80 border border-black/[0.05] hover:border-black/[0.12] hover:bg-slate-100/80 cursor-pointer transition-all duration-200 shadow-sm"
        >
          <Avatar
            fallback={profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            size="sm"
            status="online"
          />
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-[#0F172A] truncate">
              {profile?.name || 'User Profile'}
            </p>
            <p className="text-[10px] text-slate-500 truncate font-mono">
              {profile?.career_goal || profile?.education || 'General Pathway'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block shrink-0 h-screen sticky top-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onCloseMobile} />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
