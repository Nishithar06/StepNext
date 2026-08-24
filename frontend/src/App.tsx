import React, { useEffect, useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { TabType } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { CurrentStatePage } from './pages/CurrentStatePage';
import { SimulatorPage } from './pages/SimulatorPage';
import { ProfilePage } from './pages/ProfilePage';
import { OnboardingModal } from './components/OnboardingModal';
import { CheckInModal } from './components/CheckInModal';
import {
  fetchPing,
  fetchHealth,
  fetchProfile,
  saveProfile,
  fetchDigitalTwin,
  generateDigitalTwin,
  fetchOverloadScore,
  recalculateOverloadScore,
  runSimulation,
  fetchScenarios,
  fetchTodayCheckIn,
  saveCheckIn,
  updateTodayCheckIn,
  fetchCheckInSummary
} from './api/client';
import {
  UserProfile,
  DerivedProfile,
  OverloadScore,
  SimulationResponse,
  HealthResponse,
  ScenarioInput,
  DailyCheckIn,
  DailyCheckInInput,
  CheckInSummary
} from './types/schema';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './components/common/Button';

import {
  getActiveUserId,
  setActiveUserId as saveActiveUserIdToStorage,
  clearActiveUserId as clearActiveUserIdFromStorage
} from './services/userService';

export const App: React.FC = () => {
  const [activeUserId, setActiveUserId] = useState<string | null>(getActiveUserId());

  const updateActiveUserId = (uid: string | null) => {
    if (uid) {
      saveActiveUserIdToStorage(uid);
    } else {
      clearActiveUserIdFromStorage();
    }
    setActiveUserId(uid);
  };
  
  // Data State
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [apiConnected, setApiConnected] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [digitalTwin, setDigitalTwin] = useState<DerivedProfile | null>(null);
  const [overloadScore, setOverloadScore] = useState<OverloadScore | null>(null);
  const [simulationData, setSimulationData] = useState<SimulationResponse | null>(null);
  
  // Daily Check-in State
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null);
  const [checkInSummary, setCheckInSummary] = useState<CheckInSummary | null>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Core Telemetry Data for targetUserId (or activeUserId)
  const loadData = async (targetUserId?: string | null) => {
    const uid = targetUserId !== undefined ? targetUserId : activeUserId;

    if (!uid) {
      // First-time user: No profile in localStorage
      setProfile(null);
      setDigitalTwin(null);
      setOverloadScore(null);
      setSimulationData(null);
      setTodayCheckIn(null);
      setCheckInSummary(null);
      setIsOnboardingOpen(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      try {
        await fetchPing();
        setApiConnected(true);
      } catch {
        setApiConnected(false);
      }

      try {
        const hData = await fetchHealth();
        setHealth(hData);
      } catch {
        setHealth(null);
      }

      // Fetch user profile for active user ID
      try {
        const prof = await fetchProfile(uid);
        setProfile(prof);

        // Fetch telemetry in parallel / sequence for valid active user
        try {
          const dt = await fetchDigitalTwin(uid);
          setDigitalTwin(dt);
        } catch (err) {
          console.warn('Digital Twin notice:', err);
        }

        try {
          const tc = await fetchTodayCheckIn(uid);
          setTodayCheckIn(tc);
        } catch (err) {
          console.warn('Today check-in notice:', err);
        }

        try {
          const cs = await fetchCheckInSummary(uid);
          setCheckInSummary(cs);
        } catch (err) {
          console.warn('Check-in summary notice:', err);
        }

        try {
          const ov = await fetchOverloadScore(uid);
          setOverloadScore(ov);
        } catch (err) {
          console.warn('Overload notice:', err);
        }

        try {
          const sc = await fetchScenarios(uid);
          setSimulationData(sc);
        } catch (err) {
          console.warn('Scenarios notice:', err);
        }

      } catch (profErr: any) {
        // Saved user ID is invalid/nonexistent on backend -> clear and open onboarding
        console.warn(`Saved active user ID '${uid}' not found. Resetting state.`);
        updateActiveUserId(null);
        setProfile(null);
        setDigitalTwin(null);
        setOverloadScore(null);
        setSimulationData(null);
        setTodayCheckIn(null);
        setCheckInSummary(null);
        setIsOnboardingOpen(true);
      }

    } catch (err: any) {
      setError(err.message || 'Unable to fetch telemetry data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeUserId]);

  // Handlers
  const handleSaveProfile = async (newProfile: UserProfile) => {
    await saveProfile(newProfile);
    updateActiveUserId(newProfile.user_id);
    setIsOnboardingOpen(false);
    await loadData(newProfile.user_id);
  };

  const handleResetProfile = () => {
    if (window.confirm("Are you sure you want to reset your local profile? This will start onboarding over.")) {
      updateActiveUserId(null);
      setProfile(null);
      setDigitalTwin(null);
      setOverloadScore(null);
      setSimulationData(null);
      setTodayCheckIn(null);
      setCheckInSummary(null);
      setIsOnboardingOpen(true);
    }
  };

  const handleSaveCheckIn = async (inputData: DailyCheckInInput) => {
    if (!activeUserId) return;
    let savedCheckIn: DailyCheckIn;
    if (todayCheckIn) {
      savedCheckIn = await updateTodayCheckIn(inputData, activeUserId);
    } else {
      savedCheckIn = await saveCheckIn(inputData, activeUserId);
    }
    if (profile) {
      setProfile(prev => prev ? { ...prev, sleep_hours: savedCheckIn.sleep_duration } : null);
    }
    await loadData(activeUserId);
  };

  const handleRefreshDigitalTwin = async () => {
    if (!activeUserId) return;
    const dt = await generateDigitalTwin(activeUserId);
    setDigitalTwin(dt);
  };

  const handleRecalculateOverload = async () => {
    if (!activeUserId) return;
    const ov = await recalculateOverloadScore(activeUserId);
    setOverloadScore(ov);
  };

  const handleRunSimulation = async (scenarios: ScenarioInput[], selectedScenario?: string) => {
    if (!activeUserId) return;
    const simRes = await runSimulation(activeUserId, scenarios, selectedScenario);
    setSimulationData(simRes);
  };

  const handleNavigateSection = (tab: TabType, sectionId?: string) => {
    setActiveTab(tab);
    
    if (!sectionId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const attemptScroll = (attemptsLeft = 15) => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (attemptsLeft > 0) {
        setTimeout(() => attemptScroll(attemptsLeft - 1), 60);
      }
    };

    setTimeout(() => attemptScroll(), 50);
  };

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onNavigateSection={handleNavigateSection}
      health={health}
      apiConnected={apiConnected}
      profile={profile}
      onOpenOnboarding={() => setIsOnboardingOpen(true)}
      onRefreshData={() => loadData(activeUserId)}
    >
      {/* Banner when operating in Offline / Local Store Mode */}
      {health && !health.supabase_connected && (
        <div className="text-[#171827] p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Local Storage Mode Active:</strong> Data saved locally for active user: <code>{activeUserId || 'New User'}</code>.
            </span>
          </div>
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="text-amber-400 font-semibold hover:underline shrink-0 text-xs"
          >
            Edit Profile
          </button>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between gap-3">
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => loadData(activeUserId)} icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Try Again
          </Button>
        </div>
      )}

      {/* DEDICATED PAGE VIEWS */}
      {activeTab === 'overview' && (
        <DashboardPage
          profile={profile}
          digitalTwin={digitalTwin}
          overloadScore={overloadScore}
          simulationData={simulationData}
          todayCheckIn={todayCheckIn}
          checkInSummary={checkInSummary}
          onNavigateTab={setActiveTab}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenCheckInModal={() => setIsCheckInOpen(true)}
        />
      )}

      {activeTab === 'digital_twin' && (
        <DigitalTwinPage
          digitalTwin={digitalTwin}
          profile={profile}
          loading={loading}
          onRefreshTwin={handleRefreshDigitalTwin}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />
      )}

      {activeTab === 'current_state' && (
        <CurrentStatePage
          overloadScore={overloadScore}
          profile={profile}
          loading={loading}
          todayCheckIn={todayCheckIn}
          onRecalculate={handleRecalculateOverload}
          onOpenCheckInModal={() => setIsCheckInOpen(true)}
        />
      )}

      {activeTab === 'simulator' && (
        <SimulatorPage
          simulationData={simulationData}
          loading={loading}
          onRunSimulation={handleRunSimulation}
          profile={profile}
          overloadScore={overloadScore}
        />
      )}

      {activeTab === 'profile' && (
        <ProfilePage
          profile={profile}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onResetProfile={handleResetProfile}
        />
      )}

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => {
          if (activeUserId) setIsOnboardingOpen(false);
        }}
        initialProfile={profile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Daily Check-in Modal */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        todayCheckIn={todayCheckIn}
        onSaveCheckIn={handleSaveCheckIn}
      />
    </AppShell>
  );
};

