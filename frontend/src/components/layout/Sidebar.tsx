import React from 'react';
import { Home, Compass, Activity, Sparkles, User, X, Brain } from 'lucide-react';
import { UserProfile, HealthResponse } from '../../types/schema';

import { StepNextLogo } from '../common/StepNextLogo';

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
  const workspaceItems: { id: TabType; label: string; sublabel: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Dashboard', sublabel: 'Where am I?', icon: <Home className="w-4 h-4 text-[#635BFF]" /> },
    { id: 'digital_twin', label: 'My Digital Twin', sublabel: 'Who am I?', icon: <Brain className="w-4 h-4 text-purple-600" /> },
    { id: 'current_state', label: 'Current State', sublabel: 'How am I?', icon: <Activity className="w-4 h-4 text-[#FF7A6B]" /> },
    { id: 'simulator', label: 'Future Simulator', sublabel: 'Where could I go?', icon: <Compass className="w-4 h-4 text-[#32C6A6]" /> }
  ];

  const simulatorSubSections = [
    { label: 'Simulator', sectionId: 'section-simulator', hint: 'Inputs' },
    { label: 'Roadmap', sectionId: 'section-roadmap', hint: '90-Day' },
    { label: 'Check-in', sectionId: 'section-checkin', hint: 'Actions' },
    { label: 'Progress', sectionId: 'section-progress', hint: 'Velocity' },
    { label: 'Adaptive Future', sectionId: 'section-adaptive-future', hint: 'Health' }
  ];

  const accountItems: { id: TabType; label: string; sublabel: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', sublabel: 'Account baseline', icon: <User className="w-4 h-4 text-[#667085]" /> }
  ];

  const handleNavClick = (tabId: TabType, sectionId?: string) => {
    if (onNavigateSection) {
      onNavigateSection(tabId, sectionId);
    } else {
      onTabChange(tabId);
    }
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FAF9F5] border-r border-[#E5E5DC] w-64 py-5 px-4 text-[#171827]">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-5 border-b border-[#E5E5DC] mb-5">
        <StepNextLogo height="h-[54px]" />

        <button onClick={onCloseMobile} className="md:hidden p-1 text-[#667085] hover:text-[#171827]">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Links */}
      <div className="space-y-6 flex-1 overflow-y-auto">
        {/* WORKSPACE */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase text-[#98A2B3] tracking-wider px-2 mb-2">
            WORKSPACE
          </p>
          {workspaceItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => handleNavClick(item.id, item.id === 'simulator' ? 'section-simulator' : undefined)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-[#635BFF]/10 text-[#635BFF] font-semibold border-l-2 border-l-[#635BFF] shadow-sm'
                      : 'hover:bg-white text-[#667085] hover:text-[#171827]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="shrink-0">{item.icon}</span>
                    <div className="text-left">
                      <span className="block font-semibold">{item.label}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#98A2B3] font-normal">{item.sublabel}</span>
                </button>

                {/* Sub-sections for Future Simulator */}
                {item.id === 'simulator' && (
                  <div className="ml-5 pl-2.5 border-l-2 border-[#32C6A6]/30 my-1 space-y-0.5">
                    {simulatorSubSections.map((sub) => (
                      <button
                        key={sub.sectionId}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavClick('simulator', sub.sectionId);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#667085] hover:text-[#635BFF] hover:bg-white transition-all text-left"
                      >
                        <span className="font-semibold">{sub.label}</span>
                        <span className="text-[9px] font-mono text-[#98A2B3]">{sub.hint}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ACCOUNT */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase text-[#98A2B3] tracking-wider px-2 mb-2">
            ACCOUNT
          </p>
          {accountItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                  isActive
                    ? 'bg-[#635BFF]/10 text-[#635BFF] font-semibold border-l-2 border-l-[#635BFF] shadow-sm'
                    : 'hover:bg-white text-[#667085] hover:text-[#171827]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="shrink-0">{item.icon}</span>
                  <span className="font-semibold">{item.label}</span>
                </div>
                <span className="text-[10px] text-[#98A2B3] font-normal">{item.sublabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Footer */}
      <div className="pt-4 border-t border-[#E5E5DC]">
        <div
          onClick={() => {
            onTabChange('profile');
            onCloseMobile();
          }}
          className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#E5E5DC] hover:border-[#D1D1C7] cursor-pointer transition light-card-shadow"
        >
          <div className="w-8 h-8 rounded-full bg-[#635BFF]/15 border border-[#635BFF]/30 flex items-center justify-center text-[#635BFF] text-xs font-bold shrink-0">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-[#171827] truncate">
              {profile?.name || 'User Profile'}
            </p>
            <p className="text-[10px] text-[#667085] truncate">
              {profile?.education || profile?.career_goal || 'Student / Professional'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
