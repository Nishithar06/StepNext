import React from 'react';
import { Menu, RefreshCw, ChevronRight, Sparkles, CheckCircle2, LogOut } from 'lucide-react';
import { HealthResponse, UserProfile } from '../../types/schema';
import { TabType } from './Sidebar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';

interface TopbarProps {
  activeTab: TabType;
  health: HealthResponse | null;
  apiConnected: boolean;
  profile: UserProfile | null;
  onOpenMobileMenu: () => void;
  onRefreshData: () => void;
  onSignOut?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  health,
  apiConnected,
  profile,
  onOpenMobileMenu,
  onRefreshData,
  onSignOut
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

  const isGeminiLive = health?.gemini_connected && health?.api_key_configured;

  return (
    <header className="sticky top-0 z-30 bg-[#F7F7F2]/90 backdrop-blur-md border-b border-[#E5E5DC] px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={onOpenMobileMenu}
            className="md:hidden"
          >
            <Menu className="w-4 h-4" />
          </Button>

          <span className="text-[#667085] font-medium hidden sm:inline-block">StepNext</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#98A2B3] hidden sm:inline-block" />
          <span className="font-bold text-[#171827] font-heading text-sm">
            {getPageTitle(activeTab)}
          </span>
        </div>

        {/* Right: AI Mode Pill, User Chip & Refresh */}
        <div className="flex items-center gap-3">
          {/* AI Intelligence Mode Indicator */}
          {isGeminiLive ? (
            <Badge variant="indigo" size="default" className="font-mono font-bold flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#635BFF] animate-pulse" />
              <span>Gemini 2.0 AI Live</span>
            </Badge>
          ) : (
            <Badge variant="success" size="default" className="font-mono font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#32C6A6]" />
              <span>Offline Fallback Active</span>
            </Badge>
          )}

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E5E5DC]">
            <span className="font-semibold text-[#171827] text-xs hidden sm:inline-block">
              {profile?.name ? profile.name.split(' ')[0] : 'User'}
            </span>
            <Avatar
              fallback={profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              size="sm"
              status="online"
            />
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                title="Sign out of StepNext"
                className="p-1 rounded-md text-[#667085] hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={onRefreshData}
            title="Refresh telemetry sync"
            className="text-[#667085] hover:text-[#171827]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
