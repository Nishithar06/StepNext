import React, { useState } from 'react';
import { Sidebar, TabType } from './Sidebar';
import { Topbar } from './Topbar';
import { HealthResponse, UserProfile } from '../../types/schema';

interface AppShellProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onNavigateSection?: (tab: TabType, sectionId?: string) => void;
  health: HealthResponse | null;
  apiConnected: boolean;
  profile: UserProfile | null;
  onOpenOnboarding: () => void;
  onRefreshData: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onTabChange,
  onNavigateSection,
  health,
  apiConnected,
  profile,
  onOpenOnboarding,
  onRefreshData,
  children
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex taste-grid-bg text-[#0F172A] antialiased selection:bg-[#5850EC] selection:text-white">
      {/* Desktop & Mobile Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        onNavigateSection={onNavigateSection}
        profile={profile}
        health={health}
        onOpenOnboarding={onOpenOnboarding}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          activeTab={activeTab}
          health={health}
          apiConnected={apiConnected}
          profile={profile}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onRefreshData={onRefreshData}
        />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
};
