import React, { useState } from 'react';
import { Home, Compass, User, X, Brain, Sparkles, ChevronRight, Target } from 'lucide-react';
import { UserProfile, HealthResponse } from '../../types/schema';
import { StepNextLogo } from '../common/StepNextLogo';
import { Avatar } from '../ui/avatar';

export type TabType = 'overview' | 'digital_twin' | 'current_state' | 'simulator' | 'profile';

interface SidebarProps {
  activeTab: TabType;
  activeSection?: string;
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
  activeSection,
  onTabChange,
  onNavigateSection,
  profile,
  health,
  onOpenOnboarding,
  isOpenMobile,
  onCloseMobile
}) => {
  const [localSectionId, setLocalSectionId] = useState<string | undefined>(undefined);
  const currentSection = activeSection || localSectionId;

  const handleNavClick = (tabId: TabType, sectionId?: string) => {
    setLocalSectionId(sectionId);
    if (onNavigateSection) {
      onNavigateSection(tabId, sectionId);
    } else {
      onTabChange(tabId);
    }
    onCloseMobile();
  };

  const navigationGroups = [
    {
      groupTitle: 'WORKSPACE',
      items: [
        {
          id: 'overview',
          label: 'Dashboard',
          tabId: 'overview' as TabType,
          icon: <Home className="w-4 h-4" />,
          accent: 'text-[#5850EC]',
          children: []
        },
        {
          id: 'my_profile',
          label: 'My Profile',
          icon: <User className="w-4 h-4" />,
          accent: 'text-purple-600',
          children: [
            { label: 'Digital Twin', tabId: 'digital_twin' as TabType, hint: 'Cognitive' },
            { label: 'Current State', tabId: 'current_state' as TabType, hint: 'Risk Matrix' }
          ]
        },
        {
          id: 'future_simulator',
          label: 'Future Simulator',
          icon: <Compass className="w-4 h-4" />,
          accent: 'text-[#10B981]',
          children: [
            { label: 'Scenarios', tabId: 'simulator' as TabType, sectionId: 'section-scenarios', hint: 'Trajectories' },
            { label: 'Inputs', tabId: 'simulator' as TabType, sectionId: 'section-inputs', hint: 'Sliders' },
            { label: 'Comparison', tabId: 'simulator' as TabType, sectionId: 'section-comparison', hint: 'Evaluation' }
          ]
        }
      ]
    },
    {
      groupTitle: 'MY PLAN',
      items: [
        {
          id: 'my_plan',
          label: 'My Plan',
          icon: <Target className="w-4 h-4" />,
          accent: 'text-[#5850EC]',
          children: [
            { label: '90-Day Roadmap', tabId: 'simulator' as TabType, sectionId: 'section-roadmap', hint: 'Actions' },
            { label: 'Milestones', tabId: 'simulator' as TabType, sectionId: 'section-milestones', hint: 'Phases' },
            { label: 'Execution', tabId: 'simulator' as TabType, sectionId: 'section-progress', hint: 'Tracking' }
          ]
        }
      ]
    },
    {
      groupTitle: 'INSIGHTS',
      items: [
        {
          id: 'insights',
          label: 'Insights',
          icon: <Sparkles className="w-4 h-4" />,
          accent: 'text-[#F59E0B]',
          children: [
            { label: 'Progress Intelligence', tabId: 'simulator' as TabType, sectionId: 'section-progress-intelligence', hint: 'Analytics' },
            { label: 'Adaptive Future', tabId: 'simulator' as TabType, sectionId: 'section-adaptive-future', hint: 'Feedback' },
            { label: 'Velocity', tabId: 'simulator' as TabType, sectionId: 'section-velocity', hint: 'Streak' },
            { label: 'Confidence', tabId: 'simulator' as TabType, sectionId: 'section-confidence', hint: 'Score' }
          ]
        }
      ]
    }
  ];

  const preferencesItems = [
    { id: 'profile' as TabType, label: 'Profile & Goals', icon: <User className="w-4 h-4 text-slate-500" /> }
  ];

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
      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
        {navigationGroups.map((group, gIdx) => (
          <div key={gIdx} className={`space-y-1 ${gIdx > 0 ? 'pt-3 border-t border-black/[0.06]' : ''}`}>
            <p className="text-[9px] font-mono font-bold uppercase text-slate-400 tracking-[0.18em] px-3 mb-2 flex items-center justify-between">
              <span>{group.groupTitle}</span>
              {gIdx === 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />}
            </p>

            {group.items.map((item) => {
              const itemTabId = 'tabId' in item ? (item as any).tabId : undefined;
              const isDirectActive = itemTabId && activeTab === itemTabId && !item.children.length;

              return (
                <div key={item.id} className="space-y-0.5">
                  {/* Parent Section Header / Direct Link */}
                  {itemTabId && !item.children.length ? (
                    <button
                      onClick={() => handleNavClick(itemTabId)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs transition-all duration-200 ${
                        isDirectActive
                          ? 'bg-[#EEF2FF] text-[#5850EC] font-bold shadow-[0_2px_12px_rgba(99,102,241,0.12)] border border-[#5850EC]/20'
                          : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`shrink-0 ${isDirectActive ? 'text-[#5850EC]' : item.accent}`}>{item.icon}</span>
                        <span className="block font-semibold">{item.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isDirectActive ? 'text-[#5850EC] translate-x-0.5' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} />
                    </button>
                  ) : (
                    <div className="pt-1">
                      <div className="flex items-center gap-2.5 px-3 py-1.5 text-xs font-extrabold text-[#0F172A] uppercase tracking-wider font-mono">
                        <span className={item.accent}>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>

                      {/* Sub-items */}
                      <div className="ml-5 pl-2.5 border-l border-black/[0.08] my-1 space-y-0.5">
                        {item.children.map((child, cIdx) => {
                          const isChildActive = activeTab === child.tabId && (
                            !child.sectionId
                              ? (!currentSection || currentSection === 'section-simulator')
                              : (currentSection === child.sectionId || (currentSection === 'section-simulator' && child.sectionId === 'section-scenarios'))
                          );

                          return (
                            <button
                              key={cIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavClick(child.tabId, child.sectionId);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-all text-left ${
                                isChildActive
                                  ? 'bg-[#EEF2FF] text-[#5850EC] font-bold shadow-xs border border-[#5850EC]/20'
                                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <span className="font-semibold">{child.label}</span>
                              <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">{child.hint}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* PREFERENCES SECTION */}
        <div className="space-y-1 pt-2">
          <p className="text-[9px] font-mono font-bold uppercase text-slate-400 tracking-[0.18em] px-3 mb-2">
            PREFERENCES
          </p>
          {preferencesItems.map((item) => {
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
