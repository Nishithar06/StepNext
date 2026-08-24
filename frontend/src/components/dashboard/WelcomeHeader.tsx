import React from 'react';
import { UserProfile } from '../../types/schema';

interface WelcomeHeaderProps {
  profile: UserProfile | null;
  onOpenOnboarding: () => void;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ profile, onOpenOnboarding }) => {
  const name = profile?.name ? profile.name.split(' ')[0] : 'Nishitha';

  // Greeting based on time of day
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-heading">
          {timeGreeting}, {name}.
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
          Here's a snapshot of where you are and what deserves your attention today.
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <span className="text-xs text-slate-400 bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-lg">
          Goal: <strong className="text-slate-200">{profile?.career_goal || 'AI Engineer'}</strong>
        </span>
      </div>
    </div>
  );
};
