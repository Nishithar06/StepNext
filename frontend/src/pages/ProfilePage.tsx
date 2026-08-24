import React from 'react';
import { UserProfile } from '../types/schema';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { User, Sparkles, RefreshCw } from 'lucide-react';

interface ProfilePageProps {
  profile: UserProfile | null;
  onOpenOnboarding: () => void;
  onResetProfile?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onOpenOnboarding, onResetProfile }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5DC] pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] font-mono">
            ACCOUNT
          </span>
          <h1 className="text-3xl font-extrabold text-[#171827] font-heading mt-0.5 flex items-center gap-2">
            <User className="w-6 h-6 text-[#635BFF]" /> Account & Profile
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Your baseline information, constraints, and personal priorities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={onOpenOnboarding} icon={<Sparkles className="w-3.5 h-3.5" />}>
            Edit Profile
          </Button>

          {onResetProfile && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onResetProfile}
              className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 font-bold"
              icon={<RefreshCw className="w-3.5 h-3.5 text-rose-500" />}
            >
              Reset Profile / Start Over
            </Button>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card level={2} title="Personal & Academic Baseline">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-[#E5E5DC] pb-2 text-[#171827]">
              <span className="text-[#667085]">Full Name</span>
              <span className="font-bold">{profile?.name || 'User'}</span>
            </div>
            <div className="flex justify-between border-b border-[#E5E5DC] pb-2 text-[#171827]">
              <span className="text-[#667085]">Education</span>
              <span className="font-medium text-[#667085]">{profile?.education || 'Not specified'}</span>
            </div>
            <div className="flex justify-between border-b border-[#E5E5DC] pb-2 text-[#171827]">
              <span className="text-[#667085]">Career Goal</span>
              <span className="font-bold text-[#635BFF]">{profile?.career_goal || 'Software & AI Engineer'}</span>
            </div>
            <div className="flex justify-between text-[#171827] pt-1">
              <span className="text-[#667085]">Financial Priority</span>
              <span className="font-mono font-bold text-[#B5861E]">{profile?.financial_priority ?? 7} / 10</span>
            </div>
          </div>
        </Card>

        <Card level={2} title="Capacity & Priorities">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-[#E5E5DC] pb-2 text-[#171827]">
              <span className="text-[#667085]">Available Daily Buffer</span>
              <span className="font-mono font-bold">{profile?.available_hours_per_day ?? 6.0} hours/day</span>
            </div>
            <div className="flex justify-between border-b border-[#E5E5DC] pb-2 text-[#171827]">
              <span className="text-[#667085]">Sleep Duration</span>
              <span className="font-mono font-medium">{profile?.sleep_hours ?? 7.0} hours/night</span>
            </div>
            <div className="flex justify-between border-b border-[#E5E5DC] pb-2 text-[#171827]">
              <span className="text-[#667085]">Workload Rating</span>
              <span className="font-bold text-[#D84B3B] uppercase">{profile?.workload ?? 'MEDIUM'}</span>
            </div>
            <div className="flex justify-between text-[#171827] pt-1">
              <span className="text-[#667085]">Active Commitments</span>
              <span className="font-mono font-bold text-purple-700">{profile?.major_commitments?.length ?? 0} tracks</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Skills Summary Card */}
      <Card level={2} title="SKILLS & FOCUS AREAS">
        <div className="space-y-4 text-xs">
          <div>
            <span className="text-[#667085] font-bold uppercase tracking-wider block mb-2">Current Skills</span>
            <div className="flex flex-wrap gap-1.5">
              {profile?.skills?.map((sk, i) => (
                <Badge key={i} variant="green">{sk}</Badge>
              )) || <Badge variant="green">Python, React, FastAPI</Badge>}
            </div>
          </div>

          <div>
            <span className="text-[#667085] font-bold uppercase tracking-wider block mb-2">Skills to Develop</span>
            <div className="flex flex-wrap gap-1.5">
              {profile?.skills_to_improve?.map((sk, i) => (
                <Badge key={i} variant="indigo">{sk}</Badge>
              )) || <Badge key={i} variant="indigo">DSA, System Design</Badge>}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

