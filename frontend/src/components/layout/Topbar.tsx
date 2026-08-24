import React from 'react';
import { Menu, RefreshCw, ChevronRight } from 'lucide-react';
import { HealthResponse, UserProfile } from '../../types/schema';
import { Badge } from '../common/Badge';
import { TabType } from './Sidebar';

interface TopbarProps {
  activeTab: TabType;
  health: HealthResponse | null;
  apiConnected: boolean;
  profile: UserProfile | null;
  onOpenMobileMenu: () => void;
  onRefreshData: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  health,
  apiConnected,
  profile,
  onOpenMobileMenu,
  onRefreshData
}) => {
  const getPageTitle = (tab: TabType) => {
    switch (tab) {
      case 'overview': return 'Dashboard';
      case 'digital_twin': return 'My Digital Twin';
      case 'current_state': return 'Current State';
      case 'simulator': return 'Future Simulator';
      case 'profile': return 'Profile & Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#F7F7F2]/90 backdrop-blur-md border-b border-[#E5E5DC] px-4 lg:px-8 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page context */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 rounded-lg bg-white border border-[#E5E5DC] text-[#667085] hover:text-[#171827]"
          >
            <Menu className="w-5 h-5" />
          </button>

          <span className="text-[#667085] font-medium">StepNext</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#98A2B3]" />
          <span className="font-bold text-[#171827] font-heading">
            {getPageTitle(activeTab)}
          </span>
        </div>

        {/* Right: User Avatar & Actions */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#171827] hidden sm:inline-block">
              {profile?.name ? profile.name.split(' ')[0] : 'User'}
            </span>
            <div className="w-7 h-7 rounded-full bg-[#635BFF]/10 border border-[#635BFF]/30 flex items-center justify-center text-[#635BFF] font-bold text-xs">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>

          <button
            onClick={onRefreshData}
            className="p-1.5 rounded-lg bg-white hover:bg-[#FAF9F5] border border-[#E5E5DC] text-[#667085] hover:text-[#171827] transition"
            title="Refresh telemetry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
