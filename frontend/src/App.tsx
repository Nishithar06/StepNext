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
import { AuthPage } from './components/auth/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { AlertCircle, RefreshCw, Compass } from 'lucide-react';
import { Button } from './components/common/Button';

import {
  getActiveUserId,
  setActiveUserId as saveActiveUserIdToStorage,
  clearActiveUserId as clearActiveUserIdFromStorage
} from './services/userService';

const MainAppContent: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const activeUserId = user?.id || getActiveUserId();

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
      setProfile(null);
      setDigitalTwin(null);
      setOverloadScore(null);
      setSimulationData(null);
      setTodayCheckIn(null);
      setCheckInSummary(null);
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
        console.log(`[Profile] Current user ID: ${uid}`);
        console.log(`[Profile] Fetching saved profile...`);
        const prof = await fetchProfile(uid);
        console.log(`[Profile] Profile found: true (user_id=${prof.user_id}, goal=${prof.career_goal})`);
        if (prof && prof.career_goal && prof.career_goal.trim().length > 0) {
          setProfile(prof);
          setIsOnboardingOpen(false);
        } else {
          setProfile(prof);
          setIsOnboardingOpen(true);
        }

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
        setDigitalTwin(null);
        setOverloadScore(null);
        setSimulationData(null);
        setTodayCheckIn(null);
        setCheckInSummary(null);

        const isNotFound = profErr?.status === 404 || profErr?.message?.includes('404');
        if (isNotFound) {
          console.info(`[Profile] Profile for user ID '${uid}' not found (404). Opening onboarding wizard.`);
          setProfile(null);
          setIsOnboardingOpen(true);
        } else {
          console.error(`[Profile] Error fetching profile for user ID '${uid}':`, profErr);
          setError(profErr.message || 'Unable to connect to StepNext backend service.');
          setProfile(null);
          setIsOnboardingOpen(false);
        }
      }

    } catch (err: any) {
      setError(err.message || 'Unable to fetch telemetry data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && activeUserId) {
      saveActiveUserIdToStorage(activeUserId);
      loadData(activeUserId);
    } else {
      setLoading(false);
    }
  }, [user, activeUserId]);

  // If Auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0B0C14] flex flex-col justify-center items-center">
        <Compass className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <p className="text-xs text-slate-400 font-mono">Authenticating with StepNext...</p>
      </div>
    );
  }

  // Protected Route Guard: If not logged in, render Auth Page
  if (!user) {
    return <AuthPage />;
  }

  // Handlers
  const handleSaveProfile = async (newProfile: UserProfile) => {
    const profileToSave = { ...newProfile, user_id: activeUserId || newProfile.user_id };
    console.log(`[Profile] Saving profile for user_id=${profileToSave.user_id}...`);
    const savedProf = await saveProfile(profileToSave);
    const persistentUid = savedProf?.user_id || profileToSave.user_id;
    console.log(`[Profile] Profile saved successfully for user_id=${persistentUid}`);
    saveActiveUserIdToStorage(persistentUid);
    setIsOnboardingOpen(false);
    await loadData(persistentUid);
  };

  const handleResetProfile = () => {
    if (window.confirm("Are you sure you want to re-run onboarding for your account?")) {
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
      onSignOut={signOut}
    >
      {/* Banner when operating in Offline / Local Store Mode */}
      {health && !health.supabase_connected && (
        <div className="text-[#171827] p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Local Storage Mode Active:</strong> Data saved locally for authenticated user.
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
          if (profile) setIsOnboardingOpen(false);
        }}
        initialProfile={profile || { user_id: activeUserId || '', name: user.user_metadata?.name || user.email?.split('@')[0] || 'StepNext User' } as UserProfile}
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

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};
